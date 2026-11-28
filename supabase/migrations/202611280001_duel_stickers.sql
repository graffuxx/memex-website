begin;

create table public.dv_sticker_loadouts (
 user_id uuid primary key references public.dv_profiles(user_id) on delete cascade,
 slots text[] not null
);
create table public.dv_duel_sticker_events (
 match_id uuid not null references public.dv_pvp90(id) on delete cascade,
 sender_id uuid not null references public.dv_profiles(user_id) on delete cascade,
 id uuid not null default gen_random_uuid(),
 sticker text not null,
 round_no integer not null,
 sent_at timestamptz not null,
 primary key (match_id,sender_id)
);
alter table public.dv_sticker_loadouts enable row level security;
alter table public.dv_duel_sticker_events enable row level security;
revoke all on public.dv_sticker_loadouts,public.dv_duel_sticker_events from public,anon,authenticated,service_role;

create function public.dv_default_sticker_slots() returns text[]
language sql immutable set search_path='' as $$
 select array['kekw','rage-guy','dramatic-chipmunk','crying-cat']::text[]
$$;

create function public.dv_sticker_loadout() returns text[]
language plpgsql stable security definer set search_path='' as $$
declare owner_id uuid:=public.dv_social_user92();
begin
 return coalesce((select slots from public.dv_sticker_loadouts where user_id=owner_id),public.dv_default_sticker_slots());
end;$$;

create function public.dv_save_sticker_loadout(p_slots text[]) returns text[]
language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=public.dv_social_user92();
begin
 if array_ndims(p_slots) is distinct from 1 or array_lower(p_slots,1) is distinct from 1
    or cardinality(p_slots) is distinct from 4 or (select count(distinct sticker) from unnest(p_slots) sticker)<>4
    or not (p_slots <@ public.dv_default_sticker_slots()) then
  raise exception 'Choose four different starter stickers';
 end if;
 insert into public.dv_sticker_loadouts(user_id,slots) values(owner_id,p_slots)
 on conflict(user_id) do update set slots=excluded.slots;
 return p_slots;
end;$$;

create function public.dv_duel_stickers(p_user uuid,p_match uuid,p_slot integer default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare duel public.dv_pvp90%rowtype; equipped text[]; recent jsonb; round_number integer; sent timestamptz;
begin
 if p_slot is null then
  select * into duel from public.dv_pvp90 where id=p_match and p_user in (host_id,guest_id);
 else
  select * into duel from public.dv_pvp90 where id=p_match and p_user in (host_id,guest_id) for share;
 end if;
 if not found then raise exception 'Duel unavailable';end if;
 if p_slot is not null and (p_slot not between 1 and 4 or duel.status<>'matched'
    or duel.state->>'phase' is distinct from 'play') then
  raise exception 'Stickers are available during an active round';
 end if;
 if duel.status<>'matched' or duel.state->>'phase' is distinct from 'play' then return null;end if;
 round_number:=(duel.state->>'round')::integer;
 equipped:=coalesce((select slots from public.dv_sticker_loadouts where user_id=p_user),public.dv_default_sticker_slots());
 if p_slot is not null then
  sent:=clock_timestamp();
  insert into public.dv_duel_sticker_events(match_id,sender_id,sticker,round_no,sent_at)
  values(duel.id,p_user,equipped[p_slot],round_number,sent)
  on conflict(match_id,sender_id) do update
   set id=excluded.id,sticker=excluded.sticker,round_no=excluded.round_no,sent_at=excluded.sent_at
   where public.dv_duel_sticker_events.sent_at<=excluded.sent_at-interval '3 seconds';
  if not found then raise exception 'Wait before sending another sticker' using errcode='PT429';end if;
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'sticker',e.sticker,'own',e.sender_id=p_user,'at',e.sent_at)
  order by e.sent_at,e.id),'[]'::jsonb) into recent from public.dv_duel_sticker_events e
 where e.match_id=duel.id and e.round_no=round_number and e.sent_at>clock_timestamp()-interval '4 seconds';
 return jsonb_build_object('slots',equipped,'events',recent);
end;$$;

create function public.dv_match_get_with_stickers(p_user uuid,p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare match_view jsonb:=public.dv_match_get90(p_user,p_id);
begin
 return match_view||jsonb_build_object('stickers',public.dv_duel_stickers(p_user,p_id));
end;$$;

revoke all on function public.dv_default_sticker_slots(),public.dv_sticker_loadout(),
 public.dv_save_sticker_loadout(text[]),public.dv_duel_stickers(uuid,uuid,integer),
 public.dv_match_get_with_stickers(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.dv_sticker_loadout(),public.dv_save_sticker_loadout(text[]) to authenticated;
grant execute on function public.dv_duel_stickers(uuid,uuid,integer),public.dv_match_get_with_stickers(uuid,uuid) to service_role;

notify pgrst,'reload schema';
commit;
