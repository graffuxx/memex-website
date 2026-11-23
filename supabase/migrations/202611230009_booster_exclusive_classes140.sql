-- Prime and Iconic cards are available from boosters. Decks may include two
-- Iconics and one Prime, with one copy of each motif across all finishes.
begin;

create or replace function public.dv_validate_cards131(p_cards text[],p_set text default null) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_cards is null or cardinality(p_cards)<>15 or array_ndims(p_cards)<>1 or array_position(p_cards,null) is not null then raise exception 'Exactly 15 cards required';end if;
 if exists(select 1 from unnest(p_cards)c(id) left join public.dv_card_variants v on v.id=c.id left join public.dv_card_definitions d on d.id=v.definition_id where v.id is null or d.set_id is null or (p_set is not null and d.set_id<>p_set)) then raise exception 'Card unavailable in this format';end if;
 if exists(select 1 from unnest(p_cards)c(id) join public.dv_card_variants v on v.id=c.id group by v.definition_id having count(*)>1) then raise exception 'Maximum 1 copy per meme across all finishes';end if;
 if (select count(*) from unnest(p_cards)c(id) join public.dv_card_variants v on v.id=c.id join public.dv_card_definitions d on d.id=v.definition_id where d.is_prime)>1 then raise exception 'Maximum 1 Prime per deck';end if;
 if (select count(*) from unnest(p_cards)c(id) join public.dv_card_variants v on v.id=c.id join public.dv_card_definitions d on d.id=v.definition_id where d.card_class='iconic')>2 then raise exception 'Maximum 2 Iconics per deck';end if;
end;$$;

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
  if exists (
   select 1 from public.dv_card_definitions d
   where d.id=v.definition_id and (d.is_prime or d.card_class in ('prime','iconic'))
  ) then
   raise exception 'Prime and Iconic cards are booster exclusive';
  end if;
  delta:=case v.rarity when 'common' then -100 when 'rare' then -400 when 'epic' then -1600 else null end;
  if delta is null then raise exception 'Diamond and Void are booster exclusive';end if;
  if balance+delta<0 then raise exception 'Not enough Echoes';end if;
  if owned>=100000 then raise exception 'Collection limit reached';end if;
  insert into public.dv_inventory(user_id,variant_id,quantity) values(u,p_variant,1)
   on conflict(user_id,variant_id) do update set quantity=public.dv_inventory.quantity+1;
 else
  -- A collection copy can serve several decks: reserve the maximum, never their sum.
  select coalesce(max(c.n),0)::integer into reserved from public.dv_decks d
    cross join lateral(select count(*)::integer n from unnest(d.cards) as card(id) where card.id=p_variant)c where d.user_id=u and d.format='owned';
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

revoke all on function public.dv_validate_cards131(text[],text),
 public.dv_trade_card_base95(uuid,text,text) from public,anon,authenticated,service_role;
commit;
