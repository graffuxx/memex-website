-- First to two round wins; authoritative Random duel outcomes, including concessions.

begin;

alter table public.dv_pvp_rounds90 drop constraint dv_pvp_rounds90_round_no_check;
alter table public.dv_pvp_rounds90 add constraint dv_pvp_rounds90_round_no_check check(round_no>=1);

alter table public.dv_balance_rounds94 drop constraint dv_balance_rounds94_round_no_check;
alter table public.dv_balance_rounds94 add constraint dv_balance_rounds94_round_no_check check(round_no>=1);

alter table public.dv_random_ai_rounds98 drop constraint dv_random_ai_rounds98_round_no_check;
alter table public.dv_random_ai_rounds98 add constraint dv_random_ai_rounds98_round_no_check check(round_no>=1);

alter table public.dv_skill_events88 drop constraint dv_skill_events88_round_no_check;
alter table public.dv_skill_events88 add constraint dv_skill_events88_round_no_check check(round_no>=1);

create or replace function public.dv_skill_snapshot88(p_state jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare history jsonb:=p_state->'game'->'history';e jsonb;cell text;side integer;board jsonb:='{}';n integer;placed integer:=0;own_turns integer:=0;own_score integer;enemy_score integer;deficit integer:=0;double_count integer:=0;triple_count integer:=0;quad_count integer:=0;flipped integer:=0;comeback integer:=0;dominant integer:=0;sweep integer:=0;round_no integer;
begin
 if p_state->>'ruleset' is distinct from 'account-50' or not coalesce((p_state->'game'->>'finished')::boolean,false) or (p_state->'game'->>'placements')::integer is distinct from 18 or jsonb_typeof(history) is distinct from 'array' then return null;end if;
 round_no:=(p_state->>'round')::integer;if round_no is null or round_no<1 then return null;end if;
 for e in select value from jsonb_array_elements(history) loop
  if e->>'type' is distinct from 'place' then continue;end if;
  side:=(e->>'side')::integer;cell:=e->>'cell';
  if side is null or side not in (0,1) or cell is null or jsonb_typeof(e->'flips') is distinct from 'array' then return null;end if;
  board:=jsonb_set(board,array[cell],to_jsonb(side),true);
  for cell in select jsonb_array_elements_text(e->'flips') loop if cell is null then return null;end if;board:=jsonb_set(board,array[cell],to_jsonb(side),true);end loop;
  select count(*) filter(where value='0'::jsonb),count(*) filter(where value='1'::jsonb) into own_score,enemy_score from jsonb_each(board);
  deficit:=greatest(deficit,enemy_score-own_score);placed:=placed+1;
  if side=0 then own_turns:=own_turns+1;n:=jsonb_array_length(e->'flips');flipped:=flipped+n;if n>=2 then double_count:=double_count+1;end if;if n>=3 then triple_count:=triple_count+1;end if;if n>=4 then quad_count:=quad_count+1;end if;end if;
 end loop;
 if placed<>18 or own_turns<>9 or own_score+enemy_score<>18 then return null;end if;
 if (p_state->'game'->>'winner')::integer=0 then if deficit>=4 then comeback:=1;end if;if own_score>=14 then dominant:=1;end if;end if;
 if round_no=2 and jsonb_typeof(p_state->'results')='array' and jsonb_array_length(p_state->'results')=2 and (p_state->'results'->0->>0)::integer>(p_state->'results'->0->>1)::integer and (p_state->'results'->1->>0)::integer>(p_state->'results'->1->>1)::integer then sweep:=1;end if;
 return jsonb_build_object('double_flips',double_count,'triple_flips',triple_count,'quad_flips',quad_count,'total_flips',flipped,'comeback_wins',comeback,'dominant_wins',dominant,'duel_sweeps',sweep);
exception when invalid_text_representation or numeric_value_out_of_range or invalid_parameter_value then return null;
end;$$;

create or replace function public.dv_game_commit50(p_user uuid,p_id uuid,p_version integer,p_request uuid,p_state jsonb,p_steps jsonb,p_award integer) returns jsonb language plpgsql security definer set search_path='' as $$
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
  if round_no<1 or round_no<>(old.state->>'round')::integer or coalesce((old.state->'game'->>'finished')::boolean,true) or not coalesce((p_state->'game'->>'finished')::boolean,false) or (p_state->'game'->>'placements')::integer<>18 then raise exception 'Only a completed round earns Pixels';end if;
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

create or replace function public.dv_grant_win_xp85() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.currency='earned' and new.amount=5 and new.event_key ~ '^(game50:[0-9a-f-]{36}:[1-9][0-9]*|pvp90:[0-9a-f-]{36}:[1-9][0-9]*:[01])$' then
  insert into public.dv_xp_events85(ledger_id,user_id,xp) values(new.id,new.user_id,100) on conflict do nothing;
  if found then insert into public.dv_profile_progress85(user_id,xp,wins) values(new.user_id,100,1) on conflict(user_id) do update set xp=dv_profile_progress85.xp+100,wins=dv_profile_progress85.wins+1;end if;
 end if;return new;
end;$$;

create table public.dv_duel_results113(
 match_id uuid not null references public.dv_pvp90(id) on delete cascade,
 user_id uuid not null references public.dv_profiles(user_id) on delete cascade,
 result text not null check(result in ('win','loss')),reason text not null check(reason in ('first_to_two','forfeit')),
 rounds_won integer not null check(rounds_won>=0),rounds_lost integer not null check(rounds_lost>=0),
 left_early boolean not null default false,created_at timestamptz not null default now(),primary key(match_id,user_id)
);
alter table public.dv_duel_results113 enable row level security;
revoke all on public.dv_duel_results113 from public,anon,authenticated,service_role;
create function public.dv_capture_duel113() returns trigger language plpgsql security definer set search_path='' as $$
declare wins0 integer;wins1 integer;winner integer;leaver integer;side integer;u uuid;
begin
 if new.kind<>'random' or new.status<>'finished' or new.state is null then return new;end if;
 if tg_op='UPDATE' and old.status='finished' then return new;end if;
 select count(*) filter(where (v->>0)::integer>(v->>1)::integer),count(*) filter(where (v->>1)::integer>(v->>0)::integer)
 into wins0,wins1 from jsonb_array_elements(coalesce(new.state->'results','[]'::jsonb)) e(v);
 if new.state->>'forfeit' in ('0','1') then leaver:=(new.state->>'forfeit')::integer;winner:=1-leaver;
 elsif wins0>=2 then winner:=0;
 elsif wins1>=2 then winner:=1;
 else return new;end if;
 for side in 0..1 loop
  u:=case when side=0 then new.host_id else new.guest_id end;
  if u is null then continue;end if;
  insert into public.dv_duel_results113(match_id,user_id,result,reason,rounds_won,rounds_lost,left_early)
  values(new.id,u,case when side=winner then 'win' else 'loss' end,case when leaver is null then 'first_to_two' else 'forfeit' end,
   case when side=0 then wins0 else wins1 end,case when side=0 then wins1 else wins0 end,coalesce(side=leaver,false)) on conflict do nothing;
 end loop;
 return new;
end;$$;
create trigger dv_duel_result113 after insert or update of status,state on public.dv_pvp90 for each row execute function public.dv_capture_duel113();
create function public.dv_duel_stats113() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare u uuid:=public.dv_social_user92();result jsonb;
begin
 select jsonb_build_object('wins',count(*) filter(where r.result='win'),'losses',count(*) filter(where r.result='loss'),'forfeits',count(*) filter(where r.left_early)) into result from public.dv_duel_results113 r where r.user_id=u;
 return result;
end;$$;
revoke all on function public.dv_capture_duel113(),public.dv_duel_stats113() from public,anon,authenticated,service_role;
grant execute on function public.dv_duel_stats113() to authenticated;

commit;
