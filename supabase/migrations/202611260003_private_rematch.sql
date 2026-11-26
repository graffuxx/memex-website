-- A finished duel keeps its results. Two fresh approvals create exactly one successor.
begin;
create table public.dv_private_rematches(
 parent_id uuid primary key references public.dv_pvp90(id) on delete cascade,
 host_deck_id uuid,
 guest_deck_id uuid,
 next_match_id uuid unique references public.dv_pvp90(id) on delete cascade,
 updated_at timestamptz not null default now()
);
alter table public.dv_private_rematches enable row level security;
revoke all on public.dv_private_rematches from public,anon,authenticated,service_role;

create function public.dv_private_rematch(p_user uuid,p_match uuid,p_action text,p_deck uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 parent public.dv_pvp90%rowtype;
 offer public.dv_private_rematches%rowtype;
 host boolean;
 previous_deck jsonb;
 host_deck jsonb;
 guest_deck jsonb;
begin
 if p_action is null or p_action not in ('status','ready','cancel') then raise exception 'Invalid rematch action';end if;
 if p_action<>'status' then
  -- Match the lock order used for friend invites and matchmaking.
  perform pg_advisory_xact_lock(920092);
  perform pg_advisory_xact_lock(900090);
 end if;
 select * into parent from public.dv_pvp90
  where id=p_match and p_user in (host_id,guest_id) and kind='private' and status='finished'
  and guest_id is not null and state->>'phase'='ended' and state->>'forfeit' is null;
 if not found then raise exception 'Rematch unavailable';end if;
 host:=p_user=parent.host_id;
 previous_deck:=case when host then parent.host_deck else parent.guest_deck end;
 select * into offer from public.dv_private_rematches where parent_id=p_match;

 if offer.next_match_id is null then
  -- Old readiness expires, but either player can still use the same results page.
  if offer.updated_at<now()-interval '15 minutes' then
   offer.host_deck_id:=null;offer.guest_deck_id:=null;
  end if;
  if p_action='ready' then
   if exists(select 1 from public.dv_friend_blocks92
    where (user_id,blocked_id) in ((parent.host_id,parent.guest_id),(parent.guest_id,parent.host_id))) then
    raise exception 'Rematch unavailable';
   end if;
   if exists(select 1 from public.dv_pvp_seats90 seat join public.dv_pvp90 match on match.id=seat.match_id
    where seat.user_id in (parent.host_id,parent.guest_id) and
     (match.status='matched' or (match.status='waiting' and match.updated_at>=now()-case match.kind when 'private' then interval '15 minutes' else interval '120 seconds' end))) then
    raise exception 'Finish or leave the other duel first';
   end if;
   p_deck:=coalesce(p_deck,(previous_deck->>'id')::uuid);
   perform 1 from public.dv_profiles where user_id in (parent.host_id,parent.guest_id) order by user_id for update;
   perform public.dv_match_deck90(p_user,p_deck);
   if host then offer.host_deck_id:=p_deck;else offer.guest_deck_id:=p_deck;end if;
   if offer.host_deck_id is not null and offer.guest_deck_id is not null then
    host_deck:=public.dv_match_deck90(parent.host_id,offer.host_deck_id);
    guest_deck:=public.dv_match_deck90(parent.guest_id,offer.guest_deck_id);
    -- Clear only stale seats belonging to the two players; the active-seat check above holds the queue lock.
    delete from public.dv_pvp_seats90 where user_id in (parent.host_id,parent.guest_id);
    insert into public.dv_pvp90(kind,status,host_id,guest_id,host_deck,guest_deck)
    values('private','matched',parent.host_id,parent.guest_id,host_deck,guest_deck) returning id into offer.next_match_id;
    insert into public.dv_pvp_seats90(user_id,match_id) values(parent.host_id,offer.next_match_id),(parent.guest_id,offer.next_match_id);
   end if;
  elsif p_action='cancel' then
   if host then offer.host_deck_id:=null;else offer.guest_deck_id:=null;end if;
  end if;
  if p_action<>'status' then
   insert into public.dv_private_rematches(parent_id,host_deck_id,guest_deck_id,next_match_id)
    values(p_match,offer.host_deck_id,offer.guest_deck_id,offer.next_match_id)
    on conflict(parent_id) do update set host_deck_id=excluded.host_deck_id,guest_deck_id=excluded.guest_deck_id,
     next_match_id=excluded.next_match_id,updated_at=now();
  end if;
 end if;

 return jsonb_build_object('ownReady',(case when host then offer.host_deck_id else offer.guest_deck_id end) is not null,
  'opponentReady',(case when host then offer.guest_deck_id else offer.host_deck_id end) is not null,
  'nextMatchId',offer.next_match_id,'previousDeckId',previous_deck->>'id','previousDeckFormat',coalesce(previous_deck->>'format','owned'));
end;$$;
revoke all on function public.dv_private_rematch(uuid,uuid,text,uuid) from public,anon,authenticated,service_role;
grant execute on function public.dv_private_rematch(uuid,uuid,text,uuid) to service_role;
commit;
