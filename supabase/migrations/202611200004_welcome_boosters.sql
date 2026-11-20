-- Welcome packs use the same generator, saved contents and duplicate protection as purchases.
begin;
alter table public.dv_booster_purchases36 drop constraint dv_booster_purchases36_currency_check;
alter table public.dv_booster_purchases36 drop constraint dv_booster_purchases36_check;
alter table public.dv_booster_purchases36 add constraint dv_booster_purchases36_currency_check check(currency in ('pixels','shards','starter'));
alter table public.dv_booster_purchases36 add constraint dv_booster_purchases36_check check((currency='pixels' and cost=100) or(currency='shards' and cost=150) or(currency='starter' and cost=0));
create table public.dv_welcome_grants56(
 user_id uuid primary key references public.dv_profiles(user_id) on delete cascade,
 pack_count integer not null default 10 check(pack_count=10),created_at timestamptz not null default now()
);
alter table public.dv_welcome_grants56 enable row level security;
create policy dv_welcome_own56 on public.dv_welcome_grants56 for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.dv_welcome_grants56 from public,anon,authenticated;
grant select on public.dv_welcome_grants56 to authenticated;
-- Private helper: callers must hold the player row lock. No browser may call it directly.
create function public.dv_allocate_alpha56(u uuid,p_request uuid,p_currency text,price integer) returns uuid language plpgsql security definer set search_path='' as $$
declare slot integer;roll integer;finish text;chosen text;history bigint;selected text[]:='{}';fresh text[]:='{}';result uuid;
begin
 for slot in 1..5 loop
  roll:=floor(random()*10000)::integer;
  if slot=5 then
   finish:=case when roll<9300 then 'rare' when roll<9900 then 'epic' when roll<9990 then 'legendary' else 'mythic' end;
  else
   finish:=case when roll<7700 then 'common' when roll<9700 then 'rare' when roll<9950 then 'epic' when roll<9995 then 'legendary' else 'mythic' end;
  end if;
  -- Uniform selection within the rolled finish; sequential history includes earlier cards in this pack.
  select v.id into chosen from public.dv_card_variants v left join public.dv_card_acquired36 a on a.user_id=u and a.variant_id=v.id
   where v.edition='alpha' and v.rarity=finish and coalesce(a.quantity,0)<3 order by random() limit 1;
  if chosen is null then select v.id into chosen from public.dv_card_variants v where v.edition='alpha' and v.rarity=finish order by random() limit 1;end if;
  if chosen is null then raise exception 'Booster catalog unavailable';end if;
  if coalesce((select quantity from public.dv_inventory where user_id=u and variant_id=chosen),0)>=100000 then raise exception 'Collection limit reached';end if;
  select coalesce((select quantity from public.dv_card_acquired36 where user_id=u and variant_id=chosen),0) into history;
  if history=0 and not(chosen=any(fresh)) then fresh:=array_append(fresh,chosen);end if;
  insert into public.dv_inventory(user_id,variant_id,quantity) values(u,chosen,1) on conflict(user_id,variant_id) do update set quantity=public.dv_inventory.quantity+1;
  selected:=array_append(selected,chosen);
 end loop;
 -- The guarantee slot is mixed into the pack so its location cannot be identified by position.
 select array_agg(card order by random()) into selected from unnest(selected) as c(card);
 insert into public.dv_booster_purchases36(user_id,request_id,product_id,currency,cost,cards,new_variants) values(u,p_request,'alpha',p_currency,price,selected,fresh) returning id into result;
 return result;
end;$$;
revoke all on function public.dv_allocate_alpha56(uuid,uuid,text,integer) from public,anon,authenticated;

create or replace function public.dv_buy_alpha_booster(p_request uuid,p_currency text) returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();old public.dv_booster_purchases36%rowtype;price integer;funds bigint;result uuid;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 if p_request is null or p_currency is null or p_currency not in ('pixels','shards') then raise exception 'Invalid booster purchase';end if;
 perform 1 from public.dv_profiles where user_id=u for update;
 if not found then raise exception 'Initialize account first';end if;
 select * into old from public.dv_booster_purchases36 where user_id=u and request_id=p_request;
 if found then
  if old.currency is distinct from p_currency then raise exception 'Purchase request already used with another currency';end if;
  return old.id;
 end if;
 price:=case p_currency when 'pixels' then 100 else 150 end;
 select case p_currency when 'pixels' then earned else premium end into funds from public.dv_wallets where user_id=u for update;
 if funds is null then raise exception 'Wallet missing';end if;
 if funds<price then raise exception 'Not enough %',case p_currency when 'pixels' then 'Pixels' else 'Shards' end;end if;
 result:=public.dv_allocate_alpha56(u,p_request,p_currency,price);
 update public.dv_wallets set earned=earned-case when p_currency='pixels' then price else 0 end,premium=premium-case when p_currency='shards' then price else 0 end where user_id=u;
 insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values(u,'booster36:'||u||':'||p_request,case p_currency when 'pixels' then 'earned' else 'premium' end,-price);
 return result;
end;$$;

alter function public.dv_initialize_account() rename to dv_initialize_base56;
revoke all on function public.dv_initialize_base56() from public,anon,authenticated;
create function public.dv_initialize_account() returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();granted uuid;i integer;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 perform public.dv_initialize_base56();
 -- Serializes login, refresh, purchases and simultaneous tabs. Everything rolls back on failure.
 perform 1 from public.dv_profiles where user_id=u for update;
 if not exists(select 1 from auth.users where id=u and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then return;end if;
 insert into public.dv_welcome_grants56(user_id) values(u) on conflict do nothing returning user_id into granted;
 if granted is not null then
  for i in 1..10 loop perform public.dv_allocate_alpha56(u,gen_random_uuid(),'starter',0);end loop;
 end if;
end;$$;
revoke all on function public.dv_initialize_account() from public,anon;
grant execute on function public.dv_initialize_account() to authenticated;
commit;
