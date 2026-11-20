-- Shard purchases are separate from the retired token presale. Service-only fulfillment.
begin;
create table if not exists public.dv_shard_packages81(id text primary key,shards integer not null check(shards>0),cents integer not null check(cents>0),currency text not null check(currency='EUR'),active boolean not null default true);
insert into public.dv_shard_packages81(id,shards,cents,currency) values('shards-150',150,199,'EUR'),('shards-800',800,999,'EUR'),('shards-1800',1800,1999,'EUR') on conflict(id) do update set shards=excluded.shards,cents=excluded.cents,currency=excluded.currency;
create table if not exists public.dv_shard_orders81(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references public.dv_profiles(user_id),request_id uuid not null,product_id text not null references public.dv_shard_packages81(id),
 environment text not null check(environment in('sandbox','live')),shards integer not null check(shards>0),cents integer not null check(cents>0),currency text not null check(currency='EUR'),
 paypal_order_id text unique,capture_request_id uuid not null default gen_random_uuid(),capture_id text unique,status text not null default 'created' check(status in('created','completed','partially_refunded','refunded','reversed')),
 refunded_cents integer not null default 0 check(refunded_cents>=0 and refunded_cents<=cents),revoked_shards integer not null default 0 check(revoked_shards>=0 and revoked_shards<=shards),
 created_at timestamptz not null default now(),completed_at timestamptz,unique(user_id,request_id,environment)
);
create index if not exists dv_shard_orders_user81 on public.dv_shard_orders81(user_id,created_at desc);
create table if not exists public.dv_shard_adjustments81(event_id text primary key,order_id uuid not null references public.dv_shard_orders81(id),kind text not null check(kind in('refund','reversal')),cents integer not null check(cents>0),created_at timestamptz not null default now());
create table if not exists public.dv_shard_debt81(user_id uuid primary key references public.dv_profiles(user_id),shards bigint not null default 0 check(shards>=0));
alter table public.dv_shard_packages81 enable row level security;alter table public.dv_shard_orders81 enable row level security;alter table public.dv_shard_adjustments81 enable row level security;alter table public.dv_shard_debt81 enable row level security;
drop policy if exists dv_shard_packages_public81 on public.dv_shard_packages81;create policy dv_shard_packages_public81 on public.dv_shard_packages81 for select to anon,authenticated using(active);
drop policy if exists dv_shard_orders_own81 on public.dv_shard_orders81;create policy dv_shard_orders_own81 on public.dv_shard_orders81 for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.dv_shard_packages81,public.dv_shard_orders81,public.dv_shard_adjustments81,public.dv_shard_debt81 from public,anon,authenticated;
grant select on public.dv_shard_packages81 to anon,authenticated;grant select on public.dv_shard_orders81 to authenticated;
grant all on public.dv_shard_packages81,public.dv_shard_orders81,public.dv_shard_adjustments81,public.dv_shard_debt81 to service_role;
create or replace function public.dv_prepare_shard_order81(p_user uuid,p_request uuid,p_product text,p_environment text) returns jsonb language plpgsql security definer set search_path='' as $$
declare old public.dv_shard_orders81%rowtype;pack public.dv_shard_packages81%rowtype;
begin
 if p_user is null or p_request is null or p_environment is null or p_environment not in('sandbox','live') then raise exception 'Invalid payment request';end if;
 perform 1 from public.dv_profiles where user_id=p_user for update;if not found then raise exception 'Initialize account first';end if;
 select * into old from public.dv_shard_orders81 where user_id=p_user and request_id=p_request and environment=p_environment;
 if found then if old.product_id is distinct from p_product then raise exception 'Payment request already used';end if;return to_jsonb(old);end if;
 select * into pack from public.dv_shard_packages81 where id=p_product and active;if not found then raise exception 'Unknown Shard package';end if;
 if (select count(*) from public.dv_shard_orders81 where user_id=p_user and environment=p_environment and status='created' and created_at>now()-interval '15 minutes')>=5 then raise exception 'Too many pending purchases';end if;
 insert into public.dv_shard_orders81(user_id,request_id,product_id,environment,shards,cents,currency) values(p_user,p_request,p_product,p_environment,pack.shards,pack.cents,pack.currency) returning * into old;return to_jsonb(old);
end;$$;
create or replace function public.dv_attach_paypal_order81(p_user uuid,p_id uuid,p_paypal text) returns jsonb language plpgsql security definer set search_path='' as $$
declare item public.dv_shard_orders81%rowtype;
begin
 select * into item from public.dv_shard_orders81 where id=p_id and user_id=p_user for update;if not found or p_paypal is null or p_paypal!~'^[A-Z0-9]{10,40}$' then raise exception 'Invalid payment order';end if;
 if item.paypal_order_id is not null and item.paypal_order_id is distinct from p_paypal then raise exception 'Provider order already assigned';end if;
 update public.dv_shard_orders81 set paypal_order_id=p_paypal where id=p_id returning * into item;return to_jsonb(item);
end;$$;
create or replace function public.dv_complete_shard_order81(p_user uuid,p_id uuid,p_paypal text,p_capture text,p_cents integer,p_currency text,p_environment text) returns jsonb language plpgsql security definer set search_path='' as $$
declare item public.dv_shard_orders81%rowtype;debt bigint;settled bigint;credit bigint:=0;balance bigint;replayed boolean;
begin
 -- Every operation locks profile -> order -> wallet, matching booster/deck transactions.
 perform 1 from public.dv_profiles where user_id=p_user for update;if not found then raise exception 'Account unavailable';end if;
 select * into item from public.dv_shard_orders81 where id=p_id and user_id=p_user for update;if not found then raise exception 'Payment unavailable';end if;
 if item.paypal_order_id is distinct from p_paypal or item.cents is distinct from p_cents or item.currency is distinct from p_currency or item.environment is distinct from p_environment or p_capture is null or p_capture!~'^[A-Z0-9]{10,40}$' then raise exception 'Payment receipt mismatch';end if;
 replayed:=item.completed_at is not null;
 if replayed then if item.capture_id is distinct from p_capture then raise exception 'Capture already assigned';end if;
 else
  if item.status<>'created' then raise exception 'Payment cannot be fulfilled';end if;
  update public.dv_shard_orders81 set capture_id=p_capture,status='completed',completed_at=now() where id=p_id;
  if item.environment='live' then
   select premium into balance from public.dv_wallets where user_id=p_user for update;if not found then raise exception 'Wallet unavailable';end if;
   select shards into debt from public.dv_shard_debt81 where user_id=p_user;settled:=least(item.shards,coalesce(debt,0));credit:=item.shards-settled;
   if settled>0 then update public.dv_shard_debt81 set shards=shards-settled where user_id=p_user;end if;
   if credit>0 then update public.dv_wallets set premium=premium+credit where user_id=p_user;insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values(p_user,'paypal81:'||p_id,'premium',credit);end if;
  end if;
 end if;
 select premium into balance from public.dv_wallets where user_id=p_user;
 return jsonb_build_object('id',p_id,'status',case when replayed then item.status else 'completed' end,'replayed',replayed,'sandbox',item.environment='sandbox','shards',item.shards,'credited',credit,'balance',balance);
end;$$;
create or replace function public.dv_adjust_shard_payment81(p_capture text,p_event text,p_kind text,p_cents integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare item public.dv_shard_orders81%rowtype;who uuid;total integer;revoke_total integer;delta integer;available bigint;take bigint;old public.dv_shard_adjustments81%rowtype;
begin
 if p_event is null or char_length(p_event)>160 or p_kind is null or p_kind not in('refund','reversal') or p_cents is null or p_cents<=0 then raise exception 'Invalid payment adjustment';end if;
 select user_id into who from public.dv_shard_orders81 where capture_id=p_capture;if who is null then raise exception 'Unknown capture';end if;
 perform 1 from public.dv_profiles where user_id=who for update;select * into item from public.dv_shard_orders81 where capture_id=p_capture for update;
 select * into old from public.dv_shard_adjustments81 where event_id=p_event;if found then if old.order_id is distinct from item.id or old.kind is distinct from p_kind or old.cents is distinct from p_cents then raise exception 'Adjustment already used';end if;return jsonb_build_object('replayed',true);end if;
 if item.completed_at is null then raise exception 'Payment not fulfilled';end if;
 total:=case when p_kind='reversal' or item.refunded_cents=item.cents then item.cents else item.refunded_cents+p_cents end;
 if total>item.cents then raise exception 'Refund exceeds purchase';end if;
 revoke_total:=ceil(item.shards::numeric*total/item.cents)::integer;delta:=greatest(0,revoke_total-item.revoked_shards);
 if item.environment='live' and delta>0 then
  select premium into available from public.dv_wallets where user_id=who for update;take:=least(available,delta);
  if take>0 then update public.dv_wallets set premium=premium-take where user_id=who;insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values(who,'paypal81-adjust:'||p_event,'premium',-take);end if;
  if delta>take then insert into public.dv_shard_debt81(user_id,shards) values(who,delta-take) on conflict(user_id) do update set shards=public.dv_shard_debt81.shards+excluded.shards;end if;
 end if;
 update public.dv_shard_orders81 set refunded_cents=total,revoked_shards=revoke_total,status=case when p_kind='reversal' or status='reversed' then 'reversed' when total=cents then 'refunded' else 'partially_refunded' end where id=item.id;
 insert into public.dv_shard_adjustments81(event_id,order_id,kind,cents) values(p_event,item.id,p_kind,p_cents);return jsonb_build_object('replayed',false,'revoked',delta);
end;$$;
revoke all on function public.dv_prepare_shard_order81(uuid,uuid,text,text),public.dv_attach_paypal_order81(uuid,uuid,text),public.dv_complete_shard_order81(uuid,uuid,text,text,integer,text,text),public.dv_adjust_shard_payment81(text,text,text,integer) from public,anon,authenticated;
grant execute on function public.dv_prepare_shard_order81(uuid,uuid,text,text),public.dv_attach_paypal_order81(uuid,uuid,text),public.dv_complete_shard_order81(uuid,uuid,text,text,integer,text,text),public.dv_adjust_shard_payment81(text,text,text,integer) to service_role;
commit;
