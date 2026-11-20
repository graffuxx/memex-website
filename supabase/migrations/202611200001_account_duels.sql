-- Only the authenticated game service can write game states or mint round Pixels.
begin;
create table public.dv_game_sessions50(
 id uuid primary key,user_id uuid not null references public.dv_profiles(user_id) on delete cascade,
 state jsonb not null,version integer not null default 0,active boolean not null default true,
 last_request uuid,last_reply jsonb,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create unique index dv_game_one_active50 on public.dv_game_sessions50(user_id) where active;
alter table public.dv_game_sessions50 enable row level security;
revoke all on public.dv_game_sessions50 from public,anon,authenticated;
-- No client direct reads: game state is returned only by the authenticated game service.
grant select on public.dv_game_sessions50,public.dv_decks,public.dv_inventory,public.dv_wallets to service_role;
create function public.dv_game_start50(p_user uuid,p_id uuid,p_state jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare old public.dv_game_sessions50%rowtype;
begin
 perform 1 from public.dv_profiles where user_id=p_user for update;
 if not found then raise exception 'Account unavailable';end if;
 select * into old from public.dv_game_sessions50 where id=p_id;
 if found then
  if old.user_id<>p_user or not old.active then raise exception 'Duel unavailable';end if;
  return jsonb_build_object('id',old.id,'version',old.version,'state',old.state);
 end if;
 if p_state->>'ruleset'<>'account-50' or (p_state->>'round')::integer<>1 or coalesce((p_state->'game'->>'placements')::integer,99)>1 then raise exception 'Invalid duel';end if;
 -- Recheck ownership under the same account lock used by deck/crafting transactions.
 if not exists(select 1 from public.dv_decks where user_id=p_user and id=(p_state->'deck'->>'id')::uuid and to_jsonb(cards)=p_state->'deck'->'cards') then raise exception 'Saved deck changed. Reload your deck.';end if;
 if exists(select 1 from jsonb_array_elements_text(p_state->'deck'->'cards') c(id) group by c.id having count(*)>coalesce((select quantity from public.dv_inventory where user_id=p_user and variant_id=c.id),0)) then raise exception 'Owned copies changed. Reload your deck.';end if;
 update public.dv_game_sessions50 set active=false where user_id=p_user and active;
 insert into public.dv_game_sessions50(id,user_id,state) values(p_id,p_user,p_state);
 return jsonb_build_object('id',p_id,'version',0,'state',p_state);
end;$$;
create function public.dv_game_commit50(p_user uuid,p_id uuid,p_version integer,p_request uuid,p_state jsonb,p_steps jsonb,p_award integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare old public.dv_game_sessions50%rowtype;balance jsonb;reply jsonb;credited integer:=0;round_no integer;event text;
begin
 if p_request is null then raise exception 'Missing request';end if;
 perform 1 from public.dv_profiles where user_id=p_user for update;
 select * into old from public.dv_game_sessions50 where id=p_id and user_id=p_user for update;
 if not found or not old.active then raise exception 'Duel unavailable';end if;
 if old.last_request=p_request then return old.last_reply;end if;
 if old.version<>p_version then raise exception 'Duel changed. Restore the saved game.' using errcode='40001';end if;
 if p_state->>'ruleset'<>'account-50' or p_state->'deck' is distinct from old.state->'deck' then raise exception 'Invalid duel state';end if;
 if p_award not in (0,2,5) then raise exception 'Invalid reward';end if;
 if p_award>0 then
  round_no:=(p_state->>'round')::integer;
  if round_no not in (1,2) or round_no<>(old.state->>'round')::integer or coalesce((old.state->'game'->>'finished')::boolean,true) or not coalesce((p_state->'game'->>'finished')::boolean,false) or (p_state->'game'->>'placements')::integer<>18 then raise exception 'Only a completed round earns Pixels';end if;
  if p_award<>(case when (p_state->'game'->>'winner')::integer=0 then 5 else 2 end) then raise exception 'Incorrect reward';end if;
  event:='game50:'||p_id||':'||round_no;
  insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values(p_user,event,'earned',p_award) on conflict do nothing;
  if found then update public.dv_wallets set earned=earned+p_award where user_id=p_user;credited:=p_award;end if;
 end if;
 select jsonb_build_object('pixels',earned,'shards',premium,'echoes',echoes) into balance from public.dv_wallets where user_id=p_user;
 reply:=jsonb_build_object('id',p_id,'version',p_version+1,'state',p_state,'steps',p_steps,'award',credited,'wallet',balance);
 update public.dv_game_sessions50 set state=p_state,version=p_version+1,last_request=p_request,last_reply=reply,updated_at=now() where id=p_id;
 return reply;
end;$$;
revoke all on function public.dv_game_start50(uuid,uuid,jsonb),public.dv_game_commit50(uuid,uuid,integer,uuid,jsonb,jsonb,integer) from public,anon,authenticated;
grant execute on function public.dv_game_start50(uuid,uuid,jsonb),public.dv_game_commit50(uuid,uuid,integer,uuid,jsonb,jsonb,integer) to service_role;
commit;
