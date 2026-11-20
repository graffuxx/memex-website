-- Opening is a single idempotent status update. Ownership and payment were already saved at allocation.
begin;
create function public.dv_open_alpha_booster58(p_booster uuid) returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 perform 1 from public.dv_profiles where user_id=u for update;
 update public.dv_booster_purchases36 set revealed_slots=array[0,1,2,3,4] where id=p_booster and user_id=u;
 if not found then raise exception 'Booster not found';end if;
end;$$;
revoke all on function public.dv_open_alpha_booster58(uuid) from public,anon;
grant execute on function public.dv_open_alpha_booster58(uuid) to authenticated;
commit;
