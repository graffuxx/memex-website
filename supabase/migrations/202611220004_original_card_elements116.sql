-- One native element per motif. Preserve every owned copy and finish, wallets,
-- purchase IDs/reveal progress and active match snapshots. Keep retired records
-- for historical references and an operator-only rollback audit; no catalog rows
-- or player copies are deleted.
begin;
lock table public.dv_profiles in share row exclusive mode;
lock table public.dv_card_variants,public.dv_inventory,public.dv_card_acquired36,public.dv_decks,public.dv_booster_purchases36,public.dv_pvp90 in share row exclusive mode;
create table if not exists dv_private.element_aliases116(old_id text primary key,original_id text not null references public.dv_card_variants(id));
create table if not exists dv_private.element_backup116(kind text not null,row_key text not null,data jsonb not null,created_at timestamptz not null default now(),primary key(kind,row_key));
alter table dv_private.element_aliases116 enable row level security;
alter table dv_private.element_backup116 enable row level security;
revoke all on dv_private.element_aliases116,dv_private.element_backup116 from public,anon,authenticated,service_role;
insert into dv_private.element_aliases116(old_id,original_id)
 select v.id,d.id||':'||v.rarity from public.dv_card_variants v join public.dv_card_definitions d on d.id=v.definition_id
 where v.element<>d.element and v.id=d.id||':'||v.rarity||':'||v.element and v.edition in ('alpha','retired-element116')
 on conflict do nothing;
do $$begin
 if (select count(*) from dv_private.element_aliases116)<>1700 then raise exception 'Unexpected element alias catalog';end if;
 if exists(select 1 from dv_private.element_aliases116 a left join public.dv_card_variants v on v.id=a.original_id where v.id is null or v.edition<>'alpha') then raise exception 'Original card missing';end if;
end;$$;
create or replace function public.dv_original_cards116(cards text[]) returns text[] language sql stable security definer set search_path='' as $$
 select case when cards is null then null else coalesce((select array_agg(coalesce(a.original_id,c.id) order by c.n) from unnest(cards) with ordinality c(id,n) left join dv_private.element_aliases116 a on a.old_id=c.id),'{}'::text[]) end;
$$;
revoke all on function public.dv_original_cards116(text[]) from public,anon,authenticated,service_role;
-- Back up both sides of every merge, once. This audit has no player-facing API.
insert into dv_private.element_backup116(kind,row_key,data)
 select 'inventory',i.user_id||'/'||i.variant_id,to_jsonb(i) from public.dv_inventory i where exists(select 1 from dv_private.element_aliases116 a where i.variant_id in (a.old_id,a.original_id)) and not exists(select 1 from dv_private.element_backup116 where kind='complete' and row_key='116') on conflict do nothing;
insert into dv_private.element_backup116(kind,row_key,data)
 select 'acquired',i.user_id||'/'||i.variant_id,to_jsonb(i) from public.dv_card_acquired36 i where exists(select 1 from dv_private.element_aliases116 a where i.variant_id in (a.old_id,a.original_id)) and not exists(select 1 from dv_private.element_backup116 where kind='complete' and row_key='116') on conflict do nothing;
insert into dv_private.element_backup116(kind,row_key,data)
 select 'deck',id::text,to_jsonb(d) from public.dv_decks d where cards is distinct from public.dv_original_cards116(cards) and not exists(select 1 from dv_private.element_backup116 where kind='complete' and row_key='116') on conflict do nothing;
insert into dv_private.element_backup116(kind,row_key,data)
 select 'booster',id::text,to_jsonb(p) from public.dv_booster_purchases36 p where cards is distinct from public.dv_original_cards116(cards) and not exists(select 1 from dv_private.element_backup116 where kind='complete' and row_key='116') on conflict do nothing;
insert into dv_private.element_backup116(kind,row_key,data)
 select 'queue',id::text,to_jsonb(m) from public.dv_pvp90 m where not exists(select 1 from dv_private.element_backup116 where kind='complete' and row_key='116') and status='waiting' and (host_deck->'cards') is distinct from to_jsonb(public.dv_original_cards116(array(select jsonb_array_elements_text(host_deck->'cards')))) on conflict do nothing;
create temporary table element_totals116 on commit drop as select user_id,sum(quantity) copies from public.dv_inventory group by user_id;
create temporary table acquired_totals116 on commit drop as select user_id,sum(quantity) copies from public.dv_card_acquired36 group by user_id;
-- A transfer is not a newly acquired card. Move the duplicate-protection history
-- explicitly and suppress only that acquisition trigger during this transaction.
alter table public.dv_inventory disable trigger dv_inventory_acquired36;
insert into public.dv_inventory(user_id,variant_id,quantity)
 select i.user_id,a.original_id,sum(i.quantity)::integer from public.dv_inventory i join dv_private.element_aliases116 a on a.old_id=i.variant_id group by i.user_id,a.original_id having sum(i.quantity)>0
 on conflict(user_id,variant_id) do update set quantity=public.dv_inventory.quantity+excluded.quantity;
update public.dv_inventory i set quantity=0 from dv_private.element_aliases116 a where i.variant_id=a.old_id and i.quantity<>0;
insert into public.dv_card_acquired36(user_id,variant_id,quantity)
 select i.user_id,a.original_id,sum(i.quantity)::bigint from public.dv_card_acquired36 i join dv_private.element_aliases116 a on a.old_id=i.variant_id group by i.user_id,a.original_id having sum(i.quantity)>0
 on conflict(user_id,variant_id) do update set quantity=public.dv_card_acquired36.quantity+excluded.quantity;
update public.dv_card_acquired36 i set quantity=0 from dv_private.element_aliases116 a where i.variant_id=a.old_id and i.quantity<>0;
alter table public.dv_inventory enable trigger dv_inventory_acquired36;
update public.dv_decks set cards=public.dv_original_cards116(cards) where cards is distinct from public.dv_original_cards116(cards);
update public.dv_booster_purchases36 set cards=public.dv_original_cards116(cards),new_variants=array(select distinct x from unnest(public.dv_original_cards116(new_variants)) as n(x)) where cards is distinct from public.dv_original_cards116(cards) or new_variants is distinct from public.dv_original_cards116(new_variants);
-- Waiting rooms use the updated originals. A match already started keeps its
-- frozen cards/rules and remains readable by the legacy runtime lookup.
update public.dv_pvp90 set host_deck=jsonb_set(host_deck,'{cards}',to_jsonb(public.dv_original_cards116(array(select jsonb_array_elements_text(host_deck->'cards'))))) where status='waiting' and host_deck->'cards' is distinct from to_jsonb(public.dv_original_cards116(array(select jsonb_array_elements_text(host_deck->'cards'))));
update public.dv_card_variants v set edition='retired-element116' from dv_private.element_aliases116 a where v.id=a.old_id and v.edition<>'retired-element116';
drop policy if exists dv_variants_public on public.dv_card_variants;
create policy dv_variants_public on public.dv_card_variants for select to anon,authenticated using(edition<>'retired-element116');
-- Accept stale saved-editor IDs only after converting them to owned originals.
do $$begin if to_regprocedure('public.dv_save_deck_base116(uuid,text,text[])') is null then alter function public.dv_save_deck(uuid,text,text[]) rename to dv_save_deck_base116;end if;end;$$;
revoke all on function public.dv_save_deck_base116(uuid,text,text[]) from public,anon,authenticated,service_role;
create or replace function public.dv_save_deck(p_id uuid,p_name text,p_cards text[]) returns uuid language plpgsql security definer set search_path='' as $$
begin
 if p_cards is null or cardinality(p_cards)<>15 or array_ndims(p_cards)<>1 or array_position(p_cards,null) is not null then raise exception 'Exactly 15 cards required';end if;
 return public.dv_save_deck_base116(p_id,p_name,public.dv_original_cards116(p_cards));
end;$$;
-- Historical trade retries remain idempotent. New trades must use the originals.
create or replace function public.dv_trade_card(p_request uuid,p_kind text,p_variant text) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.dv_card_variants where id=p_variant and edition='recruiter') then raise exception 'Referral rewards cannot be crafted or dismantled';end if;
 if exists(select 1 from dv_private.element_aliases116 where old_id=p_variant) and not exists(select 1 from public.dv_card_transactions30 where user_id=auth.uid() and request_id=p_request and kind=p_kind and variant_id=p_variant) then raise exception 'This element variant has retired. Reload to use the original card';end if;
 return public.dv_trade_card_base95(p_request,p_kind,p_variant);
end;$$;
revoke all on function public.dv_save_deck(uuid,text,text[]),public.dv_trade_card(uuid,text,text) from public,anon,authenticated,service_role;
grant execute on function public.dv_save_deck(uuid,text,text[]),public.dv_trade_card(uuid,text,text) to authenticated;
do $$begin
 if exists(select 1 from element_totals116 t full join (select user_id,sum(quantity) copies from public.dv_inventory group by user_id) n using(user_id) where t.copies is distinct from n.copies) then raise exception 'Inventory conservation failed';end if;
 if exists(select 1 from acquired_totals116 t full join (select user_id,sum(quantity) copies from public.dv_card_acquired36 group by user_id) n using(user_id) where t.copies is distinct from n.copies) then raise exception 'Acquisition conservation failed';end if;
 if (select count(*) from public.dv_card_variants where edition='alpha')<>425 then raise exception 'Expected 425 original Alpha finishes';end if;
 if exists(select 1 from public.dv_decks where cardinality(cards)<>15) then raise exception 'Deck size changed';end if;
end;$$;
insert into dv_private.element_backup116(kind,row_key,data) values('complete','116','{"catalogVersion":9,"alphaFinishes":425}'::jsonb) on conflict do nothing;
commit;
