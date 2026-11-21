-- Random matchmaking AI rounds count toward ordinary play/win quests and win XP.
-- Human PvP skill titles and referral qualification keep their separate source.
begin;
create table public.dv_random_ai_rounds98(
 user_id uuid not null references public.dv_profiles(user_id) on delete cascade,
 match_id uuid not null references public.dv_pvp90(id) on delete cascade,
 round_no integer not null check(round_no in (1,2)),
 ledger_id uuid not null unique references public.dv_reward_ledger(id),
 award integer not null check(award in (2,5)),completed_at timestamptz not null default now(),
 primary key(user_id,match_id,round_no)
);
alter table public.dv_random_ai_rounds98 enable row level security;
revoke all on public.dv_random_ai_rounds98 from public,anon,authenticated,service_role;
create function public.dv_random_ai_xp98() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.award=5 then
  insert into public.dv_xp_events85(ledger_id,user_id,xp) values(new.ledger_id,new.user_id,100) on conflict do nothing;
  if found then insert into public.dv_profile_progress85(user_id,xp,wins) values(new.user_id,100,1)
   on conflict(user_id) do update set xp=dv_profile_progress85.xp+100,wins=dv_profile_progress85.wins+1;end if;
 end if;
 return new;
end;$$;
create trigger dv_random_ai_xp98 after insert on public.dv_random_ai_rounds98 for each row execute function public.dv_random_ai_xp98();
create function public.dv_capture_random_ai98() returns trigger language plpgsql security definer set search_path='' as $$
declare s jsonb:=new.state;rn integer;points integer;ledger uuid;
begin
 if new.kind<>'random' or new.ai_opponent96 is null or s->>'forfeit' is not null
  or s->'game'->>'finished' is distinct from 'true' or s->'game'->>'placements' is distinct from '18'
  or s->>'phase' not in ('between','ended') or jsonb_typeof(s->'game'->'history') is distinct from 'array' then return new;end if;
 if (select count(*) from jsonb_array_elements(s->'game'->'history') e where e->>'type'='place')<>18 then return new;end if;
 rn:=(s->>'round')::integer;points:=case when s->'game'->>'winner'='0' then 5 else 2 end;
 select id into ledger from public.dv_reward_ledger where user_id=new.host_id and event_key='bot96:'||new.id||':'||rn and currency='earned' and amount=points;
 if ledger is not null then insert into public.dv_random_ai_rounds98(user_id,match_id,round_no,ledger_id,award)
  values(new.host_id,new.id,rn,ledger,points) on conflict do nothing;end if;
 return new;
end;$$;
create trigger dv_random_ai_round98 after insert or update of state on public.dv_pvp90 for each row execute function public.dv_capture_random_ai98();
-- Recover only archived complete rounds with an existing, matching server reward.
-- No Pixels are paid again, and PvP/referral records are never manufactured.
insert into public.dv_random_ai_rounds98(user_id,match_id,round_no,ledger_id,award,completed_at)
 select m.host_id,m.id,b.round_no,l.id,l.amount,b.ended_at
 from public.dv_balance_rounds94 b join public.dv_pvp90 m on m.id=b.match_id
 join public.dv_reward_ledger l on l.user_id=m.host_id and l.event_key='bot96:'||m.id||':'||b.round_no and l.currency='earned'
 where b.source='pvp' and b.mode='ai' and b.completed and m.kind='random' and m.ai_opponent96 is not null
  and b.snapshot->'game'->>'finished'='true' and b.snapshot->'game'->>'placements'='18'
  and jsonb_typeof(b.snapshot->'game'->'history')='array'
  and (select count(*) from jsonb_array_elements(b.snapshot->'game'->'history') e where e->>'type'='place')=18
  and l.amount=case when b.winner=0 then 5 else 2 end
 on conflict do nothing;
create or replace function public.dv_quest_counts95(u uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
  'played',(select count(*) from public.dv_quest_activity95 where user_id=u)+(select count(*) from public.dv_random_ai_rounds98 where user_id=u),
  'won',(select count(*) from public.dv_quest_activity95 where user_id=u and won)+(select count(*) from public.dv_random_ai_rounds98 where user_id=u and award=5),
  'referrals',(select count(*) from dv_private.referral_qualified95 where referrer_id=u))
$$;
revoke all on function public.dv_random_ai_xp98(),public.dv_capture_random_ai98(),public.dv_quest_counts95(uuid) from public,anon,authenticated,service_role;
-- Humans have 35 seconds to pair before the fallback can claim the waiting seat.
create or replace function public.dv_match_fill_ai96(p_user uuid,p_id uuid,p_deck jsonb,p_identity jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.dv_pvp90%rowtype;
begin
 -- Same queue lock as human pairing and cancellation: exactly one outcome wins.
 perform pg_advisory_xact_lock(900090);
 select * into m from public.dv_pvp90 where id=p_id and host_id=p_user for update;
 if not found then raise exception 'Duel unavailable';end if;
 if m.status<>'waiting' or m.kind<>'random' or m.created_at>now()-interval '35 seconds' then return public.dv_match_get90(p_user,p_id);end if;
 if jsonb_typeof(p_deck->'cards') is distinct from 'array' then raise exception 'Invalid AI deck';end if;
 if jsonb_array_length(p_deck->'cards')<>15 or exists(select 1 from jsonb_array_elements_text(p_deck->'cards') c(id) left join public.dv_card_variants v on v.id=c.id where v.id is null or v.edition<>'alpha') or exists(select 1 from jsonb_array_elements_text(p_deck->'cards') c(id) join public.dv_card_variants v on v.id=c.id group by v.definition_id having count(*)>3) then raise exception 'Invalid AI deck';end if;
 if jsonb_typeof(p_identity) is distinct from 'object' or p_identity->>'isAi' is distinct from 'true' or length(p_identity->>'displayName') not between 1 and 24 then raise exception 'Invalid AI identity';end if;
 -- Refresh owned copies once, then freeze both decks for this duel and reconnects.
 m.host_deck:=public.dv_match_deck90(p_user,(m.host_deck->>'id')::uuid);
 update public.dv_pvp90 set status='matched',host_deck=m.host_deck,guest_deck=p_deck,ai_opponent96=p_identity,updated_at=now() where id=p_id;
 return public.dv_match_get90(p_user,p_id);
end;$$;
commit;
