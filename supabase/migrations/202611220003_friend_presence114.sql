-- Presence leases are visible only through the caller's accepted, unblocked friends.
begin;
create table public.dv_presence114(
 user_id uuid not null references public.dv_profiles(user_id) on delete cascade,
 client_id uuid not null,seen_at timestamptz not null default now(),visible boolean not null default true,
 primary key(user_id,client_id)
);
alter table public.dv_presence114 enable row level security;
revoke all on public.dv_presence114 from public,anon,authenticated,service_role;
create function public.dv_presence_ping114(p_client uuid,p_visible boolean default true) returns boolean language plpgsql security definer set search_path='' as $$
declare u uuid:=public.dv_social_user92();
begin
 if p_client is null or p_visible is null then raise exception 'Invalid presence';end if;
 if not exists(select 1 from public.dv_profiles where user_id=u) then return false;end if;
 perform pg_advisory_xact_lock(hashtextextended('presence114:'||u::text,0));
 delete from public.dv_presence114 where user_id=u and seen_at<now()-interval '2 minutes';
 if not exists(select 1 from public.dv_presence114 where user_id=u and client_id=p_client)
  and (select count(*) from public.dv_presence114 where user_id=u)>=24 then return false;end if;
 insert into public.dv_presence114(user_id,client_id,visible) values(u,p_client,p_visible)
 on conflict(user_id,client_id) do update set seen_at=now(),visible=excluded.visible
 where dv_presence114.seen_at<now()-interval '10 seconds' or dv_presence114.visible is distinct from excluded.visible;
 return true;
end;$$;
create function public.dv_presence_leave114(p_client uuid) returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=public.dv_social_user92();
begin
 delete from public.dv_presence114 where user_id=u and client_id=p_client;
end;$$;
create function public.dv_social_list114() returns jsonb language plpgsql security definer set search_path='' as $$
declare base jsonb:=public.dv_social_list92();people jsonb;
begin
 select coalesce(jsonb_agg(case when person->>'relationship'='friend' then person||jsonb_build_object('presence',
  coalesce((select case when count(*)=0 then 'offline' when bool_or(p.visible) then 'online' else 'away' end from public.dv_presence114 p
   where p.user_id=(person->>'id')::uuid and p.seen_at>now()-interval '90 seconds'),'offline')) else person end order by n),'[]'::jsonb)
 into people from jsonb_array_elements(base->'people') with ordinality t(person,n);
 return jsonb_set(base,'{people}',people);
end;$$;
revoke all on function public.dv_presence_ping114(uuid,boolean),public.dv_presence_leave114(uuid),public.dv_social_list114() from public,anon,authenticated,service_role;
grant execute on function public.dv_presence_ping114(uuid,boolean),public.dv_presence_leave114(uuid),public.dv_social_list114() to authenticated;
commit;
