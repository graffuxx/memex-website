begin;

create table if not exists public.dv_friend_signals(
 sender_id uuid not null references public.dv_profiles(user_id) on delete cascade,
 recipient_id uuid not null references public.dv_profiles(user_id) on delete cascade,
 id uuid not null default gen_random_uuid(),
 signal text not null check(signal in ('wave','play','gg')),
 sent_at timestamptz not null default now(),
 primary key(sender_id,recipient_id),
 check(sender_id<>recipient_id)
);
create index if not exists dv_friend_signals_inbox on public.dv_friend_signals(recipient_id,sent_at desc);
alter table public.dv_friend_signals enable row level security;
revoke all on public.dv_friend_signals from public,anon,authenticated,service_role;

create or replace function public.dv_send_friend_signal(p_friend uuid,p_signal text)
returns void language plpgsql security definer set search_path='' as $$
declare sender uuid:=public.dv_social_user92();
begin
 if p_friend is null or p_friend=sender or p_signal is null or p_signal not in ('wave','play','gg') then
  raise exception 'Choose a valid friend signal';
 end if;
 perform pg_advisory_xact_lock(hashtextextended('friend-signal:'||sender::text,0));
 -- Serialize with friend removal and blocking.
 perform 1 from public.dv_friends92 where low_id=least(sender,p_friend) and high_id=greatest(sender,p_friend) for share;
 if not public.dv_are_friends92(sender,p_friend) then raise exception 'Signals are only available between friends';end if;
 if exists(select 1 from public.dv_friend_signals where sender_id=sender
   and (sent_at>now()-interval '5 seconds' or (recipient_id=p_friend and sent_at>now()-interval '30 seconds'))) then
  raise exception 'Wait before sending another signal';
 end if;
 insert into public.dv_friend_signals(sender_id,recipient_id,signal) values(sender,p_friend,p_signal)
 on conflict(sender_id,recipient_id) do update set id=excluded.id,signal=excluded.signal,sent_at=excluded.sent_at;
end;$$;
revoke all on function public.dv_send_friend_signal(uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.dv_send_friend_signal(uuid,text) to authenticated;

create or replace function public.dv_social_list114() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=public.dv_social_user92();base jsonb:=public.dv_social_list92();people jsonb;signals jsonb;
begin
 select coalesce(jsonb_agg(case when person->>'relationship'='friend' then person||jsonb_build_object('presence',
  coalesce((select case when count(*)=0 then 'offline' when bool_or(p.visible) then 'online' else 'away' end from public.dv_presence114 p
   where p.user_id=(person->>'id')::uuid and p.seen_at>now()-interval '90 seconds'),'offline')) else person end order by n),'[]'::jsonb)
 into people from jsonb_array_elements(base->'people') with ordinality t(person,n);
 select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'signal',s.signal,'createdAt',s.sent_at,
  'identity',public.dv_public_identity90(s.sender_id)) order by s.sent_at desc,s.id),'[]'::jsonb)
 into signals from (
  select id,signal,sent_at,sender_id from public.dv_friend_signals
  where recipient_id=u and sent_at>now()-interval '24 hours' and public.dv_are_friends92(sender_id,u)
  order by sent_at desc,id limit 8
 ) s;
 return jsonb_set(base,'{people}',people)||jsonb_build_object('signals',signals);
end;$$;

notify pgrst,'reload schema';
commit;
