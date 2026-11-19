-- Alpha packs: atomic account purchases, immutable lifetime acquisition history,
-- three-copy duplicate protection per finish, and persisted individual reveals.
begin;
alter table public.dv_card_variants add column edition text not null default 'alpha';
create table public.dv_card_acquired36(
 user_id uuid not null references public.dv_profiles(user_id) on delete cascade,
 variant_id text not null references public.dv_card_variants(id),quantity bigint not null check(quantity>=0),primary key(user_id,variant_id)
);
alter table public.dv_card_acquired36 enable row level security;
create policy dv_acquired_own on public.dv_card_acquired36 for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.dv_card_acquired36 from public,anon,authenticated;
grant select on public.dv_card_acquired36 to authenticated;
-- Retain formerly dismantled copies in history so dusting cannot reset protection.
insert into public.dv_card_acquired36(user_id,variant_id,quantity)
select u.user_id,u.variant_id,coalesce(i.quantity,0)+coalesce(d.n,0)
from (select user_id,variant_id from public.dv_inventory union select user_id,variant_id from public.dv_card_transactions30) u
left join public.dv_inventory i using(user_id,variant_id)
left join (select user_id,variant_id,count(*) n from public.dv_card_transactions30 where kind='dismantle' group by user_id,variant_id)d using(user_id,variant_id);
create function public.dv_track_acquired36() returns trigger language plpgsql security definer set search_path='' as $$
declare added bigint;
begin
 added:=case when tg_op='INSERT' then new.quantity else greatest(new.quantity-old.quantity,0) end;
 if added>0 then insert into public.dv_card_acquired36(user_id,variant_id,quantity) values(new.user_id,new.variant_id,added)
 on conflict(user_id,variant_id) do update set quantity=public.dv_card_acquired36.quantity+excluded.quantity;end if;
 return new;
end;$$;
revoke all on function public.dv_track_acquired36() from public,anon,authenticated;
create trigger dv_inventory_acquired36 after insert or update of quantity on public.dv_inventory for each row execute function public.dv_track_acquired36();

create table public.dv_booster_purchases36(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references public.dv_profiles(user_id) on delete cascade,
 request_id uuid not null,product_id text not null check(product_id='alpha'),currency text not null check(currency in ('pixels','shards')),
 cost integer not null check((currency='pixels' and cost=100) or(currency='shards' and cost=150)),
 cards text[] not null check(cardinality(cards)=5 and array_ndims(cards)=1 and array_position(cards,null) is null),
 new_variants text[] not null default '{}',revealed_slots integer[] not null default '{}' check(cardinality(revealed_slots)<=5 and revealed_slots<@array[0,1,2,3,4]),
 created_at timestamptz not null default now(),unique(user_id,request_id)
);
create index dv_boosters_user_created36 on public.dv_booster_purchases36(user_id,created_at desc);
alter table public.dv_booster_purchases36 enable row level security;
create policy dv_boosters_own on public.dv_booster_purchases36 for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.dv_booster_purchases36 from public,anon,authenticated;
grant select on public.dv_booster_purchases36 to authenticated;

create function public.dv_buy_alpha_booster(p_request uuid,p_currency text) returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();old public.dv_booster_purchases36%rowtype;price integer;funds bigint;slot integer;roll integer;finish text;chosen text;history bigint;selected text[]:='{}';fresh text[]:='{}';result uuid;
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
 for slot in 1..5 loop
  roll:=floor(random()*10000)::integer;
  if slot=5 then
   finish:=case when roll<7800 then 'rare' when roll<9600 then 'epic' when roll<9950 then 'legendary' else 'mythic' end;
  else
   finish:=case when roll<7000 then 'common' when roll<9200 then 'rare' when roll<9850 then 'epic' when roll<9980 then 'legendary' else 'mythic' end;
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
 update public.dv_wallets set earned=earned-case when p_currency='pixels' then price else 0 end,premium=premium-case when p_currency='shards' then price else 0 end where user_id=u;
 insert into public.dv_booster_purchases36(user_id,request_id,product_id,currency,cost,cards,new_variants) values(u,p_request,'alpha',p_currency,price,selected,fresh) returning id into result;
 insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values(u,'booster36:'||u||':'||p_request,case p_currency when 'pixels' then 'earned' else 'premium' end,-price);
 return result;
end;$$;
revoke all on function public.dv_buy_alpha_booster(uuid,text) from public,anon;
grant execute on function public.dv_buy_alpha_booster(uuid,text) to authenticated;

create function public.dv_reveal_booster_card(p_booster uuid,p_slot integer) returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();pack public.dv_booster_purchases36%rowtype;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 if p_booster is null or p_slot is null or p_slot<0 or p_slot>4 then raise exception 'Invalid reveal slot';end if;
 perform 1 from public.dv_profiles where user_id=u for update;
 select * into pack from public.dv_booster_purchases36 where id=p_booster and user_id=u for update;
 if not found then raise exception 'Booster not found';end if;
 if not(p_slot=any(pack.revealed_slots)) then update public.dv_booster_purchases36 set revealed_slots=array_append(revealed_slots,p_slot) where id=pack.id;end if;
end;$$;
revoke all on function public.dv_reveal_booster_card(uuid,integer) from public,anon;
grant execute on function public.dv_reveal_booster_card(uuid,integer) to authenticated;
commit;
