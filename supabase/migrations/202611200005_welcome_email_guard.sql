-- A welcome gift belongs to a verified email address as well as an account.
-- Only keyed digests are retained here, without a user FK, so account deletion cannot reset eligibility.
begin;
create schema if not exists dv_private;
revoke all on schema dv_private from public,anon,authenticated,service_role;
create table dv_private.welcome_key57(
 id boolean primary key default true check(id),
 secret bytea not null check(octet_length(secret)=32)
);
insert into dv_private.welcome_key57(secret)
values(decode(replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-',''),'hex'));
create table dv_private.welcome_emails57(
 email_key bytea primary key check(octet_length(email_key)=32),
 claimed_at timestamptz not null default now()
);
revoke all on all tables in schema dv_private from public,anon,authenticated,service_role;
alter table dv_private.welcome_key57 enable row level security;
alter table dv_private.welcome_emails57 enable row level security;
-- Existing recipients keep their cards and consume their email's once-only entitlement.
insert into dv_private.welcome_emails57(email_key,claimed_at)
select sha256(convert_to(lower(btrim(a.email)),'UTF8')||k.secret),g.created_at
from public.dv_welcome_grants56 g join auth.users a on a.id=g.user_id cross join dv_private.welcome_key57 k
where nullif(btrim(a.email),'') is not null
on conflict(email_key) do nothing;

create or replace function public.dv_initialize_account() returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();mail text;fingerprint bytea;claimed bytea;granted uuid;i integer;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 perform public.dv_initialize_base56();
 perform 1 from public.dv_profiles where user_id=u for update;
 select lower(btrim(email)) into mail from auth.users where id=u and email_confirmed_at is not null and not coalesce(is_anonymous,false);
 if nullif(mail,'') is null then return;end if;
 -- Account entitlement remains consumed even after an email change.
 if exists(select 1 from public.dv_welcome_grants56 where user_id=u) then return;end if;
 select sha256(convert_to(mail,'UTF8')||secret) into fingerprint from dv_private.welcome_key57 where id=true;
 if fingerprint is null then raise exception 'Welcome gift configuration unavailable';end if;
 -- The unique key also serializes simultaneous registrations for the same normalized email.
 insert into dv_private.welcome_emails57(email_key) values(fingerprint) on conflict do nothing returning email_key into claimed;
 if claimed is null then return;end if;
 insert into public.dv_welcome_grants56(user_id) values(u) on conflict do nothing returning user_id into granted;
 if granted is not null then
  for i in 1..10 loop perform public.dv_allocate_alpha56(u,gen_random_uuid(),'starter',0);end loop;
 end if;
end;$$;
revoke all on function public.dv_initialize_account() from public,anon;
grant execute on function public.dv_initialize_account() to authenticated;
commit;
