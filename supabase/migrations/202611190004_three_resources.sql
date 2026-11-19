-- Three separate resources. Keep existing columns earned=Pixels, premium=Shards for compatibility.
-- Echoes are only minted by dismantling and only spent on crafting.
begin;
alter table public.dv_wallets add column echoes bigint not null default 0 check(echoes>=0);
alter table public.dv_reward_ledger drop constraint dv_reward_ledger_currency_check;
alter table public.dv_reward_ledger add constraint dv_reward_ledger_currency_check check(currency in ('earned','premium','echoes'));
create table public.dv_currency_split31(
 user_id uuid primary key references public.dv_profiles(user_id) on delete cascade,
 legacy_card_balance bigint not null check(legacy_card_balance>=0),created_at timestamptz not null default now()
);
alter table public.dv_currency_split31 enable row level security;
create policy dv_currency_split_own on public.dv_currency_split31 for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.dv_currency_split31 from public,anon,authenticated;
grant select on public.dv_currency_split31 to authenticated;
-- Preserve the total balance: transfer only the still-available positive net balance from legacy card trades.
-- Other earned balances stay Pixels. Shards, inventory and saved decks are untouched.
-- Historical ledger entries remain intact; paired transfer entries explain the boundary.
do $$
declare u uuid;wallet public.dv_wallets%rowtype;card_net bigint;move_amount bigint;
begin
 for u in select user_id from public.dv_profiles order by user_id for update loop
  if exists(select 1 from public.dv_currency_split31 where user_id=u) then continue;end if;
  select * into wallet from public.dv_wallets where user_id=u for update;
  if not found then continue;end if;
  select coalesce(sum(token_delta),0) into card_net from public.dv_card_transactions30 where user_id=u;
  move_amount:=least(wallet.earned,greatest(card_net,0));
  if move_amount>0 then
   update public.dv_wallets set earned=earned-move_amount,echoes=echoes+move_amount where user_id=u;
   insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values
    (u,'currency31:'||u||':from-earned','earned',-move_amount),
    (u,'currency31:'||u||':to-echoes','echoes',move_amount);
  end if;
  insert into public.dv_currency_split31(user_id,legacy_card_balance) values(u,move_amount);
 end loop;
end;$$;
create or replace function public.dv_trade_card(p_request uuid,p_kind text,p_variant text) returns jsonb language plpgsql security definer set search_path='' as $$
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
  if v.rarity='common' and v.definition_id in ('pepe','doge','roll-safe','harold','disaster-girl','confused') then reserved:=greatest(reserved,3);end if;
  if owned<=reserved then raise exception 'No spare copy: starter cards and saved decks are protected';end if;
  delta:=case v.rarity when 'common' then 10 when 'rare' then 25 when 'epic' then 60 when 'legendary' then 150 when 'mythic' then 400 end;
  update public.dv_inventory set quantity=quantity-1 where user_id=u and variant_id=p_variant;
 end if;
 update public.dv_wallets set echoes=echoes+delta where user_id=u returning echoes into balance;
 insert into public.dv_card_transactions30(user_id,request_id,kind,variant_id,token_delta) values(u,p_request,p_kind,p_variant,delta);
 insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values(u,'card30:'||u||':'||p_request,'echoes',delta);
 return jsonb_build_object('replayed',false,'variant',p_variant,'echo_delta',delta,'echoes',balance);
end;$$;
revoke all on function public.dv_trade_card(uuid,text,text) from public,anon;
grant execute on function public.dv_trade_card(uuid,text,text) to authenticated;

-- Verified round settlement continues to credit earned (Pixels), never Echoes or premium (Shards).
-- No Pixels-to-Echoes conversion, purchase endpoint or booster sale is introduced here.
commit;
