-- Prime release: ten motifs/fifty finishes; singleton 15-card decks and one Prime.
-- Preserve inventory, saved deck contents, currencies, welcome entitlements and running matches.
begin;
alter table public.dv_card_definitions add column if not exists is_prime boolean not null default false;
alter table public.dv_card_definitions drop constraint if exists dv_rank_values126;
alter table public.dv_card_definitions add constraint dv_rank_values126 check(array_position(edge_values,null) is null and 1<=all(edge_values) and 10>=all(edge_values) and cardinality(array_positions(edge_values,10))=case when is_prime then 1 else 0 end);
insert into public.dv_card_definitions(id,rule_id,name,element,edge_values,is_prime) values
('evil-ernie','prime-evil-ernie','EVIL ERNIE','fire',ARRAY[10,5,2,3,6,7],true),
('nuck-chorris','prime-nuck-chorris','Nuck Chorris','storm',ARRAY[3,10,7,6,5,2],true),
('sparta-kick','prime-sparta-kick','THIS IS SPARTA','fire',ARRAY[7,10,3,5,6,2],true),
('emotional-damage','prime-emotional-damage','EMOTIONAL DAMAGE','water',ARRAY[10,2,6,5,3,7],true),
('pablo-waiting','prime-pablo-waiting','PABLO WAITING','water',ARRAY[5,3,7,2,10,6],true),
('here-we-go-again','prime-here-we-go-again','HERE WE GO AGAIN','earth',ARRAY[2,7,6,10,3,5],true),
('one-does-not-simply','prime-one-does-not-simply','ONE DOES NOT SIMPLY','earth',ARRAY[6,3,10,7,5,2],true),
('sanic','prime-sanic','SANIC','air',ARRAY[3,5,2,6,7,10],true),
('numa-numa','prime-numa-numa','NUMA NUMA','air',ARRAY[7,2,5,10,6,3],true),
('keyboard-crusher','prime-keyboard-crusher','KEYBOARD CRUSHER','storm',ARRAY[6,7,10,3,2,5],true)
on conflict(id) do update set rule_id=excluded.rule_id,name=excluded.name,element=excluded.element,edge_values=excluded.edge_values,is_prime=excluded.is_prime;
insert into public.dv_card_variants(id,definition_id,rarity,image,element,edition) values
('evil-ernie:common','evil-ernie','common','/game/assets/cards/primes-v126/evil-ernie-common.webp','fire','alpha'),
('evil-ernie:rare','evil-ernie','rare','/game/assets/cards/primes-v126/evil-ernie-rare.webp','fire','alpha'),
('evil-ernie:epic','evil-ernie','epic','/game/assets/cards/primes-v126/evil-ernie-epic.webp','fire','alpha'),
('evil-ernie:legendary','evil-ernie','legendary','/game/assets/cards/primes-v126/evil-ernie-legendary.webp','fire','alpha'),
('evil-ernie:mythic','evil-ernie','mythic','/game/assets/cards/primes-v126/evil-ernie-mythic.webp','fire','alpha'),
('nuck-chorris:common','nuck-chorris','common','/game/assets/cards/primes-v126/nuck-chorris-common.webp','storm','alpha'),
('nuck-chorris:rare','nuck-chorris','rare','/game/assets/cards/primes-v126/nuck-chorris-rare.webp','storm','alpha'),
('nuck-chorris:epic','nuck-chorris','epic','/game/assets/cards/primes-v126/nuck-chorris-epic.webp','storm','alpha'),
('nuck-chorris:legendary','nuck-chorris','legendary','/game/assets/cards/primes-v126/nuck-chorris-legendary.webp','storm','alpha'),
('nuck-chorris:mythic','nuck-chorris','mythic','/game/assets/cards/primes-v126/nuck-chorris-mythic.webp','storm','alpha'),
('sparta-kick:common','sparta-kick','common','/game/assets/cards/primes-v126/sparta-kick-common.webp','fire','alpha'),
('sparta-kick:rare','sparta-kick','rare','/game/assets/cards/primes-v126/sparta-kick-rare.webp','fire','alpha'),
('sparta-kick:epic','sparta-kick','epic','/game/assets/cards/primes-v126/sparta-kick-epic.webp','fire','alpha'),
('sparta-kick:legendary','sparta-kick','legendary','/game/assets/cards/primes-v126/sparta-kick-legendary.webp','fire','alpha'),
('sparta-kick:mythic','sparta-kick','mythic','/game/assets/cards/primes-v126/sparta-kick-mythic.webp','fire','alpha'),
('emotional-damage:common','emotional-damage','common','/game/assets/cards/primes-v126/emotional-damage-common.webp','water','alpha'),
('emotional-damage:rare','emotional-damage','rare','/game/assets/cards/primes-v126/emotional-damage-rare.webp','water','alpha'),
('emotional-damage:epic','emotional-damage','epic','/game/assets/cards/primes-v126/emotional-damage-epic.webp','water','alpha'),
('emotional-damage:legendary','emotional-damage','legendary','/game/assets/cards/primes-v126/emotional-damage-legendary.webp','water','alpha'),
('emotional-damage:mythic','emotional-damage','mythic','/game/assets/cards/primes-v126/emotional-damage-mythic.webp','water','alpha'),
('pablo-waiting:common','pablo-waiting','common','/game/assets/cards/primes-v126/pablo-waiting-common.webp','water','alpha'),
('pablo-waiting:rare','pablo-waiting','rare','/game/assets/cards/primes-v126/pablo-waiting-rare.webp','water','alpha'),
('pablo-waiting:epic','pablo-waiting','epic','/game/assets/cards/primes-v126/pablo-waiting-epic.webp','water','alpha'),
('pablo-waiting:legendary','pablo-waiting','legendary','/game/assets/cards/primes-v126/pablo-waiting-legendary.webp','water','alpha'),
('pablo-waiting:mythic','pablo-waiting','mythic','/game/assets/cards/primes-v126/pablo-waiting-mythic.webp','water','alpha'),
('here-we-go-again:common','here-we-go-again','common','/game/assets/cards/primes-v126/here-we-go-again-common.webp','earth','alpha'),
('here-we-go-again:rare','here-we-go-again','rare','/game/assets/cards/primes-v126/here-we-go-again-rare.webp','earth','alpha'),
('here-we-go-again:epic','here-we-go-again','epic','/game/assets/cards/primes-v126/here-we-go-again-epic.webp','earth','alpha'),
('here-we-go-again:legendary','here-we-go-again','legendary','/game/assets/cards/primes-v126/here-we-go-again-legendary.webp','earth','alpha'),
('here-we-go-again:mythic','here-we-go-again','mythic','/game/assets/cards/primes-v126/here-we-go-again-mythic.webp','earth','alpha'),
('one-does-not-simply:common','one-does-not-simply','common','/game/assets/cards/primes-v126/one-does-not-simply-common.webp','earth','alpha'),
('one-does-not-simply:rare','one-does-not-simply','rare','/game/assets/cards/primes-v126/one-does-not-simply-rare.webp','earth','alpha'),
('one-does-not-simply:epic','one-does-not-simply','epic','/game/assets/cards/primes-v126/one-does-not-simply-epic.webp','earth','alpha'),
('one-does-not-simply:legendary','one-does-not-simply','legendary','/game/assets/cards/primes-v126/one-does-not-simply-legendary.webp','earth','alpha'),
('one-does-not-simply:mythic','one-does-not-simply','mythic','/game/assets/cards/primes-v126/one-does-not-simply-mythic.webp','earth','alpha'),
('sanic:common','sanic','common','/game/assets/cards/primes-v126/sanic-common.webp','air','alpha'),
('sanic:rare','sanic','rare','/game/assets/cards/primes-v126/sanic-rare.webp','air','alpha'),
('sanic:epic','sanic','epic','/game/assets/cards/primes-v126/sanic-epic.webp','air','alpha'),
('sanic:legendary','sanic','legendary','/game/assets/cards/primes-v126/sanic-legendary.webp','air','alpha'),
('sanic:mythic','sanic','mythic','/game/assets/cards/primes-v126/sanic-mythic.webp','air','alpha'),
('numa-numa:common','numa-numa','common','/game/assets/cards/primes-v126/numa-numa-common.webp','air','alpha'),
('numa-numa:rare','numa-numa','rare','/game/assets/cards/primes-v126/numa-numa-rare.webp','air','alpha'),
('numa-numa:epic','numa-numa','epic','/game/assets/cards/primes-v126/numa-numa-epic.webp','air','alpha'),
('numa-numa:legendary','numa-numa','legendary','/game/assets/cards/primes-v126/numa-numa-legendary.webp','air','alpha'),
('numa-numa:mythic','numa-numa','mythic','/game/assets/cards/primes-v126/numa-numa-mythic.webp','air','alpha'),
('keyboard-crusher:common','keyboard-crusher','common','/game/assets/cards/primes-v126/keyboard-crusher-common.webp','storm','alpha'),
('keyboard-crusher:rare','keyboard-crusher','rare','/game/assets/cards/primes-v126/keyboard-crusher-rare.webp','storm','alpha'),
('keyboard-crusher:epic','keyboard-crusher','epic','/game/assets/cards/primes-v126/keyboard-crusher-epic.webp','storm','alpha'),
('keyboard-crusher:legendary','keyboard-crusher','legendary','/game/assets/cards/primes-v126/keyboard-crusher-legendary.webp','storm','alpha'),
('keyboard-crusher:mythic','keyboard-crusher','mythic','/game/assets/cards/primes-v126/keyboard-crusher-mythic.webp','storm','alpha')
on conflict(id) do update set image=excluded.image,edition=excluded.edition;
create table if not exists public.dv_starter_grants126(user_id uuid primary key references public.dv_profiles(user_id) on delete cascade,created_at timestamptz not null default now());
alter table public.dv_starter_grants126 enable row level security;
drop policy if exists dv_starter_own126 on public.dv_starter_grants126;
create policy dv_starter_own126 on public.dv_starter_grants126 for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.dv_starter_grants126 from public,anon,authenticated,service_role;
grant select on public.dv_starter_grants126 to authenticated;
-- One-time addition of the missing singleton starter motifs; no copies are removed.
with grants as(insert into public.dv_starter_grants126(user_id) select user_id from public.dv_profiles on conflict do nothing returning user_id)
insert into public.dv_inventory(user_id,variant_id,quantity) select g.user_id,v.id,1 from grants g cross join public.dv_card_variants v where v.rarity='common' and v.id=v.definition_id||':common' and v.definition_id in ('pepe','doge','roll-safe','harold','disaster-girl','confused','side-eye','success-kid','grumpy-cat','aliens-guy','smudge','bad-luck-brian','gigachad','stonks','trollface')
on conflict(user_id,variant_id) do update set quantity=greatest(public.dv_inventory.quantity,1);
-- Keep the verified-email welcome wrapper; replace only its private starter initializer.
create or replace function public.dv_initialize_base56() returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();fresh uuid;granted uuid;starter text[]:=ARRAY['pepe:common','doge:common','roll-safe:common','harold:common','disaster-girl:common','confused:common','side-eye:common','success-kid:common','grumpy-cat:common','aliens-guy:common','smudge:common','bad-luck-brian:common','gigachad:common','stonks:common','trollface:common']::text[];
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 insert into public.dv_profiles(user_id) values(u) on conflict do nothing returning user_id into fresh;
 insert into public.dv_starter_grants29(user_id) values(u) on conflict do nothing;
 insert into public.dv_starter_grants126(user_id) values(u) on conflict do nothing returning user_id into granted;
 if granted is not null then
  insert into public.dv_inventory(user_id,variant_id,quantity) select u,v.id,1 from public.dv_card_variants v where v.id=any(starter)
  on conflict(user_id,variant_id) do update set quantity=greatest(public.dv_inventory.quantity,1);
 end if;
 insert into public.dv_wallets(user_id) values(u) on conflict do nothing;
 if fresh is not null then insert into public.dv_decks(user_id,name,cards,active) values(u,'My first deck',starter,true);end if;
end;$$;
revoke all on function public.dv_initialize_base56() from public,anon,authenticated,service_role;
create or replace function public.dv_save_deck(p_id uuid,p_name text,p_cards text[]) returns uuid language plpgsql security definer set search_path='' as $$
declare cards text[];
begin
 if p_cards is null or cardinality(p_cards)<>15 or array_ndims(p_cards)<>1 or array_position(p_cards,null) is not null then raise exception 'Exactly 15 cards required';end if;
 cards:=public.dv_original_cards116(p_cards);
 if exists(select 1 from unnest(cards)c(id) join public.dv_card_variants v on v.id=c.id group by v.definition_id having count(*)>1) then raise exception 'Maximum 1 copy per meme across all finishes';end if;
 if (select count(*) from unnest(cards)c(id) join public.dv_card_variants v on v.id=c.id join public.dv_card_definitions d on d.id=v.definition_id where d.is_prime)>1 then raise exception 'Maximum 1 Prime per deck';end if;
 return public.dv_save_deck_base116(p_id,p_name,cards);
end;$$;
revoke all on function public.dv_save_deck(uuid,text,text[]) from public,anon,authenticated,service_role;
grant execute on function public.dv_save_deck(uuid,text,text[]) to authenticated;
create or replace function public.dv_match_deck90(p_user uuid,p_deck uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.dv_decks%rowtype;
begin
 select * into d from public.dv_decks where user_id=p_user and id=p_deck;
 if not found or cardinality(d.cards)<>15 then raise exception 'Choose a saved 15-card deck';end if;
 if exists(select 1 from unnest(d.cards) c(id) left join public.dv_card_variants v on v.id=c.id where v.id is null) or exists(select 1 from unnest(d.cards) c(id) join public.dv_card_variants v on v.id=c.id group by v.definition_id having count(*)>1) or exists(select 1 from unnest(d.cards) c(id) group by c.id having count(*)>coalesce((select quantity from public.dv_inventory where user_id=p_user and variant_id=c.id),0)) then raise exception 'Saved deck contains unavailable copies';end if;
 if (select count(*) from unnest(d.cards)c(id) join public.dv_card_variants v on v.id=c.id join public.dv_card_definitions p on p.id=v.definition_id where p.is_prime)>1 then raise exception 'Maximum 1 Prime per deck';end if;
 return jsonb_build_object('id',d.id,'name',d.name,'cards',to_jsonb(d.cards));
end;$$;
revoke all on function public.dv_match_deck90(uuid,uuid) from public,anon,authenticated,service_role;
create or replace function public.dv_trade_card_base95(p_request uuid,p_kind text,p_variant text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();v public.dv_card_variants%rowtype;old public.dv_card_transactions30%rowtype;owned integer;reserved integer;delta integer;balance bigint;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 if p_request is null or p_kind is null or p_kind not in ('craft','dismantle') then raise exception 'Invalid card action';end if;
 -- Same lock order as deck saving; retries and simultaneous trades cannot double-spend.
 perform 1 from public.dv_profiles where user_id=u for update;
 if not found then raise exception 'Initialize account first';end if;
 select * into old from public.dv_card_transactions30 where user_id=u and request_id=p_request;
 if found then
  if old.kind is distinct from p_kind or old.variant_id is distinct from p_variant then raise exception 'Request already used for a different action';end if;
  return jsonb_build_object('replayed',true,'variant',p_variant,'echo_delta',old.token_delta);
 end if;
 select * into v from public.dv_card_variants where id=p_variant;
 if not found then raise exception 'Unknown card';end if;
 select coalesce((select quantity from public.dv_inventory where user_id=u and variant_id=p_variant),0) into owned;
 select echoes into balance from public.dv_wallets where user_id=u for update;
 if not found then raise exception 'Wallet missing';end if;
 if p_kind='craft' then
  delta:=case v.rarity when 'common' then -100 when 'rare' then -400 when 'epic' then -1600 else null end;
  if delta is null then raise exception 'Diamond and Void are booster exclusive';end if;
  if balance+delta<0 then raise exception 'Not enough Echoes';end if;
  if owned>=100000 then raise exception 'Collection limit reached';end if;
  insert into public.dv_inventory(user_id,variant_id,quantity) values(u,p_variant,1)
   on conflict(user_id,variant_id) do update set quantity=public.dv_inventory.quantity+1;
 else
  -- A collection copy can serve several decks: reserve the maximum, never their sum.
  select coalesce(max(c.n),0)::integer into reserved from public.dv_decks d
    cross join lateral(select count(*)::integer n from unnest(d.cards) as card(id) where card.id=p_variant)c where d.user_id=u;
  if v.rarity='common' and v.definition_id in ('pepe','doge','roll-safe','harold','disaster-girl','confused','side-eye','success-kid','grumpy-cat','aliens-guy','smudge','bad-luck-brian','gigachad','stonks','trollface') then reserved:=greatest(reserved,1);end if;
  reserved:=least(reserved,1);
  if owned<=reserved then raise exception 'No spare copy: starter cards and saved decks are protected';end if;
  delta:=case v.rarity when 'common' then 10 when 'rare' then 25 when 'epic' then 60 when 'legendary' then 150 when 'mythic' then 400 end;
  update public.dv_inventory set quantity=quantity-1 where user_id=u and variant_id=p_variant;
 end if;
 update public.dv_wallets set echoes=echoes+delta where user_id=u returning echoes into balance;
 insert into public.dv_card_transactions30(user_id,request_id,kind,variant_id,token_delta) values(u,p_request,p_kind,p_variant,delta);
 insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values(u,'card30:'||u||':'||p_request,'echoes',delta);
 return jsonb_build_object('replayed',false,'variant',p_variant,'echo_delta',delta,'echoes',balance);
end;$$;
revoke all on function public.dv_trade_card_base95(uuid,text,text) from public,anon,authenticated,service_role;
create or replace function public.dv_allocate_alpha56(u uuid,p_request uuid,p_currency text,price integer) returns uuid language plpgsql security definer set search_path='' as $$
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
   where v.edition='alpha' and v.rarity=finish and coalesce(a.quantity,0)<1 order by random() limit 1;
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
revoke all on function public.dv_allocate_alpha56(uuid,uuid,text,integer) from public,anon,authenticated,service_role;
do $$begin
 if (select count(*) from public.dv_card_definitions where is_prime)<>10 then raise exception 'Expected ten Prime motifs';end if;
 if (select count(*) from public.dv_card_variants v join public.dv_card_definitions d on d.id=v.definition_id where d.is_prime and v.edition='alpha')<>50 then raise exception 'Expected fifty Prime finishes';end if;
end;$$;
create or replace function public.dv_match_fill_ai96(p_user uuid,p_id uuid,p_deck jsonb,p_identity jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.dv_pvp90%rowtype;
begin
 -- Same queue lock as human pairing and cancellation: exactly one outcome wins.
 perform pg_advisory_xact_lock(900090);
 select * into m from public.dv_pvp90 where id=p_id and host_id=p_user for update;
 if not found then raise exception 'Duel unavailable';end if;
 if m.status<>'waiting' or m.kind<>'random' or m.created_at>now()-interval '35 seconds' then return public.dv_match_get90(p_user,p_id);end if;
 if jsonb_typeof(p_deck->'cards') is distinct from 'array' then raise exception 'Invalid AI deck';end if;
 if jsonb_array_length(p_deck->'cards')<>15 or exists(select 1 from jsonb_array_elements_text(p_deck->'cards') c(id) left join public.dv_card_variants v on v.id=c.id where v.id is null or v.edition<>'alpha') or exists(select 1 from jsonb_array_elements_text(p_deck->'cards') c(id) join public.dv_card_variants v on v.id=c.id group by v.definition_id having count(*)>1) or (select count(*) from jsonb_array_elements_text(p_deck->'cards') c(id) join public.dv_card_variants v on v.id=c.id join public.dv_card_definitions d on d.id=v.definition_id where d.is_prime)>1 then raise exception 'Invalid AI deck';end if;
 if jsonb_typeof(p_identity) is distinct from 'object' or p_identity->>'isAi' is distinct from 'true' or length(p_identity->>'displayName') not between 1 and 24 then raise exception 'Invalid AI identity';end if;
 -- Refresh owned copies once, then freeze both decks for this duel and reconnects.
 m.host_deck:=public.dv_match_deck90(p_user,(m.host_deck->>'id')::uuid);
 update public.dv_pvp90 set status='matched',host_deck=m.host_deck,guest_deck=p_deck,ai_opponent96=p_identity,updated_at=now() where id=p_id;
 return public.dv_match_get90(p_user,p_id);
end;$$;

commit;
