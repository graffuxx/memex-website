-- Additive identity and cosmetic progression. No payment, inventory or deck changes.
begin;
alter table public.dv_profiles add column avatar_id85 text not null default 'pepe',add column frame_id85 text not null default 'auto',add column title_id85 text not null default 'rookie';
alter table public.dv_cosmetic_ownership drop constraint dv_cosmetic_ownership_kind_check;
alter table public.dv_cosmetic_ownership add constraint dv_cosmetic_ownership_kind_check check(kind in ('arena','frame','animation','portrait','title'));
create table public.dv_identity_catalog85(kind text not null check(kind in ('portrait','frame','title')),id text not null,min_level integer not null check(min_level>=1),min_wins bigint not null check(min_wins>=0),source text not null check(source in ('progress','owned')),primary key(kind,id));
create table public.dv_profile_progress85(user_id uuid primary key references public.dv_profiles(user_id) on delete cascade,xp bigint not null default 0 check(xp>=0 and xp<=1000000000000),wins bigint not null default 0 check(wins>=0));
create table public.dv_xp_events85(ledger_id uuid primary key references public.dv_reward_ledger(id),user_id uuid not null references public.dv_profiles(user_id),xp integer not null check(xp=100));
alter table public.dv_identity_catalog85 enable row level security;
alter table public.dv_profile_progress85 enable row level security;
alter table public.dv_xp_events85 enable row level security;
revoke all on public.dv_identity_catalog85,public.dv_profile_progress85,public.dv_xp_events85 from public,anon,authenticated;
insert into public.dv_identity_catalog85(kind,id,min_level,min_wins,source) values
('portrait','pepe',1,0,'progress'),
('portrait','doge',1,0,'progress'),
('portrait','roll-safe',1,0,'progress'),
('portrait','harold',1,0,'progress'),
('portrait','disaster-girl',1,0,'progress'),
('portrait','grumpy-cat',1,0,'progress'),
('portrait','smudge',1,0,'progress'),
('portrait','confused',1,0,'progress'),
('portrait','gigachad',1,0,'progress'),
('portrait','this-is-fine',1,0,'progress'),
('portrait','trollface',1,0,'progress'),
('portrait','stonks',1,0,'progress'),
('portrait','crying-cat',1,0,'progress'),
('portrait','keyboard-cat',1,0,'progress'),
('portrait','galaxy-brain',1,0,'progress'),
('portrait','npc',1,0,'progress'),
('portrait','copium',1,0,'progress'),
('portrait','diamond-hands',1,0,'progress'),
('portrait','hodl',1,0,'progress'),
('portrait','rage-quit',1,0,'progress'),
('frame','starter',1,0,'progress'),
('frame','pixel-50',50,0,'progress'),
('frame','meme-100',100,0,'progress'),
('frame','diamond-150',150,0,'progress'),
('frame','void-200',200,0,'progress'),
('frame','cosmic-250',250,0,'progress'),
('frame','legend-300',300,0,'progress'),
('title','rookie',1,0,'progress'),
('title','first-flip',1,1,'progress'),
('title','getting-gud',1,10,'progress'),
('title','no-touch-grass',1,50,'progress'),
('title','certified-menace',1,100,'progress'),
('title','pixel-veteran',50,0,'progress'),
('title','big-brain',100,0,'progress'),
('title','void-witness',200,0,'progress'),
('title','final-boss',300,0,'progress');
create function public.dv_level85(p_xp bigint) returns integer language sql immutable strict set search_path='' as $$
 select 1+floor((-245+sqrt(60025+20*greatest(0,p_xp)::numeric))/10)::integer
$$;
create function public.dv_identity85() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); result jsonb;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 select jsonb_build_object('displayName',p.display_name,'avatarId',p.avatar_id85,'frameId',p.frame_id85,'titleId',p.title_id85,'xp',coalesce(s.xp,0),'wins',coalesce(s.wins,0),'level',public.dv_level85(coalesce(s.xp,0)), 'owned',coalesce((select jsonb_agg(c.kind||':'||c.cosmetic_id) from public.dv_cosmetic_ownership c where c.user_id=u),'[]'::jsonb)) into result from public.dv_profiles p left join public.dv_profile_progress85 s using(user_id) where p.user_id=u;
 if result is null then raise exception 'Initialize account first';end if;
 return result;
end;$$;
create function public.dv_save_identity85(p_name text,p_avatar text,p_frame text,p_title text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); current_level integer; current_wins bigint; choice record;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 if p_name is null or char_length(trim(p_name)) not between 1 and 24 or p_name ~ '[[:cntrl:]]' then raise exception 'Use a name with 1 to 24 visible characters';end if;
 perform 1 from public.dv_profiles where user_id=u for update;
 if not found then raise exception 'Initialize account first';end if;
 select public.dv_level85(coalesce(s.xp,0)),coalesce(s.wins,0) into current_level,current_wins from public.dv_profiles p left join public.dv_profile_progress85 s using(user_id) where p.user_id=u;
 for choice in select * from (values('portrait',p_avatar),('frame',p_frame),('title',p_title)) as choices(kind,id) loop
  if choice.kind='frame' and choice.id='auto' or choice.kind='title' and choice.id='' then continue;end if;
  if not exists(select 1 from public.dv_identity_catalog85 c where c.kind=choice.kind and c.id=choice.id and ((c.min_level<=current_level and c.min_wins<=current_wins and c.source='progress') or exists(select 1 from public.dv_cosmetic_ownership o where o.user_id=u and o.kind=c.kind and o.cosmetic_id=c.id))) then raise exception 'This cosmetic is locked or unknown';end if;
 end loop;
 update public.dv_profiles set display_name=trim(p_name),avatar_id85=p_avatar,frame_id85=p_frame,title_id85=p_title where user_id=u;
 return public.dv_identity85();
end;$$;
-- The unique, service-verified reward event is the source of XP, never a browser result.
create function public.dv_grant_win_xp85() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.currency='earned' and new.amount=5 and new.event_key ~ '^game50:[0-9a-f-]{36}:[12]$' then
  insert into public.dv_xp_events85(ledger_id,user_id,xp) values(new.id,new.user_id,100) on conflict do nothing;
  if found then insert into public.dv_profile_progress85(user_id,xp,wins) values(new.user_id,100,1) on conflict(user_id) do update set xp=dv_profile_progress85.xp+100,wins=dv_profile_progress85.wins+1;end if;
 end if;
 return new;
end;$$;
create trigger dv_verified_win_xp85 after insert on public.dv_reward_ledger for each row execute function public.dv_grant_win_xp85();
-- Preserve already earned, verified wins. Future loads do not regrant them.
insert into public.dv_xp_events85(ledger_id,user_id,xp) select id,user_id,100 from public.dv_reward_ledger where currency='earned' and amount=5 and event_key ~ '^game50:[0-9a-f-]{36}:[12]$' on conflict do nothing;
insert into public.dv_profile_progress85(user_id,xp,wins) select user_id,sum(xp),count(*) from public.dv_xp_events85 group by user_id;
revoke all on function public.dv_level85(bigint),public.dv_identity85(),public.dv_save_identity85(text,text,text,text),public.dv_grant_win_xp85() from public,anon,authenticated;
grant execute on function public.dv_identity85(),public.dv_save_identity85(text,text,text,text) to authenticated;
commit;
