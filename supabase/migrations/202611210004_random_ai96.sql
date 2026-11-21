-- Labelled AI fallback for an empty Random queue. Never create fake player accounts.
begin;
alter table public.dv_pvp90 add column ai_opponent96 jsonb;
alter table public.dv_pvp90 add constraint dv_ai_seat96 check(ai_opponent96 is null or (kind='random' and guest_id is null and guest_deck is not null and jsonb_typeof(ai_opponent96)='object' and ai_opponent96->>'isAi'='true'));
create function public.dv_match_fill_ai96(p_user uuid,p_id uuid,p_deck jsonb,p_identity jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.dv_pvp90%rowtype;
begin
 -- Same queue lock as human pairing and cancellation: exactly one outcome wins.
 perform pg_advisory_xact_lock(900090);
 select * into m from public.dv_pvp90 where id=p_id and host_id=p_user for update;
 if not found then raise exception 'Duel unavailable';end if;
 if m.status<>'waiting' or m.kind<>'random' or m.created_at>now()-interval '15 seconds' then return public.dv_match_get90(p_user,p_id);end if;
 if jsonb_typeof(p_deck->'cards') is distinct from 'array' then raise exception 'Invalid AI deck';end if;
 if jsonb_array_length(p_deck->'cards')<>15 or exists(select 1 from jsonb_array_elements_text(p_deck->'cards') c(id) left join public.dv_card_variants v on v.id=c.id where v.id is null or v.edition<>'alpha') or exists(select 1 from jsonb_array_elements_text(p_deck->'cards') c(id) join public.dv_card_variants v on v.id=c.id group by v.definition_id having count(*)>3) then raise exception 'Invalid AI deck';end if;
 if jsonb_typeof(p_identity) is distinct from 'object' or p_identity->>'isAi' is distinct from 'true' or length(p_identity->>'displayName') not between 1 and 24 then raise exception 'Invalid AI identity';end if;
 -- Refresh owned copies once, then freeze both decks for this duel and reconnects.
 m.host_deck:=public.dv_match_deck90(p_user,(m.host_deck->>'id')::uuid);
 update public.dv_pvp90 set status='matched',host_deck=m.host_deck,guest_deck=p_deck,ai_opponent96=p_identity,updated_at=now() where id=p_id;
 return public.dv_match_get90(p_user,p_id);
end;$$;
alter function public.dv_match_get90(uuid,uuid) rename to dv_match_get_human96;
create function public.dv_match_get90(p_user uuid,p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare r jsonb;
begin
 r:=public.dv_match_get_human96(p_user,p_id);
 if r->>'ai_opponent96' is not null then r:=jsonb_set(r,'{identities,1}',r->'ai_opponent96');end if;
 return r;
end;$$;
alter function public.dv_match_commit90(uuid,uuid,integer,uuid,jsonb) rename to dv_match_commit_human96;
create function public.dv_match_commit90(p_user uuid,p_id uuid,p_version integer,p_request uuid,p_state jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.dv_pvp90%rowtype;rn integer;award integer;
begin
 select * into m from public.dv_pvp90 where id=p_id and (host_id=p_user or guest_id=p_user) for update;
 if not found or p_request is null then raise exception 'Duel unavailable';end if;
 if m.ai_opponent96 is null then return public.dv_match_commit_human96(p_user,p_id,p_version,p_request,p_state);end if;
 if exists(select 1 from public.dv_pvp_requests90 where match_id=p_id and request_id=p_request and user_id=p_user) then return public.dv_match_get90(p_user,p_id);end if;
 if m.status<>'matched' then raise exception 'Duel has ended';end if;
 if m.version<>p_version then raise exception 'Duel changed. Restore the saved game.' using errcode='40001';end if;
 if p_state->>'ruleset' is distinct from 'pvp-90' or p_state->'decks' is distinct from jsonb_build_array(m.host_deck,m.guest_deck) or jsonb_typeof(p_state->'bot96') is distinct from 'object' then raise exception 'Invalid AI duel state';end if;
 if m.state is null and (p_state->>'phase'<>'rps' or p_state->'game'<>'null'::jsonb) then raise exception 'Invalid initial state';end if;
 perform 1 from public.dv_profiles where user_id=p_user for update;
 if coalesce((p_state->'game'->>'finished')::boolean,false) and not coalesce((m.state->'game'->>'finished')::boolean,false) and p_state->>'forfeit' is null then
  if (p_state->'game'->>'placements')::integer<>18 then raise exception 'Incomplete AI round';end if;
  rn:=(p_state->>'round')::integer;award:=case when p_state->'game'->>'winner'='0' then 5 else 2 end;
  -- AI Pixels only. This key cannot grant win XP, PvP titles, quest or referral credit.
  insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values(p_user,'bot96:'||p_id||':'||rn,'earned',award) on conflict do nothing;
  if found then update public.dv_wallets set earned=earned+award where user_id=p_user;end if;
 end if;
 update public.dv_pvp90 set state=p_state,version=p_version+1,status=case when p_state->>'phase'='ended' then 'finished' else 'matched' end,updated_at=now() where id=p_id;
 insert into public.dv_pvp_requests90 values(p_id,p_request,p_user);
 if p_state->>'phase'='ended' then delete from public.dv_pvp_seats90 where match_id=p_id;end if;
 return public.dv_match_get90(p_user,p_id);
end;$$;
-- Keep bot results in the existing private AI analytics, never human PvP balance.
create or replace function public.dv_balance_capture94() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_table_name='dv_pvp90' then
  perform public.dv_balance_archive94('pvp',new.id,new.state,case when new.ai_opponent96 is not null then 'ai' else new.kind end,array[new.host_id,new.guest_id],new.created_at);
 else
  perform public.dv_balance_archive94('account',new.id,new.state,'ai',array[new.user_id,null::uuid],new.created_at);
 end if;
 return new;
end;$$;
revoke all on function public.dv_match_fill_ai96(uuid,uuid,jsonb,jsonb),public.dv_match_get_human96(uuid,uuid),public.dv_match_get90(uuid,uuid),public.dv_match_commit_human96(uuid,uuid,integer,uuid,jsonb),public.dv_match_commit90(uuid,uuid,integer,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.dv_match_fill_ai96(uuid,uuid,jsonb,jsonb),public.dv_match_get90(uuid,uuid),public.dv_match_commit90(uuid,uuid,integer,uuid,jsonb) to service_role;
commit;
