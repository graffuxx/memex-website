-- Server-owned Tokens, atomic card trades, and trusted round results.
-- No checkout or browser-supplied score can mint currency.
begin;
create table public.dv_card_transactions30(
 user_id uuid not null references public.dv_profiles(user_id) on delete cascade,
 request_id uuid not null,kind text not null check(kind in ('craft','dismantle')),
 variant_id text not null references public.dv_card_variants(id),token_delta integer not null,
 created_at timestamptz not null default now(),primary key(user_id,request_id)
);
alter table public.dv_card_transactions30 enable row level security;
create policy dv_card_transactions_own on public.dv_card_transactions30 for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.dv_card_transactions30 from public,anon,authenticated;
grant select on public.dv_card_transactions30 to authenticated;

create function public.dv_trade_card(p_request uuid,p_kind text,p_variant text) returns jsonb language plpgsql security definer set search_path='' as $$
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
  return jsonb_build_object('replayed',true,'variant',p_variant,'token_delta',old.token_delta);
 end if;
 select * into v from public.dv_card_variants where id=p_variant;
 if not found then raise exception 'Unknown card';end if;
 select coalesce((select quantity from public.dv_inventory where user_id=u and variant_id=p_variant),0) into owned;
 select earned into balance from public.dv_wallets where user_id=u for update;
 if not found then raise exception 'Wallet missing';end if;
 if p_kind='craft' then
  delta:=case v.rarity when 'common' then -100 when 'rare' then -400 when 'epic' then -1600 else null end;
  if delta is null then raise exception 'Diamond and Void are booster exclusive';end if;
  if balance+delta<0 then raise exception 'Not enough Tokens';end if;
  if owned>=100000 then raise exception 'Collection limit reached';end if;
  insert into public.dv_inventory(user_id,variant_id,quantity) values(u,p_variant,1)
   on conflict(user_id,variant_id) do update set quantity=public.dv_inventory.quantity+1;
 else
  -- A collection copy can serve several decks: reserve the maximum, never their sum.
  select coalesce(max(c.n),0)::integer into reserved from public.dv_decks d
    cross join lateral(select count(*)::integer n from unnest(d.cards) as card(id) where card.id=p_variant)c where d.user_id=u;
  if v.rarity='common' and v.definition_id in ('pepe','doge','roll-safe','harold','disaster-girl','confused') then reserved:=greatest(reserved,3);end if;
  if owned<=reserved then raise exception 'No spare copy: starter cards and saved decks are protected';end if;
  delta:=case v.rarity when 'common' then 10 when 'rare' then 25 when 'epic' then 60 when 'legendary' then 150 when 'mythic' then 400 end;
  update public.dv_inventory set quantity=quantity-1 where user_id=u and variant_id=p_variant;
 end if;
 update public.dv_wallets set earned=earned+delta where user_id=u returning earned into balance;
 insert into public.dv_card_transactions30(user_id,request_id,kind,variant_id,token_delta) values(u,p_request,p_kind,p_variant,delta);
 insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values(u,'card30:'||u||':'||p_request,'earned',delta);
 return jsonb_build_object('replayed',false,'variant',p_variant,'token_delta',delta,'tokens',balance);
end;$$;
revoke all on function public.dv_trade_card(uuid,text,text) from public,anon;
grant execute on function public.dv_trade_card(uuid,text,text) to authenticated;

create table public.dv_verified_rounds30(
 round_id uuid primary key,player_a uuid not null references public.dv_profiles(user_id),player_b uuid not null references public.dv_profiles(user_id),
 winner uuid references public.dv_profiles(user_id),verified_at timestamptz not null default now(),
 check(player_a<>player_b),check(winner is null or winner=player_a or winner=player_b)
);
alter table public.dv_verified_rounds30 enable row level security;
create policy dv_verified_rounds_own on public.dv_verified_rounds30 for select to authenticated using((select auth.uid()) in (player_a,player_b));
revoke all on public.dv_verified_rounds30 from public,anon,authenticated;
grant select on public.dv_verified_rounds30 to authenticated;
-- Only a trusted game service may call this after verifying a completed round.
-- The existing local AI game deliberately has no client route to this function.
create function public.dv_settle_verified_round(p_round uuid,p_a uuid,p_b uuid,p_winner uuid) returns void language plpgsql security definer set search_path='' as $$
declare old public.dv_verified_rounds30%rowtype;r record;amount integer;
begin
 if p_round is null or p_a is null or p_b is null or p_a=p_b or (p_winner is not null and p_winner<>p_a and p_winner<>p_b) then raise exception 'Invalid round result';end if;
 -- Stable lock order also prevents concurrent finalization and wallet races.
 perform 1 from public.dv_profiles where user_id in (p_a,p_b) order by user_id for update;
 select * into old from public.dv_verified_rounds30 where round_id=p_round;
 if found then
  if old.player_a is distinct from p_a or old.player_b is distinct from p_b or old.winner is distinct from p_winner then raise exception 'Round already finalized with a different result';end if;
  return;
 end if;
 if (select count(*) from public.dv_wallets where user_id in (p_a,p_b))<>2 then raise exception 'Two initialized players required';end if;
 insert into public.dv_verified_rounds30(round_id,player_a,player_b,winner) values(p_round,p_a,p_b,p_winner);
 for r in select user_id from public.dv_wallets where user_id in (p_a,p_b) order by user_id loop
  amount:=case when r.user_id=p_winner then 5 else 2 end;
  update public.dv_wallets set earned=earned+amount where user_id=r.user_id;
  insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values(r.user_id,'round30:'||p_round||':'||r.user_id,'earned',amount);
 end loop;
end;$$;
revoke all on function public.dv_settle_verified_round(uuid,uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.dv_settle_verified_round(uuid,uuid,uuid,uuid) to service_role;
commit;
