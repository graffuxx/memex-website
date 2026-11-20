-- Skill titles are earned from server-verified completed rounds, never browser claims.
begin;
alter table public.dv_identity_catalog85 add column requirements jsonb not null default '{}'::jsonb check(jsonb_typeof(requirements)='object');
create table public.dv_skill_totals88(user_id uuid primary key references public.dv_profiles(user_id) on delete cascade,double_flips bigint not null default 0 check(double_flips>=0),triple_flips bigint not null default 0 check(triple_flips>=0),quad_flips bigint not null default 0 check(quad_flips>=0),total_flips bigint not null default 0 check(total_flips>=0),comeback_wins bigint not null default 0 check(comeback_wins>=0),dominant_wins bigint not null default 0 check(dominant_wins>=0),duel_sweeps bigint not null default 0 check(duel_sweeps>=0));
create table public.dv_skill_events88(game_id uuid not null references public.dv_game_sessions50(id) on delete cascade,round_no integer not null check(round_no in (1,2)),user_id uuid not null references public.dv_profiles(user_id) on delete cascade,increments jsonb not null,created_at timestamptz not null default now(),primary key(game_id,round_no));
alter table public.dv_skill_totals88 enable row level security;
alter table public.dv_skill_events88 enable row level security;
revoke all on public.dv_skill_totals88,public.dv_skill_events88 from public,anon,authenticated,service_role;
update public.dv_identity_catalog85 set min_level=1,min_wins=0,requirements='{"double_flips":50}'::jsonb where kind='title' and id='first-flip';
update public.dv_identity_catalog85 set min_level=1,min_wins=0,requirements='{"triple_flips":10}'::jsonb where kind='title' and id='getting-gud';
update public.dv_identity_catalog85 set min_level=1,min_wins=0,requirements='{"quad_flips":3}'::jsonb where kind='title' and id='no-touch-grass';
update public.dv_identity_catalog85 set min_level=1,min_wins=0,requirements='{"total_flips":1000}'::jsonb where kind='title' and id='certified-menace';
update public.dv_identity_catalog85 set min_level=1,min_wins=0,requirements='{"comeback_wins":20}'::jsonb where kind='title' and id='pixel-veteran';
update public.dv_identity_catalog85 set min_level=1,min_wins=0,requirements='{"dominant_wins":10}'::jsonb where kind='title' and id='big-brain';
update public.dv_identity_catalog85 set min_level=1,min_wins=0,requirements='{"duel_sweeps":20}'::jsonb where kind='title' and id='void-witness';
update public.dv_identity_catalog85 set min_level=1,min_wins=0,requirements='{"quad_flips":10,"duel_sweeps":50}'::jsonb where kind='title' and id='final-boss';
create function public.dv_skill_snapshot88(p_state jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare history jsonb:=p_state->'game'->'history';e jsonb;cell text;side integer;board jsonb:='{}';n integer;placed integer:=0;own_turns integer:=0;own_score integer;enemy_score integer;deficit integer:=0;double_count integer:=0;triple_count integer:=0;quad_count integer:=0;flipped integer:=0;comeback integer:=0;dominant integer:=0;sweep integer:=0;round_no integer;
begin
 if p_state->>'ruleset' is distinct from 'account-50' or not coalesce((p_state->'game'->>'finished')::boolean,false) or (p_state->'game'->>'placements')::integer is distinct from 18 or jsonb_typeof(history) is distinct from 'array' then return null;end if;
 round_no:=(p_state->>'round')::integer;if round_no is null or round_no not in (1,2) then return null;end if;
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
create function public.dv_player_skills88(p_user uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('double_flips',coalesce(t.double_flips,0),'triple_flips',coalesce(t.triple_flips,0),'quad_flips',coalesce(t.quad_flips,0),'total_flips',coalesce(t.total_flips,0),'comeback_wins',coalesce(t.comeback_wins,0),'dominant_wins',coalesce(t.dominant_wins,0),'duel_sweeps',coalesce(t.duel_sweeps,0)) from public.dv_profiles p left join public.dv_skill_totals88 t using(user_id) where p.user_id=p_user
$$;
create function public.dv_record_skill_round88(p_game uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare saved public.dv_game_sessions50%rowtype;delta jsonb;round_no integer;
begin
 select * into saved from public.dv_game_sessions50 where id=p_game;if not found then return false;end if;
 delta:=public.dv_skill_snapshot88(saved.state);if delta is null then return false;end if;round_no:=(saved.state->>'round')::integer;
 perform 1 from public.dv_profiles where user_id=saved.user_id for update;
 insert into public.dv_skill_events88(game_id,round_no,user_id,increments) values(p_game,round_no,saved.user_id,delta) on conflict do nothing;if not found then return false;end if;
 insert into public.dv_skill_totals88(user_id,double_flips,triple_flips,quad_flips,total_flips,comeback_wins,dominant_wins,duel_sweeps) values(saved.user_id,(delta->>'double_flips')::bigint,(delta->>'triple_flips')::bigint,(delta->>'quad_flips')::bigint,(delta->>'total_flips')::bigint,(delta->>'comeback_wins')::bigint,(delta->>'dominant_wins')::bigint,(delta->>'duel_sweeps')::bigint)
 on conflict(user_id) do update set double_flips=dv_skill_totals88.double_flips+excluded.double_flips,triple_flips=dv_skill_totals88.triple_flips+excluded.triple_flips,quad_flips=dv_skill_totals88.quad_flips+excluded.quad_flips,total_flips=dv_skill_totals88.total_flips+excluded.total_flips,comeback_wins=dv_skill_totals88.comeback_wins+excluded.comeback_wins,dominant_wins=dv_skill_totals88.dominant_wins+excluded.dominant_wins,duel_sweeps=dv_skill_totals88.duel_sweeps+excluded.duel_sweeps;
 return true;
end;$$;
create function public.dv_track_skill_round88() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.state->>'round'=old.state->>'round' and coalesce((new.state->'game'->>'finished')::boolean,false) and not coalesce((old.state->'game'->>'finished')::boolean,false) then perform public.dv_record_skill_round88(new.id);end if;
 return new;
end;$$;
create trigger dv_verified_skill_round88 after update of state on public.dv_game_sessions50 for each row execute function public.dv_track_skill_round88();
-- Only complete round histories still retained on the server can be recovered.
select public.dv_record_skill_round88(id) from public.dv_game_sessions50 where coalesce((state->'game'->>'finished')::boolean,false);
create function public.dv_can_equip88(p_user uuid,p_kind text,p_id text) returns boolean language plpgsql stable security definer set search_path='' as $$
declare item public.dv_identity_catalog85%rowtype;skills jsonb;metric text;goal text;level_no integer;wins bigint;
begin
 select * into item from public.dv_identity_catalog85 where kind=p_kind and id=p_id;if not found then return false;end if;
 if item.kind='title' and item.requirements<>'{}'::jsonb then
  skills:=public.dv_player_skills88(p_user);
  for metric,goal in select key,value from jsonb_each_text(item.requirements) loop
   if metric not in ('double_flips','triple_flips','quad_flips','total_flips','comeback_wins','dominant_wins','duel_sweeps') or goal !~ '^[1-9][0-9]{0,8}$' or coalesce((skills->>metric)::bigint,0)<goal::bigint then return false;end if;
  end loop;return true;
 end if;
 select public.dv_level85(coalesce(s.xp,0)),coalesce(s.wins,0) into level_no,wins from public.dv_profiles p left join public.dv_profile_progress85 s using(user_id) where p.user_id=p_user;
 return (item.source='progress' and item.min_level<=level_no and item.min_wins<=wins) or exists(select 1 from public.dv_cosmetic_ownership where user_id=p_user and kind=p_kind and cosmetic_id=p_id);
end;$$;
create or replace function public.dv_identity85() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); result jsonb;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 select jsonb_build_object('displayName',p.display_name,'nameClaimed',exists(select 1 from public.dv_player_names87 n where n.user_id=u),'skills',public.dv_player_skills88(u),'avatarId',p.avatar_id85,'frameId',p.frame_id85,'titleId',p.title_id85,'xp',coalesce(s.xp,0),'wins',coalesce(s.wins,0),'level',public.dv_level85(coalesce(s.xp,0)), 'owned',coalesce((select jsonb_agg(c.kind||':'||c.cosmetic_id) from public.dv_cosmetic_ownership c where c.user_id=u),'[]'::jsonb)) into result from public.dv_profiles p left join public.dv_profile_progress85 s using(user_id) where p.user_id=u;
 if result is null then raise exception 'Initialize account first';end if;
 return result;
end;$$;
create or replace function public.dv_save_identity85(p_name text,p_avatar text,p_frame text,p_title text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();current_name text;choice record;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 select display_name into current_name from public.dv_profiles where user_id=u for update;if not found then raise exception 'Initialize account first';end if;
 if p_name is distinct from current_name then raise exception 'Player names must use the one-time name claim';end if;
 for choice in select * from (values('portrait',p_avatar),('frame',p_frame),('title',p_title)) as choices(kind,id) loop
  if choice.kind='frame' and choice.id='auto' or choice.kind='title' and choice.id='' then continue;end if;
  if not public.dv_can_equip88(u,choice.kind,choice.id) then raise exception 'This cosmetic is locked or unknown';end if;
 end loop;
 update public.dv_profiles set avatar_id85=p_avatar,frame_id85=p_frame,title_id85=p_title where user_id=u;
 return public.dv_identity85();
end;$$;
-- Old early-access titles are no longer equipped unless the new feat was earned.
update public.dv_profiles p set title_id85='rookie' where title_id85 not in ('','rookie') and not public.dv_can_equip88(p.user_id,'title',p.title_id85);
revoke all on function public.dv_skill_snapshot88(jsonb),public.dv_player_skills88(uuid),public.dv_record_skill_round88(uuid),public.dv_track_skill_round88(),public.dv_can_equip88(uuid,text,text) from public,anon,authenticated,service_role;
revoke all on function public.dv_identity85(),public.dv_save_identity85(text,text,text,text) from public,anon,authenticated;
grant execute on function public.dv_identity85(),public.dv_save_identity85(text,text,text,text) to authenticated;
commit;
