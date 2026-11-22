-- Recover and leave an owned duel without relying on a rendered board or client version.
begin;
create or replace function public.dv_match_active112(p_user uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not exists(select 1 from auth.users where id=p_user and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Verify your email before matchmaking';end if;
 select jsonb_build_object('id',m.id,'kind',m.kind,'status',m.status,'phase',coalesce(m.state->>'phase',m.status),'version',m.version)
 into result from public.dv_pvp_seats90 s join public.dv_pvp90 m on m.id=s.match_id
 where s.user_id=p_user and (m.host_id=p_user or m.guest_id=p_user) and m.status in ('waiting','matched');
 return result;
end;$$;
create or replace function public.dv_match_leave112(p_user uuid,p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.dv_pvp90%rowtype;solo public.dv_game_sessions50%rowtype;s jsonb;side integer;
begin
 if not exists(select 1 from auth.users where id=p_user and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Verify your email before matchmaking';end if;
 -- Matchmaking uses the same queue lock; the row lock serializes concurrent turns.
 perform pg_advisory_xact_lock(900090);
 select * into m from public.dv_pvp90 where id=p_id and (host_id=p_user or guest_id=p_user) for update;
 if not found then
  select * into solo from public.dv_game_sessions50 where id=p_id and user_id=p_user for update;
  if not found then raise exception 'Duel unavailable';end if;
  if solo.active then update public.dv_game_sessions50 set active=false,version=version+1,updated_at=now(),state=state||jsonb_build_object('forfeit',0,'exitReason112','player_left') where id=p_id;end if;
  return jsonb_build_object('id',p_id,'left',true);
 end if;
 if m.status='waiting' then
  update public.dv_pvp90 set status='cancelled',updated_at=now(),version=version+1 where id=p_id;
 elsif m.status='matched' then
  side:=case when m.host_id=p_user then 0 else 1 end;
  s:=jsonb_build_object('ruleset','pvp-90','round',1,'results','[]'::jsonb,'choices',jsonb_build_array(null,null),'ready',jsonb_build_array(false,false),'decks',jsonb_build_array(m.host_deck,m.guest_deck),'game',null,'starter',null,'attempt',1)
    ||coalesce(m.state,'{}'::jsonb)||jsonb_build_object('phase','ended','forfeit',side,'deadline',null,'step',null,'exitReason112','player_left');
  -- A concession grants no currency, XP, wins or quests. Earlier completed rounds stay intact.
  update public.dv_pvp90 set state=s,status='finished',version=version+1,updated_at=now() where id=p_id;
 end if;
 delete from public.dv_pvp_seats90 where match_id=p_id;
 update public.dv_friend_duels92 set status='declined' where match_id=p_id and status='pending';
 return jsonb_build_object('id',p_id,'left',true);
end;$$;
revoke all on function public.dv_match_active112(uuid),public.dv_match_leave112(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.dv_match_active112(uuid),public.dv_match_leave112(uuid,uuid) to service_role;
commit;
