-- 15 remains the exact deck size. Three is a ceiling per motif, never a required quantity.
-- Keep all existing owned copies. The fixed starter pool supports a legal, varied deck.
begin;
create table public.dv_starter_grants29(user_id uuid primary key references public.dv_profiles(user_id) on delete cascade,created_at timestamptz not null default now());
alter table public.dv_starter_grants29 enable row level security;
create policy dv_starter_grants_own on public.dv_starter_grants29 for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.dv_starter_grants29 from public,anon,authenticated;
grant select on public.dv_starter_grants29 to authenticated;
with new_grants as(insert into public.dv_starter_grants29(user_id) select user_id from public.dv_profiles on conflict do nothing returning user_id)
insert into public.dv_inventory(user_id,variant_id,quantity)
select g.user_id,v.id,3 from new_grants g cross join public.dv_card_variants v where v.rarity='common' and v.definition_id in ('pepe','doge','roll-safe','harold','disaster-girl','confused')
on conflict(user_id,variant_id) do update set quantity=greatest(public.dv_inventory.quantity,excluded.quantity);
create or replace function public.dv_initialize_account() returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();fresh uuid;granted uuid;starter text[];
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 insert into public.dv_profiles(user_id) values(u) on conflict do nothing returning user_id into fresh;
 insert into public.dv_starter_grants29(user_id) values(u) on conflict do nothing returning user_id into granted;
 if granted is not null then
  insert into public.dv_inventory(user_id,variant_id,quantity) select u,id,3 from public.dv_card_variants where rarity='common' and definition_id in ('pepe','doge','roll-safe','harold','disaster-girl','confused')
  on conflict(user_id,variant_id) do update set quantity=greatest(public.dv_inventory.quantity,excluded.quantity);
 end if;
 insert into public.dv_wallets(user_id) values(u) on conflict do nothing;
 if fresh is not null then
  select array_agg(s.id order by s.n,g.i) into starter from (values('pepe:common',3,1),('doge:common',3,2),('roll-safe:common',3,3),('harold:common',2,4),('disaster-girl:common',2,5),('confused:common',2,6)) as s(id,quantity,n) cross join lateral generate_series(1,s.quantity) as g(i);
  insert into public.dv_decks(user_id,name,cards,active) values(u,'My first deck',starter,true);
 end if;
end;$$;
create or replace function public.dv_save_deck(p_id uuid,p_name text,p_cards text[]) returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); result uuid;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 if p_name is null or char_length(trim(p_name)) not between 1 and 40 then raise exception 'Invalid deck name';end if;
 if p_cards is null or cardinality(p_cards)<>15 or array_ndims(p_cards)<>1 or array_position(p_cards,null) is not null then raise exception 'Exactly 15 cards required';end if;
 if exists(select 1 from unnest(p_cards) as x(variant_id) join public.dv_card_variants v on v.id=x.variant_id group by v.definition_id having count(*)>3) then raise exception 'Maximum 3 copies per meme across all finishes';end if;
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

commit;
