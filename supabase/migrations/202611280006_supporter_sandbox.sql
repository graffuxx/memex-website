begin;

alter table public.dv_booster_purchases36 drop constraint dv_booster_purchases36_currency_check;
alter table public.dv_booster_purchases36 drop constraint dv_booster_purchases36_check;
alter table public.dv_booster_purchases36
  add constraint dv_booster_purchases36_currency_check check(currency in ('pixels','shards','starter','quest','supporter')),
  add constraint dv_booster_purchases36_check check(
    (currency='pixels' and cost=100) or (currency='shards' and cost=150)
    or (currency in ('starter','quest','supporter') and cost=0)
  );

insert into public.dv_identity_catalog85(kind,id,min_level,min_wins,source) values
 ('portrait','supporter-pixel-pigeon',1,0,'owned'),
 ('portrait','supporter-hype-goose',1,0,'owned'),
 ('portrait','supporter-rift-raccoon',1,0,'owned'),
 ('title','supporter-chaos-patron',1,0,'owned'),
 ('title','supporter-rift-keeper',1,0,'owned');

create table public.dv_supporter_packages(
 id text primary key,
 cents integer not null check(cents>0),
 boosters integer not null check(boosters between 1 and 5),
 portrait_id text not null,
 title_id text
);
insert into public.dv_supporter_packages(id,cents,boosters,portrait_id,title_id) values
 ('supporter-5',500,1,'supporter-pixel-pigeon',null),
 ('supporter-25',2500,3,'supporter-hype-goose','supporter-chaos-patron'),
 ('supporter-50',5000,5,'supporter-rift-raccoon','supporter-rift-keeper');

create table public.dv_supporter_orders(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.dv_profiles(user_id),
 request_id uuid not null,
 product_id text not null references public.dv_supporter_packages(id),
 environment text not null check(environment='sandbox'),
 cents integer not null check(cents>0),
 currency text not null default 'EUR' check(currency='EUR'),
 boosters integer not null check(boosters between 1 and 5),
 portrait_id text not null,
 title_id text,
 paypal_order_id text unique,
 capture_request_id uuid not null default gen_random_uuid(),
 capture_id text unique,
 status text not null default 'created' check(status in ('created','completed')),
 pack_ids uuid[] not null default '{}' check(cardinality(pack_ids)<=boosters),
 created_at timestamptz not null default now(),
 completed_at timestamptz,
 unique(user_id,request_id)
);
create index dv_supporter_orders_user on public.dv_supporter_orders(user_id,created_at desc);
alter table public.dv_supporter_orders enable row level security;
alter table public.dv_supporter_packages enable row level security;
revoke all on public.dv_supporter_orders,public.dv_supporter_packages from public,anon,authenticated;
grant select on public.dv_supporter_orders to service_role;

create function public.dv_prepare_supporter_order(p_user uuid,p_request uuid,p_product text,p_environment text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare item public.dv_supporter_orders%rowtype; pack public.dv_supporter_packages%rowtype;
begin
 if p_request is null or p_environment is distinct from 'sandbox' then raise exception 'Invalid test purchase';end if;
 perform 1 from public.dv_profiles where user_id=p_user for update;
 if not found then raise exception 'Initialize account first';end if;
 select * into item from public.dv_supporter_orders where user_id=p_user and request_id=p_request;
 if found then
  if item.product_id is distinct from p_product then raise exception 'Payment request already used';end if;
  return to_jsonb(item);
 end if;
 select * into pack from public.dv_supporter_packages where id=p_product;
 if not found then raise exception 'Unknown supporter package';end if;
 if (select count(*) from public.dv_supporter_orders where user_id=p_user and status='created'
     and created_at>now()-interval '15 minutes')>=5 then raise exception 'Too many pending purchases';end if;
 insert into public.dv_supporter_orders(user_id,request_id,product_id,environment,cents,boosters,portrait_id,title_id)
 values(p_user,p_request,pack.id,p_environment,pack.cents,pack.boosters,pack.portrait_id,pack.title_id)
 returning * into item;
 return to_jsonb(item);
end;$$;

create function public.dv_attach_supporter_order(p_user uuid,p_id uuid,p_paypal text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare item public.dv_supporter_orders%rowtype;
begin
 select * into item from public.dv_supporter_orders where id=p_id and user_id=p_user for update;
 if not found or p_paypal is null or p_paypal!~'^[A-Z0-9]{10,40}$' then raise exception 'Invalid payment order';end if;
 if item.paypal_order_id is not null and item.paypal_order_id is distinct from p_paypal then raise exception 'Provider order already assigned';end if;
 update public.dv_supporter_orders set paypal_order_id=p_paypal where id=p_id returning * into item;
 return to_jsonb(item);
end;$$;

create function public.dv_complete_supporter_order(p_user uuid,p_id uuid,p_paypal text,p_capture text,p_cents integer,p_currency text,p_environment text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare item public.dv_supporter_orders%rowtype; packs uuid[]:='{}'; replayed boolean;
begin
 -- Lock the account before the order, as in regular booster purchases.
 perform 1 from public.dv_profiles where user_id=p_user for update;
 if not found then raise exception 'Account unavailable';end if;
 select * into item from public.dv_supporter_orders where id=p_id and user_id=p_user for update;
 if not found then raise exception 'Payment unavailable';end if;
 if p_environment is distinct from 'sandbox' or item.paypal_order_id is null or item.paypal_order_id is distinct from p_paypal
    or item.cents is distinct from p_cents or item.currency is distinct from p_currency
    or p_capture is null or p_capture!~'^[A-Z0-9]{10,40}$' then raise exception 'Payment receipt mismatch';end if;
 replayed:=item.completed_at is not null;
 if replayed then
  if item.capture_id is distinct from p_capture then raise exception 'Capture already assigned';end if;
 else
  for i in 1..item.boosters loop
   packs:=array_append(packs,public.dv_allocate_alpha56(p_user,gen_random_uuid(),'supporter',0));
  end loop;
  insert into public.dv_cosmetic_ownership(user_id,kind,cosmetic_id)
  values(p_user,'portrait',item.portrait_id) on conflict do nothing;
  if item.title_id is not null then
   insert into public.dv_cosmetic_ownership(user_id,kind,cosmetic_id)
   values(p_user,'title',item.title_id) on conflict do nothing;
  end if;
  update public.dv_supporter_orders set capture_id=p_capture,status='completed',completed_at=now(),pack_ids=packs
  where id=p_id returning * into item;
 end if;
 return jsonb_build_object('id',item.id,'status',item.status,'replayed',replayed,'sandbox',true,
  'boosters',item.boosters,'packIds',item.pack_ids,'portraitId',item.portrait_id,'titleId',item.title_id);
end;$$;

revoke all on function public.dv_prepare_supporter_order(uuid,uuid,text,text),
 public.dv_attach_supporter_order(uuid,uuid,text),
 public.dv_complete_supporter_order(uuid,uuid,text,text,integer,text,text) from public,anon,authenticated;
grant execute on function public.dv_prepare_supporter_order(uuid,uuid,text,text),
 public.dv_attach_supporter_order(uuid,uuid,text),
 public.dv_complete_supporter_order(uuid,uuid,text,text,integer,text,text) to service_role;

notify pgrst,'reload schema';
commit;
