-- Permanent player names. The registry survives account deletion so taken names stay taken.
begin;
create table public.dv_player_names87(
 name_key text primary key check(name_key=lower(regexp_replace(btrim(name_key),' +',' ','g'))),
 display_name text not null,
 user_id uuid unique references auth.users(id) on delete set null,
 claimed_at timestamptz not null default now()
);
alter table public.dv_player_names87 enable row level security;
revoke all on public.dv_player_names87 from public,anon,authenticated;
insert into public.dv_player_names87(name_key,display_name) values
('player','Player'),('guest','Guest'),('admin','Admin'),('administrator','Administrator'),('moderator','Moderator'),('support','Support'),('system','System'),('memex','MemeX'),('duelverse','Duelverse'),('meme bot','Meme Bot'),('memebot','MemeBot');
-- Preserve valid existing chosen names. Earliest saved profile wins an old duplicate;
-- generic Player placeholders and unresolved duplicates still get an explicit first claim.
insert into public.dv_player_names87(name_key,display_name,user_id,claimed_at)
 select distinct on(lower(regexp_replace(btrim(display_name),' +',' ','g')))
 lower(regexp_replace(btrim(display_name),' +',' ','g')),regexp_replace(btrim(display_name),' +',' ','g'),user_id,created_at
 from public.dv_profiles
 where regexp_replace(btrim(display_name),' +',' ','g') ~ '^[A-Za-z0-9][A-Za-z0-9 _-]{2,23}$'
 order by lower(regexp_replace(btrim(display_name),' +',' ','g')),created_at,user_id
 on conflict do nothing;
update public.dv_profiles p set display_name=n.display_name from public.dv_player_names87 n where n.user_id=p.user_id and p.display_name is distinct from n.display_name;
create or replace function public.dv_identity85() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); result jsonb;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 select jsonb_build_object('displayName',p.display_name,'nameClaimed',exists(select 1 from public.dv_player_names87 n where n.user_id=u),'avatarId',p.avatar_id85,'frameId',p.frame_id85,'titleId',p.title_id85,'xp',coalesce(s.xp,0),'wins',coalesce(s.wins,0),'level',public.dv_level85(coalesce(s.xp,0)), 'owned',coalesce((select jsonb_agg(c.kind||':'||c.cosmetic_id) from public.dv_cosmetic_ownership c where c.user_id=u),'[]'::jsonb)) into result from public.dv_profiles p left join public.dv_profile_progress85 s using(user_id) where p.user_id=u;
 if result is null then raise exception 'Initialize account first';end if;
 return result;
end;$$;
create function public.dv_protect_player_name87() returns trigger language plpgsql security definer set search_path='' as $$
declare reserved text;
begin
 select n.display_name into reserved from public.dv_player_names87 n where n.user_id=old.user_id;
 if found and new.display_name is distinct from reserved then raise exception 'Your player name is permanent';end if;
 return new;
end;$$;
create trigger dv_permanent_name87 before update of display_name on public.dv_profiles for each row execute function public.dv_protect_player_name87();
create function public.dv_claim_player_name87(p_name text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); chosen text:=regexp_replace(btrim(p_name),' +',' ','g'); key text; reserved public.dv_player_names87%rowtype;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 if chosen is null or chosen !~ '^[A-Za-z0-9][A-Za-z0-9 _-]{2,23}$' then raise exception 'Use 3 to 24 letters, numbers, spaces, underscores or hyphens';end if;
 if not exists(select 1 from auth.users where id=u and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Verify your email before choosing your name';end if;
 key:=lower(chosen);
 perform 1 from public.dv_profiles where user_id=u for update;
 if not found then raise exception 'Initialize account first';end if;
 select * into reserved from public.dv_player_names87 where user_id=u;
 if found then
  if reserved.name_key=key then return public.dv_identity85();end if;
  raise exception 'Your player name is permanent';
 end if;
 begin
  insert into public.dv_player_names87(name_key,display_name,user_id) values(key,chosen,u);
 exception when unique_violation then raise exception 'This player name is already taken';
 end;
 update public.dv_profiles set display_name=chosen where user_id=u;
 return public.dv_identity85();
end;$$;
-- The old profile endpoint cannot be used to bypass the one-time claim.
create or replace function public.dv_save_identity85(p_name text,p_avatar text,p_frame text,p_title text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); current_name text;current_level integer;current_wins bigint;choice record;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 select display_name into current_name from public.dv_profiles where user_id=u for update;
 if not found then raise exception 'Initialize account first';end if;
 if p_name is distinct from current_name then raise exception 'Player names must use the one-time name claim';end if;
 select public.dv_level85(coalesce(s.xp,0)),coalesce(s.wins,0) into current_level,current_wins from public.dv_profiles p left join public.dv_profile_progress85 s using(user_id) where p.user_id=u;
 for choice in select * from (values('portrait',p_avatar),('frame',p_frame),('title',p_title)) as choices(kind,id) loop
  if choice.kind='frame' and choice.id='auto' or choice.kind='title' and choice.id='' then continue;end if;
  if not exists(select 1 from public.dv_identity_catalog85 c where c.kind=choice.kind and c.id=choice.id and ((c.min_level<=current_level and c.min_wins<=current_wins and c.source='progress') or exists(select 1 from public.dv_cosmetic_ownership o where o.user_id=u and o.kind=c.kind and o.cosmetic_id=c.id))) then raise exception 'This cosmetic is locked or unknown';end if;
 end loop;
 update public.dv_profiles set avatar_id85=p_avatar,frame_id85=p_frame,title_id85=p_title where user_id=u;
 return public.dv_identity85();
end;$$;
create function public.dv_save_cosmetics87(p_avatar text,p_frame text,p_title text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); current_name text;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 select display_name into current_name from public.dv_profiles where user_id=u for update;
 if not found then raise exception 'Initialize account first';end if;
 return public.dv_save_identity85(current_name,p_avatar,p_frame,p_title);
end;$$;
revoke all on function public.dv_claim_player_name87(text),public.dv_protect_player_name87(),public.dv_save_cosmetics87(text,text,text),public.dv_identity85(),public.dv_save_identity85(text,text,text,text) from public,anon,authenticated;
grant execute on function public.dv_claim_player_name87(text),public.dv_save_cosmetics87(text,text,text),public.dv_identity85(),public.dv_save_identity85(text,text,text,text) to authenticated;
commit;
