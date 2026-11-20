-- In-app friends and directed private duel invitations. No emails or public user directory.
begin;
create table public.dv_friends92(low_id uuid not null references public.dv_profiles(user_id) on delete cascade,high_id uuid not null references public.dv_profiles(user_id) on delete cascade,requested_by uuid not null references public.dv_profiles(user_id) on delete cascade,status text not null check(status in ('pending','accepted','closed')),requested_at timestamptz not null default now(),updated_at timestamptz not null default now(),primary key(low_id,high_id),check(low_id<high_id),check(requested_by in (low_id,high_id)));
create table public.dv_friend_blocks92(user_id uuid not null references public.dv_profiles(user_id) on delete cascade,blocked_id uuid not null references public.dv_profiles(user_id) on delete cascade,created_at timestamptz not null default now(),primary key(user_id,blocked_id),check(user_id<>blocked_id));
create table public.dv_friend_duels92(match_id uuid primary key references public.dv_pvp90(id) on delete cascade,sender_id uuid not null references public.dv_profiles(user_id) on delete cascade,recipient_id uuid not null references public.dv_profiles(user_id) on delete cascade,status text not null default 'pending' check(status in ('pending','accepted','declined')),created_at timestamptz not null default now(),check(sender_id<>recipient_id));
create index dv_friend_duels_in92 on public.dv_friend_duels92(recipient_id,status);
alter table public.dv_friends92 enable row level security;alter table public.dv_friend_blocks92 enable row level security;alter table public.dv_friend_duels92 enable row level security;
revoke all on public.dv_friends92,public.dv_friend_blocks92,public.dv_friend_duels92 from public,anon,authenticated,service_role;
create function public.dv_social_user92() returns uuid language plpgsql stable security definer set search_path='' as $$
declare u uuid:=auth.uid();begin
 if u is null or not exists(select 1 from auth.users where id=u and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Sign in with a verified email address';end if;return u;
end;$$;
create function public.dv_are_friends92(a uuid,b uuid) returns boolean language sql stable security definer set search_path='' as $$
 select a<>b and exists(select 1 from public.dv_friends92 where low_id=least(a,b) and high_id=greatest(a,b) and status='accepted') and not exists(select 1 from public.dv_friend_blocks92 where user_id=a and blocked_id=b or user_id=b and blocked_id=a)
$$;
create function public.dv_social_search92(p_name text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=public.dv_social_user92();other uuid;key text:=lower(regexp_replace(btrim(p_name),' +',' ','g'));r public.dv_friends92%rowtype;
begin
 if key is null or key !~ '^[a-z0-9][a-z0-9 _-]{2,23}$' then raise exception 'Enter the exact player name (3–24 characters)';end if;
 select user_id into other from public.dv_player_names87 where name_key=key and user_id is not null;
 if other is null or other=u or not exists(select 1 from public.dv_profiles where user_id=other) or exists(select 1 from public.dv_friend_blocks92 where user_id=u and blocked_id=other or user_id=other and blocked_id=u) then return null;end if;
 select * into r from public.dv_friends92 where low_id=least(u,other) and high_id=greatest(u,other);
 return jsonb_build_object('id',other,'identity',public.dv_public_identity90(other),'relationship',case when r.status='accepted' then 'friend' when r.status='pending' and r.requested_by=u then 'outgoing' when r.status='pending' then 'incoming' else 'none' end);
end;$$;
create function public.dv_social_action92(p_other uuid,p_action text) returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=public.dv_social_user92();r public.dv_friends92%rowtype;room record;
begin
 if p_other is null or p_other=u then raise exception 'Choose another player';end if;
 perform pg_advisory_xact_lock(920092);
 if not exists(select 1 from public.dv_profiles where user_id=p_other) then raise exception 'Player unavailable';end if;
 select * into r from public.dv_friends92 where low_id=least(u,p_other) and high_id=greatest(u,p_other) for update;
 if p_action='block' then
  insert into public.dv_friend_blocks92 values(u,p_other,now()) on conflict do nothing;
  update public.dv_friends92 set status='closed',updated_at=now() where low_id=least(u,p_other) and high_id=greatest(u,p_other);
 elsif p_action='unblock' then delete from public.dv_friend_blocks92 where user_id=u and blocked_id=p_other;return;
 elsif p_action='request' then
  if not exists(select 1 from public.dv_player_names87 where user_id=u) then raise exception 'Choose your permanent player name first';end if;
  if not exists(select 1 from public.dv_player_names87 where user_id=p_other) or exists(select 1 from public.dv_friend_blocks92 where user_id=u and blocked_id=p_other or user_id=p_other and blocked_id=u) then raise exception 'Player unavailable';end if;
  if r.status in ('accepted','pending') then return;end if;
  if r.updated_at>now()-interval '24 hours' then raise exception 'Wait before sending this player another request';end if;
  if (select count(*) from public.dv_friends92 where requested_by=u and requested_at>now()-interval '24 hours')>=20 then raise exception 'Daily friend request limit reached';end if;
  if (select count(*) from public.dv_friends92 where (low_id=u or high_id=u) and status='accepted')>=200 then raise exception 'Friend list is full';end if;
  insert into public.dv_friends92(low_id,high_id,requested_by,status) values(least(u,p_other),greatest(u,p_other),u,'pending') on conflict(low_id,high_id) do update set requested_by=u,status='pending',requested_at=now(),updated_at=now();return;
 elsif p_action='accept' then
  if r.status='accepted' then return;end if;
  if r.status is distinct from 'pending' or r.requested_by=u or exists(select 1 from public.dv_friend_blocks92 where user_id=u and blocked_id=p_other or user_id=p_other and blocked_id=u) then raise exception 'No incoming friend request';end if;
  if (select count(*) from public.dv_friends92 where (low_id=u or high_id=u) and status='accepted')>=200 or (select count(*) from public.dv_friends92 where (low_id=p_other or high_id=p_other) and status='accepted')>=200 then raise exception 'Friend list is full';end if;
  update public.dv_friends92 set status='accepted',updated_at=now() where low_id=r.low_id and high_id=r.high_id;return;
 elsif p_action in ('decline','cancel','remove') then
  if p_action='decline' and (r.status is distinct from 'pending' or r.requested_by=u) or p_action='cancel' and (r.status is distinct from 'pending' or r.requested_by<>u) or p_action='remove' and r.status is distinct from 'accepted' then raise exception 'Request unavailable';end if;
  update public.dv_friends92 set status='closed',updated_at=now() where low_id=r.low_id and high_id=r.high_id;
 else raise exception 'Unknown friend action';end if;
 -- Removing/blocking cancels outstanding invitations, but never alters an ongoing duel.
 for room in select m.id,m.host_id from public.dv_friend_duels92 d join public.dv_pvp90 m on m.id=d.match_id where d.sender_id in (u,p_other) and d.recipient_id in (u,p_other) and d.status='pending' and m.status='waiting' loop
  perform public.dv_match_cancel90(room.host_id,room.id);
 end loop;
 update public.dv_friend_duels92 set status='declined' where sender_id in (u,p_other) and recipient_id in (u,p_other) and status='pending';
end;$$;
create function public.dv_social_list92() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=public.dv_social_user92();result jsonb;
begin
 select jsonb_build_object(
 'people',coalesce((select jsonb_agg(jsonb_build_object('id',case when f.low_id=u then f.high_id else f.low_id end,'identity',public.dv_public_identity90(case when f.low_id=u then f.high_id else f.low_id end),'relationship',case when f.status='accepted' then 'friend' when f.requested_by=u then 'outgoing' else 'incoming' end) order by f.updated_at desc) from public.dv_friends92 f where (f.low_id=u or f.high_id=u) and f.status in ('pending','accepted') and not exists(select 1 from public.dv_friend_blocks92 b where b.user_id=f.low_id and b.blocked_id=f.high_id or b.user_id=f.high_id and b.blocked_id=f.low_id)),'[]'::jsonb),
 'blocked',coalesce((select jsonb_agg(jsonb_build_object('id',blocked_id,'identity',public.dv_public_identity90(blocked_id))) from public.dv_friend_blocks92 where user_id=u),'[]'::jsonb),
 'invites',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'direction',case when d.sender_id=u then 'outgoing' else 'incoming' end,'identity',public.dv_public_identity90(case when d.sender_id=u then d.recipient_id else d.sender_id end),'status',m.status,'createdAt',d.created_at) order by d.created_at desc) from public.dv_friend_duels92 d join public.dv_pvp90 m on m.id=d.match_id where (d.sender_id=u or d.recipient_id=u) and d.status in ('pending','accepted') and (m.status='waiting' and m.updated_at>now()-interval '15 minutes' or m.status='matched') and public.dv_are_friends92(d.sender_id,d.recipient_id)),'[]'::jsonb)) into result;
 return result;
end;$$;
create function public.dv_social_summary92() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=public.dv_social_user92();begin
 return jsonb_build_object('requests',(select count(*) from public.dv_friends92 where (low_id=u or high_id=u) and status='pending' and requested_by<>u),'invites',(select count(*) from public.dv_friend_duels92 d join public.dv_pvp90 m on m.id=d.match_id where d.recipient_id=u and d.status='pending' and m.status='waiting' and m.updated_at>now()-interval '15 minutes' and public.dv_are_friends92(d.sender_id,d.recipient_id)));
end;$$;
create or replace function public.dv_match_join90(p_user uuid,p_kind text,p_deck uuid,p_code text default null) returns uuid language plpgsql security definer set search_path='' as $$
declare m public.dv_pvp90%rowtype;deck jsonb;existing uuid;
begin
 if p_kind not in ('random','private') or p_kind is null then raise exception 'Ranked is coming soon';end if;
 if not exists(select 1 from auth.users where id=p_user and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Verify your email before matchmaking';end if;
 -- One short queue lock prevents double pairing and simultaneous self-matches.
 perform pg_advisory_xact_lock(920092);
 perform pg_advisory_xact_lock(900090);
 update public.dv_pvp90 set status='cancelled' where status='waiting' and updated_at<now()-case when kind='private' then interval '15 minutes' else interval '120 seconds' end;
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
  if exists(select 1 from public.dv_friend_duels92 where match_id=m.id and (recipient_id<>p_user or status<>'pending')) then raise exception 'This invitation belongs to another player';end if;
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
create function public.dv_friend_invite92(p_friend uuid,p_deck uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=public.dv_social_user92();mid uuid;m public.dv_pvp90%rowtype;old public.dv_friend_duels92%rowtype;
begin
 perform pg_advisory_xact_lock(920092);
 if p_friend is null or not public.dv_are_friends92(u,p_friend) then raise exception 'Accept the friend request first';end if;
 mid:=public.dv_match_join90(u,'private',p_deck,null);select * into m from public.dv_pvp90 where id=mid;
 if m.host_id<>u or m.kind<>'private' or m.status<>'waiting' then raise exception 'Finish or leave your current duel first';end if;
 select * into old from public.dv_friend_duels92 where match_id=mid;
 if found and (old.recipient_id<>p_friend or old.status<>'pending') then raise exception 'Cancel your existing invitation before inviting another friend';end if;
 insert into public.dv_friend_duels92(match_id,sender_id,recipient_id) values(mid,u,p_friend) on conflict do nothing;
 return jsonb_build_object('id',mid,'friendName',public.dv_public_identity90(p_friend)->>'displayName');
end;$$;
create function public.dv_friend_reply92(p_match uuid,p_action text,p_deck uuid default null) returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=public.dv_social_user92();d public.dv_friend_duels92%rowtype;m public.dv_pvp90%rowtype;joined uuid;
begin
 perform pg_advisory_xact_lock(920092);
 select * into d from public.dv_friend_duels92 where match_id=p_match and recipient_id=u;
 if not found then raise exception 'Invitation unavailable';end if;
 select * into m from public.dv_pvp90 where id=p_match;
 if p_action='accept' and d.status='accepted' and m.status='matched' and m.guest_id=u then return m.id;end if;
 if d.status<>'pending' or m.status<>'waiting' or m.updated_at<now()-interval '15 minutes' or not public.dv_are_friends92(d.sender_id,u) then raise exception 'Invitation expired or unavailable';end if;
 if p_action='decline' then
  update public.dv_friend_duels92 set status='declined' where match_id=p_match;
  perform public.dv_match_cancel90(d.sender_id,p_match);return null;
 elsif p_action='accept' then
  joined:=public.dv_match_join90(u,'private',p_deck,m.invite_code);
  if joined<>p_match then raise exception 'Finish or leave your current duel first';end if;
  update public.dv_friend_duels92 set status='accepted' where match_id=p_match;return p_match;
 end if;raise exception 'Unknown invitation action';
end;$$;
revoke all on function public.dv_social_user92(),public.dv_are_friends92(uuid,uuid),public.dv_social_search92(text),public.dv_social_action92(uuid,text),public.dv_social_list92(),public.dv_social_summary92(),public.dv_friend_invite92(uuid,uuid),public.dv_friend_reply92(uuid,text,uuid) from public,anon,authenticated,service_role;
grant execute on function public.dv_social_search92(text),public.dv_social_action92(uuid,text),public.dv_social_list92(),public.dv_social_summary92(),public.dv_friend_invite92(uuid,uuid),public.dv_friend_reply92(uuid,text,uuid) to authenticated;
commit;
