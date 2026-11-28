begin;

alter table public.dv_cosmetic_ownership drop constraint dv_cosmetic_ownership_kind_check;
alter table public.dv_cosmetic_ownership add constraint dv_cosmetic_ownership_kind_check
 check(kind in ('arena','frame','animation','portrait','title','sticker'));

create table public.dv_cosmetic_shop (
 id text primary key,
 kind text not null check(kind in ('sticker','portrait')),
 price integer not null check(price>0),
 listed boolean not null default true
);
alter table public.dv_cosmetic_shop enable row level security;
revoke all on public.dv_cosmetic_shop from public,anon,authenticated,service_role;

insert into public.dv_cosmetic_shop(id,kind,price) values
 ('sticker-wow','sticker',100),('sticker-one-more','sticker',100),('sticker-boom','sticker',200),
 ('portrait-cosmic-doge','portrait',150),('portrait-crystal-cat','portrait',200),('portrait-void-pepe','portrait',250);
insert into public.dv_identity_catalog85(kind,id,min_level,min_wins,source)
 select kind,id,1,0,'owned' from public.dv_cosmetic_shop where kind='portrait';

create function public.dv_cosmetic_shop_items() returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'kind',kind,'price',price) order by price,id),'[]'::jsonb)
 from public.dv_cosmetic_shop where listed
$$;

create function public.dv_buy_cosmetic(p_id text,p_price integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=public.dv_social_user92(); item public.dv_cosmetic_shop%rowtype; remaining bigint;
begin
 perform 1 from public.dv_profiles where user_id=owner_id for update;
 if not found then raise exception 'Initialize account first';end if;
 select * into item from public.dv_cosmetic_shop where id=p_id for share;
 if not found then raise exception 'Cosmetic unavailable';end if;
 if exists(select 1 from public.dv_cosmetic_ownership where user_id=owner_id and kind=item.kind and cosmetic_id=item.id) then
  select premium into remaining from public.dv_wallets where user_id=owner_id;
  return jsonb_build_object('id',item.id,'kind',item.kind,'shards',remaining,'alreadyOwned',true);
 end if;
 if not item.listed then raise exception 'Cosmetic unavailable';end if;
 if p_price is distinct from item.price then raise exception 'The price changed. Refresh the shop and try again.';end if;
 update public.dv_wallets set premium=premium-item.price where user_id=owner_id and premium>=item.price
  returning premium into remaining;
 if not found then raise exception 'Not enough Shards';end if;
 insert into public.dv_cosmetic_ownership(user_id,kind,cosmetic_id) values(owner_id,item.kind,item.id);
 insert into public.dv_reward_ledger(user_id,event_key,currency,amount)
 values(owner_id,'cosmetic-shop:'||owner_id||':'||item.id,'premium',-item.price);
 return jsonb_build_object('id',item.id,'kind',item.kind,'shards',remaining,'alreadyOwned',false);
end;$$;

create or replace function public.dv_save_sticker_loadout(p_slots text[]) returns text[]
language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=public.dv_social_user92();
begin
 if array_ndims(p_slots) is distinct from 1 or array_lower(p_slots,1) is distinct from 1
    or cardinality(p_slots) is distinct from 4 or (select count(distinct sticker) from unnest(p_slots) sticker)<>4 then
  raise exception 'Choose four different stickers';
 end if;
 if exists(select 1 from unnest(p_slots) sticker where not (sticker=any(public.dv_default_sticker_slots()))
  and not exists(select 1 from public.dv_cosmetic_ownership where user_id=owner_id and kind='sticker' and cosmetic_id=sticker)) then
  raise exception 'This sticker is locked or unknown';
 end if;
 insert into public.dv_sticker_loadouts(user_id,slots) values(owner_id,p_slots)
 on conflict(user_id) do update set slots=excluded.slots;
 return p_slots;
end;$$;

revoke all on function public.dv_cosmetic_shop_items(),public.dv_buy_cosmetic(text,integer) from public,anon,authenticated,service_role;
grant execute on function public.dv_cosmetic_shop_items() to anon,authenticated;
grant execute on function public.dv_buy_cosmetic(text,integer) to authenticated;

notify pgrst,'reload schema';
commit;
