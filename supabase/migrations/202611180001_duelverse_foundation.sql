-- Additive game foundation. Existing auth, presale data and payment history are untouched.
begin;
create table public.dv_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Player' check(char_length(display_name) between 1 and 40),
 created_at timestamptz not null default now()
);
create table public.dv_card_definitions (
 id text primary key, rule_id text not null unique, name text not null,
 element text not null check(element in ('storm','fire','stone')),
 edge_values integer[] not null check(cardinality(edge_values)=6)
);
create table public.dv_card_variants (
 id text primary key, definition_id text not null references public.dv_card_definitions(id),
 rarity text not null check(rarity in ('common','rare','epic','legendary','mythic')),
 image text not null, unique(definition_id,rarity)
);
create table public.dv_inventory (
 user_id uuid not null references public.dv_profiles(user_id) on delete cascade,
 variant_id text not null references public.dv_card_variants(id),
 quantity integer not null check(quantity>=0), primary key(user_id,variant_id)
);
create table public.dv_decks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.dv_profiles(user_id) on delete cascade,
 name text not null check(char_length(name) between 1 and 40),
 cards text[] not null check(cardinality(cards)=15 and array_ndims(cards)=1 and array_position(cards,null) is null),
 active boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index dv_one_active_deck on public.dv_decks(user_id) where active;
create index dv_decks_user on public.dv_decks(user_id);
create table public.dv_wallets (
 user_id uuid primary key references public.dv_profiles(user_id) on delete cascade,
 earned bigint not null default 0 check(earned>=0),premium bigint not null default 0 check(premium>=0)
);
-- No player write access or public reward-grant function. A future trusted match service owns this ledger.
create table public.dv_reward_ledger (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.dv_profiles(user_id),
 event_key text not null unique, currency text not null check(currency in ('earned','premium')),
 amount bigint not null check(amount<>0), created_at timestamptz not null default now()
);
create table public.dv_cosmetic_ownership (
 user_id uuid not null references public.dv_profiles(user_id),cosmetic_id text not null,
 kind text not null check(kind in ('arena','frame','animation')),created_at timestamptz not null default now(),primary key(user_id,cosmetic_id)
);
insert into public.dv_card_definitions(id,rule_id,name,element,edge_values) values
('pepe','oracle','Pepe','storm',ARRAY[7,6,3,2,3,3]),
('doge','brain','Doge','fire',ARRAY[5,2,5,2,5,5]),
('roll-safe','trust','Roll Safe','stone',ARRAY[5,5,5,3,3,3]);
insert into public.dv_card_variants(id,definition_id,rarity,image) values
('pepe:common','pepe','common','/game/assets/cards/v03/overthinker-thinking-pepe.webp'),
('pepe:rare','pepe','rare','/game/assets/cards/rarity-v16/pepe-rare.webp'),
('pepe:epic','pepe','epic','/game/assets/cards/rarity-v16/pepe-epic.webp'),
('pepe:legendary','pepe','legendary','/game/assets/cards/rarity-v16/pepe-legendary.webp'),
('pepe:mythic','pepe','mythic','/game/assets/cards/rarity-v16/pepe-mythic.webp'),
('doge:common','doge','common','/game/assets/cards/v04/doge.webp'),
('doge:rare','doge','rare','/game/assets/cards/rarity-v16/doge-rare.webp'),
('doge:epic','doge','epic','/game/assets/cards/rarity-v16/doge-epic.webp'),
('doge:legendary','doge','legendary','/game/assets/cards/rarity-v16/doge-legendary.webp'),
('doge:mythic','doge','mythic','/game/assets/cards/rarity-v16/doge-mythic.webp'),
('roll-safe:common','roll-safe','common','/game/assets/cards/v04/roll-safe.webp'),
('roll-safe:rare','roll-safe','rare','/game/assets/cards/rarity-v16/roll-safe-rare.webp'),
('roll-safe:epic','roll-safe','epic','/game/assets/cards/rarity-v16/roll-safe-epic.webp'),
('roll-safe:legendary','roll-safe','legendary','/game/assets/cards/rarity-v16/roll-safe-legendary.webp'),
('roll-safe:mythic','roll-safe','mythic','/game/assets/cards/rarity-v16/roll-safe-mythic.webp');

alter table public.dv_profiles enable row level security;
alter table public.dv_inventory enable row level security;
alter table public.dv_decks enable row level security;
alter table public.dv_wallets enable row level security;
alter table public.dv_reward_ledger enable row level security;
alter table public.dv_cosmetic_ownership enable row level security;
alter table public.dv_card_definitions enable row level security;
alter table public.dv_card_variants enable row level security;
create policy dv_profile_own on public.dv_profiles for select to authenticated using(user_id=(select auth.uid()));
create policy dv_inventory_own on public.dv_inventory for select to authenticated using(user_id=(select auth.uid()));
create policy dv_decks_own on public.dv_decks for select to authenticated using(user_id=(select auth.uid()));
create policy dv_wallet_own on public.dv_wallets for select to authenticated using(user_id=(select auth.uid()));
create policy dv_ledger_own on public.dv_reward_ledger for select to authenticated using(user_id=(select auth.uid()));
create policy dv_cosmetics_own on public.dv_cosmetic_ownership for select to authenticated using(user_id=(select auth.uid()));
create policy dv_catalog_public on public.dv_card_definitions for select to anon,authenticated using(true);
create policy dv_variants_public on public.dv_card_variants for select to anon,authenticated using(true);
-- Override project default grants explicitly; all writes go through narrow authenticated functions.
revoke all on public.dv_profiles,public.dv_inventory,public.dv_decks,public.dv_wallets,public.dv_reward_ledger,public.dv_cosmetic_ownership,public.dv_card_definitions,public.dv_card_variants from anon,authenticated;
grant select on public.dv_card_definitions,public.dv_card_variants to anon,authenticated;
grant select on public.dv_profiles,public.dv_inventory,public.dv_decks,public.dv_wallets,public.dv_reward_ledger,public.dv_cosmetic_ownership to authenticated;

create function public.dv_initialize_account() returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); fresh uuid; starter text[];
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 insert into public.dv_profiles(user_id) values(u) on conflict do nothing returning user_id into fresh;
 -- Only the first transaction grants the starter set. Repeated loads cannot farm cards.
 if fresh is not null then
  insert into public.dv_inventory(user_id,variant_id,quantity) select u,id,6 from public.dv_card_variants where rarity='common';
  insert into public.dv_wallets(user_id) values(u);
  select array_agg(v.id order by v.id,g.n) into starter from public.dv_card_variants v cross join generate_series(1,5) g(n) where v.rarity='common';
  insert into public.dv_decks(user_id,name,cards,active) values(u,'My first deck',starter,true);
 end if;
end;$$;

create function public.dv_save_deck(p_id uuid,p_name text,p_cards text[]) returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); result uuid;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 if p_name is null or char_length(trim(p_name)) not between 1 and 40 then raise exception 'Invalid deck name';end if;
 if p_cards is null or cardinality(p_cards)<>15 or array_ndims(p_cards)<>1 or array_position(p_cards,null) is not null then raise exception 'Exactly 15 cards required';end if;
 -- Serializes concurrent updates and active-deck changes for this player.
 perform 1 from public.dv_profiles where user_id=u for update;
 if not found then raise exception 'Initialize account first';end if;
 if p_id is not null and not exists(select 1 from public.dv_decks where id=p_id and user_id=u) then raise exception 'Deck not found';end if;
 if exists(select 1 from unnest(p_cards) as x(variant_id) group by x.variant_id having count(*)>coalesce((select i.quantity from public.dv_inventory i where i.user_id=u and i.variant_id=x.variant_id),0)) then raise exception 'Unowned or insufficient card copies';end if;
 update public.dv_decks set active=false where user_id=u and active;
 if p_id is null then
  if (select count(*) from public.dv_decks where user_id=u)>=10 then raise exception 'Deck limit reached';end if;
  insert into public.dv_decks(user_id,name,cards,active) values(u,trim(p_name),p_cards,true) returning id into result;
 else
  update public.dv_decks set name=trim(p_name),cards=p_cards,active=true,updated_at=now() where id=p_id and user_id=u returning id into result;
 end if;
 return result;
end;$$;
revoke all on function public.dv_initialize_account() from public,anon;
revoke all on function public.dv_save_deck(uuid,text,text[]) from public,anon;
grant execute on function public.dv_initialize_account() to authenticated;
grant execute on function public.dv_save_deck(uuid,text,text[]) to authenticated;
commit;
