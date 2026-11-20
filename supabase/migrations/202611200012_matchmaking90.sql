-- Authoritative two-player random matchmaking and private invitations.
begin;
create table public.dv_pvp90(id uuid primary key default gen_random_uuid(),kind text not null check(kind in ('random','private')),status text not null default 'waiting' check(status in ('waiting','matched','finished','cancelled')),host_id uuid not null references public.dv_profiles(user_id) on delete cascade,guest_id uuid references public.dv_profiles(user_id) on delete cascade,invite_code text unique,host_deck jsonb not null,guest_deck jsonb,state jsonb,version integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),check(guest_id is null or guest_id<>host_id));
create index dv_pvp_wait90 on public.dv_pvp90(kind,status,updated_at);
create table public.dv_pvp_seats90(user_id uuid primary key references public.dv_profiles(user_id) on delete cascade,match_id uuid not null references public.dv_pvp90(id) on delete cascade);
create table public.dv_pvp_requests90(match_id uuid not null references public.dv_pvp90(id) on delete cascade,request_id uuid not null,user_id uuid not null references public.dv_profiles(user_id) on delete cascade,primary key(match_id,request_id));
create table public.dv_pvp_rounds90(match_id uuid not null references public.dv_pvp90(id) on delete cascade,user_id uuid not null references public.dv_profiles(user_id) on delete cascade,round_no integer not null check(round_no in (1,2)),award integer not null check(award in (2,5)),increments jsonb not null,primary key(match_id,user_id,round_no));
create table public.dv_random_skills90(user_id uuid primary key references public.dv_profiles(user_id) on delete cascade,double_flips bigint not null default 0,triple_flips bigint not null default 0,quad_flips bigint not null default 0,total_flips bigint not null default 0,comeback_wins bigint not null default 0,dominant_wins bigint not null default 0,duel_sweeps bigint not null default 0);
-- Clients never read either deck, hidden choices, raw match state, or write rewards.
alter table public.dv_pvp90 enable row level security;
alter table public.dv_pvp_seats90 enable row level security;
alter table public.dv_pvp_requests90 enable row level security;
alter table public.dv_pvp_rounds90 enable row level security;
alter table public.dv_random_skills90 enable row level security;
revoke all on public.dv_pvp90,public.dv_pvp_seats90,public.dv_pvp_requests90,public.dv_pvp_rounds90,public.dv_random_skills90 from public,anon,authenticated,service_role;
create function public.dv_match_deck90(p_user uuid,p_deck uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.dv_decks%rowtype;
begin
 select * into d from public.dv_decks where user_id=p_user and id=p_deck;
 if not found or cardinality(d.cards)<>15 then raise exception 'Choose a saved 15-card deck';end if;
 if exists(select 1 from unnest(d.cards) c(id) left join public.dv_card_variants v on v.id=c.id where v.id is null) or exists(select 1 from unnest(d.cards) c(id) join public.dv_card_variants v on v.id=c.id group by v.definition_id having count(*)>3) or exists(select 1 from unnest(d.cards) c(id) group by c.id having count(*)>coalesce((select quantity from public.dv_inventory where user_id=p_user and variant_id=c.id),0)) then raise exception 'Saved deck contains unavailable copies';end if;
 return jsonb_build_object('id',d.id,'name',d.name,'cards',to_jsonb(d.cards));
end;$$;
create function public.dv_match_join90(p_user uuid,p_kind text,p_deck uuid,p_code text default null) returns uuid language plpgsql security definer set search_path='' as $$
declare m public.dv_pvp90%rowtype;deck jsonb;existing uuid;
begin
 if p_kind not in ('random','private') or p_kind is null then raise exception 'Ranked is coming soon';end if;
 if not exists(select 1 from auth.users where id=p_user and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Verify your email before matchmaking';end if;
 -- One short queue lock prevents double pairing and simultaneous self-matches.
 perform pg_advisory_xact_lock(900090);
 update public.dv_pvp90 set status='cancelled' where status='waiting' and updated_at<now()-interval '120 seconds';
 delete from public.dv_pvp_seats90 s using public.dv_pvp90 q where s.match_id=q.id and q.status in ('finished','cancelled');
 select match_id into existing from public.dv_pvp_seats90 where user_id=p_user;if found then return existing;end if;
 perform 1 from public.dv_profiles where user_id=p_user for update;deck:=public.dv_match_deck90(p_user,p_deck);
 if p_code is not null then
  if p_kind<>'private' or p_code !~ '^[a-f0-9]{64}$' then raise exception 'Invalid invitation';end if;
  select * into m from public.dv_pvp90 where invite_code=p_code and kind='private' and status='waiting' and host_id<>p_user for update;
  if not found then raise exception 'Invitation expired or already used';end if;
 elsif p_kind='random' then
  select * into m from public.dv_pvp90 where kind='random' and status='waiting' and host_id<>p_user order by created_at,id limit 1 for update;
 end if;
 if m.id is not null then
  -- Recheck the waiting host's deck and owned copies before freezing both decks.
  perform 1 from public.dv_profiles where user_id=m.host_id for update;
  m.host_deck:=public.dv_match_deck90(m.host_id,(m.host_deck->>'id')::uuid);
  update public.dv_pvp90 set guest_id=p_user,guest_deck=deck,host_deck=m.host_deck,status='matched',updated_at=now() where id=m.id;
 else
  insert into public.dv_pvp90(kind,host_id,host_deck,invite_code) values(p_kind,p_user,deck,case when p_kind='private' then replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','') end) returning * into m;
  insert into public.dv_pvp_seats90(user_id,match_id) values(p_user,m.id);return m.id;
 end if;
 insert into public.dv_pvp_seats90(user_id,match_id) values(p_user,m.id);return m.id;
end;$$;
create function public.dv_public_identity90(p_user uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('displayName',p.display_name,'avatarId',p.avatar_id85,'frameId',p.frame_id85,'titleId',p.title_id85,'xp',coalesce(s.xp,0),'skills',public.dv_player_skills88(p_user)) from public.dv_profiles p left join public.dv_profile_progress85 s using(user_id) where p.user_id=p_user
$$;
create function public.dv_match_get90(p_user uuid,p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.dv_pvp90%rowtype;result jsonb;
begin
 select * into m from public.dv_pvp90 where id=p_id and (host_id=p_user or guest_id=p_user);
 if not found then raise exception 'Duel unavailable';end if;
 if m.status='waiting' then update public.dv_pvp90 set updated_at=now() where id=p_id;end if;
 select to_jsonb(m)||jsonb_build_object('identities',jsonb_build_array(public.dv_public_identity90(m.host_id),public.dv_public_identity90(m.guest_id)),'wallet',jsonb_build_object('pixels',earned,'shards',premium,'echoes',echoes)) into result from public.dv_wallets where user_id=p_user;
 return result;
end;$$;
create function public.dv_match_cancel90(p_user uuid,p_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(900090);
 update public.dv_pvp90 set status='cancelled',updated_at=now() where id=p_id and host_id=p_user and status='waiting';if not found then raise exception 'A match was found. Resume the duel instead.';end if;
 delete from public.dv_pvp_seats90 where user_id=p_user and match_id=p_id;
end;$$;
create function public.dv_pvp_skill90(p_state jsonb,p_side integer) returns jsonb language plpgsql immutable set search_path='' as $$
declare s jsonb:=p_state;g jsonb:=p_state->'game';h jsonb;r jsonb;
begin
 if p_side=1 then
  select jsonb_agg(e||jsonb_build_object('side',1-(e->>'side')::integer) order by n) into h from jsonb_array_elements(g->'history') with ordinality t(e,n);
  select jsonb_agg(jsonb_build_array(e->1,e->0) order by n) into r from jsonb_array_elements(s->'results') with ordinality t(e,n);
  g:=g||jsonb_build_object('history',h,'winner',case when g->>'winner' is null then null else 1-(g->>'winner')::integer end);s:=s||jsonb_build_object('results',r);
 end if;
 return public.dv_skill_snapshot88(s||jsonb_build_object('ruleset','account-50','game',g));
end;$$;
create function public.dv_match_commit90(p_user uuid,p_id uuid,p_version integer,p_request uuid,p_state jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.dv_pvp90%rowtype;u uuid;side integer;delta jsonb;award integer;rn integer;complete boolean;
begin
 select * into m from public.dv_pvp90 where id=p_id and (host_id=p_user or guest_id=p_user) for update;
 if not found or p_request is null then raise exception 'Duel unavailable';end if;
 if exists(select 1 from public.dv_pvp_requests90 where match_id=p_id and request_id=p_request and user_id=p_user) then return public.dv_match_get90(p_user,p_id);end if;
 if m.status<>'matched' then raise exception 'Duel has ended';end if;
 if m.version<>p_version then raise exception 'Duel changed. Restore the saved game.' using errcode='40001';end if;
 if p_state->>'ruleset'<>'pvp-90' or p_state->'decks' is distinct from jsonb_build_array(m.host_deck,m.guest_deck) then raise exception 'Invalid duel state';end if;
 if m.state is null and (p_state->>'phase'<>'rps' or p_state->'game'<>'null'::jsonb) then raise exception 'Invalid initial state';end if;
 -- Lock both wallets/profiles in a fixed order; rewards and both title counters commit together.
 perform 1 from public.dv_profiles where user_id in (m.host_id,m.guest_id) order by user_id for update;
 complete:=m.kind='random' and coalesce((p_state->'game'->>'finished')::boolean,false) and not coalesce((m.state->'game'->>'finished')::boolean,false) and p_state->>'forfeit' is null;
 rn:=(p_state->>'round')::integer;
 if complete then
  for side in 0..1 loop
   u:=case when side=0 then m.host_id else m.guest_id end;delta:=public.dv_pvp_skill90(p_state,side);
   if delta is null then raise exception 'Incomplete round history';end if;
   award:=case when (p_state->'game'->>'winner')::integer=side then 5 else 2 end;
   insert into public.dv_pvp_rounds90(match_id,user_id,round_no,award,increments) values(p_id,u,rn,award,delta) on conflict do nothing;
   if found then
    insert into public.dv_random_skills90(user_id,double_flips,triple_flips,quad_flips,total_flips,comeback_wins,dominant_wins,duel_sweeps) values(u,(delta->>'double_flips')::bigint,(delta->>'triple_flips')::bigint,(delta->>'quad_flips')::bigint,(delta->>'total_flips')::bigint,(delta->>'comeback_wins')::bigint,(delta->>'dominant_wins')::bigint,(delta->>'duel_sweeps')::bigint)
    on conflict(user_id) do update set double_flips=dv_random_skills90.double_flips+excluded.double_flips,triple_flips=dv_random_skills90.triple_flips+excluded.triple_flips,quad_flips=dv_random_skills90.quad_flips+excluded.quad_flips,total_flips=dv_random_skills90.total_flips+excluded.total_flips,comeback_wins=dv_random_skills90.comeback_wins+excluded.comeback_wins,dominant_wins=dv_random_skills90.dominant_wins+excluded.dominant_wins,duel_sweeps=dv_random_skills90.duel_sweeps+excluded.duel_sweeps;
    insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values(u,'pvp90:'||p_id||':'||rn||':'||side,'earned',award) on conflict do nothing;
    if found then update public.dv_wallets set earned=earned+award where user_id=u;end if;
   end if;
  end loop;
 end if;
 update public.dv_pvp90 set state=p_state,version=p_version+1,status=case when p_state->>'phase'='ended' then 'finished' else 'matched' end,updated_at=now() where id=p_id;
 insert into public.dv_pvp_requests90 values(p_id,p_request,p_user);
 if p_state->>'phase'='ended' then delete from public.dv_pvp_seats90 where match_id=p_id;end if;
 return public.dv_match_get90(p_user,p_id);
end;$$;
-- Titles now read exclusively from completed, randomly paired human duels.
drop trigger dv_verified_skill_round88 on public.dv_game_sessions50;
create or replace function public.dv_player_skills88(p_user uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('double_flips',coalesce(t.double_flips,0),'triple_flips',coalesce(t.triple_flips,0),'quad_flips',coalesce(t.quad_flips,0),'total_flips',coalesce(t.total_flips,0),'comeback_wins',coalesce(t.comeback_wins,0),'dominant_wins',coalesce(t.dominant_wins,0),'duel_sweeps',coalesce(t.duel_sweeps,0)) from public.dv_profiles p left join public.dv_random_skills90 t using(user_id) where p.user_id=p_user
$$;
create or replace function public.dv_grant_win_xp85() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.currency='earned' and new.amount=5 and new.event_key ~ '^(game50:[0-9a-f-]{36}:[12]|pvp90:[0-9a-f-]{36}:[12]:[01])$' then
  insert into public.dv_xp_events85(ledger_id,user_id,xp) values(new.id,new.user_id,100) on conflict do nothing;
  if found then insert into public.dv_profile_progress85(user_id,xp,wins) values(new.user_id,100,1) on conflict(user_id) do update set xp=dv_profile_progress85.xp+100,wins=dv_profile_progress85.wins+1;end if;
 end if;return new;
end;$$;
update public.dv_profiles p set title_id85='rookie' where title_id85 not in ('','rookie') and not public.dv_can_equip88(p.user_id,'title',p.title_id85);
revoke all on function public.dv_match_deck90(uuid,uuid),public.dv_public_identity90(uuid),public.dv_pvp_skill90(jsonb,integer),public.dv_match_join90(uuid,text,uuid,text),public.dv_match_get90(uuid,uuid),public.dv_match_cancel90(uuid,uuid),public.dv_match_commit90(uuid,uuid,integer,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.dv_match_join90(uuid,text,uuid,text),public.dv_match_get90(uuid,uuid),public.dv_match_cancel90(uuid,uuid),public.dv_match_commit90(uuid,uuid,integer,uuid,jsonb) to service_role;
commit;
