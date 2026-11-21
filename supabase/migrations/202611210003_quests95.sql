-- One-time quests: only trusted random PvP results can advance game counters.
begin;
drop index public.dv_variant_identity53;
create unique index dv_variant_identity53 on public.dv_card_variants(definition_id,rarity,element,edition);
insert into public.dv_card_variants(id,definition_id,rarity,image,edition,element) values
 ('doge:legendary:fire:recruiter','doge','legendary','/game/assets/cards/recruiter-v95/doge-diamond.webp','recruiter','fire'),
 ('pepe:mythic:storm:recruiter','pepe','mythic','/game/assets/cards/recruiter-v95/pepe-void.webp','recruiter','storm');
alter table public.dv_booster_purchases36 drop constraint dv_booster_purchases36_currency_check;
alter table public.dv_booster_purchases36 drop constraint dv_booster_purchases36_check;
alter table public.dv_booster_purchases36 add constraint dv_booster_purchases36_currency_check check(currency in ('pixels','shards','starter','quest'));
alter table public.dv_booster_purchases36 add constraint dv_booster_purchases36_check check((currency='pixels' and cost=100) or(currency='shards' and cost=150) or(currency in ('starter','quest') and cost=0));

create table public.dv_quest_catalog95(id text primary key,family text not null check(family in ('played','won','referrals')),goal integer not null check(goal>0),packs integer not null check(packs between 0 and 10),card text references public.dv_card_variants(id));
insert into public.dv_quest_catalog95(id,family,goal,packs,card) values
 ('played-5','played',5,1,null),('played-25','played',25,1,null),('played-100','played',100,3,null),('played-250','played',250,5,null),
 ('won-3','won',3,1,null),('won-10','won',10,1,null),('won-50','won',50,3,null),('won-100','won',100,5,null),
 ('referrals-1','referrals',1,1,null),('referrals-3','referrals',3,2,null),
 ('referrals-5','referrals',5,2,'doge:legendary:fire:recruiter'),('referrals-15','referrals',15,5,'pepe:mythic:storm:recruiter');
create table public.dv_quest_activity95(user_id uuid not null references auth.users(id) on delete cascade,match_id uuid not null,round_no integer not null,opponent uuid not null,won boolean not null,completed_at timestamptz not null default now(),primary key(user_id,match_id,round_no));
create index dv_quest_activity_user95 on public.dv_quest_activity95(user_id,completed_at);
create table public.dv_quest_claims95(user_id uuid not null references public.dv_profiles(user_id) on delete cascade,quest_id text not null references public.dv_quest_catalog95(id),pack_ids uuid[] not null,card text references public.dv_card_variants(id),claimed_at timestamptz not null default now(),primary key(user_id,quest_id));
create table public.dv_referral_codes95(user_id uuid primary key references auth.users(id) on delete cascade,code text not null unique default replace(gen_random_uuid()::text,'-','') check(code~'^[a-f0-9]{32}$'));
create table public.dv_referrals95(user_id uuid primary key references auth.users(id) on delete cascade,referrer_id uuid not null references auth.users(id) on delete cascade,joined_at timestamptz not null default now(),qualified_at timestamptz,check(user_id<>referrer_id));
create index dv_referral_owner95 on public.dv_referrals95(referrer_id);
-- Retained keyed email identities stop deletion/re-registration and Gmail aliases
-- from counting again. No email, password, IP or device fingerprint is stored here.
create table dv_private.referral_emails95(email_key bytea primary key,user_id uuid not null unique);
create table dv_private.referral_qualified95(email_key bytea primary key,referrer_id uuid not null references auth.users(id) on delete cascade,qualified_at timestamptz not null default now());
alter table public.dv_quest_catalog95 enable row level security;
alter table public.dv_quest_activity95 enable row level security;
alter table public.dv_quest_claims95 enable row level security;
alter table public.dv_referral_codes95 enable row level security;
alter table public.dv_referrals95 enable row level security;
alter table dv_private.referral_emails95 enable row level security;
alter table dv_private.referral_qualified95 enable row level security;
revoke all on public.dv_quest_catalog95,public.dv_quest_activity95,public.dv_quest_claims95,public.dv_referral_codes95,public.dv_referrals95,dv_private.referral_emails95,dv_private.referral_qualified95 from public,anon,authenticated,service_role;

create function public.dv_referral_email95(mail text) returns bytea language plpgsql stable security definer set search_path='' as $$
declare localpart text;domain text;normalized text;
begin
 normalized:=lower(btrim(mail));if normalized is null or position('@' in normalized)<2 then return null;end if;
 localpart:=split_part(normalized,'@',1);domain:=split_part(normalized,'@',2);
 if domain in ('gmail.com','googlemail.com') then domain:='gmail.com';localpart:=replace(split_part(localpart,'+',1),'.','');end if;
 return (select sha256(convert_to(localpart||'@'||domain,'UTF8')||secret) from dv_private.welcome_key57 where id=true);
end;$$;
create function public.dv_bind_referral95() returns trigger language plpgsql security definer set search_path='' as $$
declare v_code text:=to_jsonb(new)->'raw_user_meta_data'->>'duelverse_referral95';inviter uuid;v_email_key bytea;own_key bytea;inserted bytea;
begin
 if v_code is null or v_code!~'^[a-f0-9]{32}$' then return new;end if;
 select c.user_id,public.dv_referral_email95(u.email) into inviter,own_key from public.dv_referral_codes95 c join auth.users u on u.id=c.user_id where c.code=v_code and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false);
 v_email_key:=public.dv_referral_email95(new.email);
 if inviter is null or inviter=new.id or v_email_key is null or v_email_key=own_key or coalesce(new.is_anonymous,false) then return new;end if;
 insert into dv_private.referral_emails95(email_key,user_id) values(v_email_key,new.id) on conflict do nothing returning referral_emails95.email_key into inserted;
 if inserted is not null then insert into public.dv_referrals95(user_id,referrer_id) values(new.id,inviter);end if;
 return new;
end;$$;
create trigger dv_bind_new_referral95 after insert on auth.users for each row execute function public.dv_bind_referral95();

create function public.dv_capture_quest_round95() returns trigger language plpgsql security definer set search_path='' as $$
declare m public.dv_pvp90%rowtype;
begin
 select * into m from public.dv_pvp90 where id=new.match_id;
 if m.kind='random' and new.user_id in (m.host_id,m.guest_id) then
  insert into public.dv_quest_activity95(user_id,match_id,round_no,opponent,won)
  values(new.user_id,new.match_id,new.round_no,case when new.user_id=m.host_id then m.guest_id else m.host_id end,new.award=5) on conflict do nothing;
 end if;
 return new;
end;$$;
create trigger dv_quest_round95 after insert on public.dv_pvp_rounds90 for each row execute function public.dv_capture_quest_round95();
-- Proven historical completions count. Approximate old dates never create a
-- referral: attribution is available only to accounts created after this migration.
insert into public.dv_quest_activity95(user_id,match_id,round_no,opponent,won,completed_at)
 select r.user_id,r.match_id,r.round_no,case when r.user_id=m.host_id then m.guest_id else m.host_id end,r.award=5,coalesce(b.ended_at,m.updated_at)
 from public.dv_pvp_rounds90 r join public.dv_pvp90 m on m.id=r.match_id left join public.dv_balance_rounds94 b on b.source='pvp' and b.match_id=r.match_id and b.round_no=r.round_no where m.kind='random' on conflict do nothing;

create function public.dv_sync_referrals95(u uuid) returns void language plpgsql security definer set search_path='' as $$
declare r record;claimed bytea;
begin
 for r in select f.user_id,e.email_key from public.dv_referrals95 f join auth.users a on a.id=f.user_id join dv_private.referral_emails95 e on e.user_id=f.user_id
  where f.referrer_id=u and f.qualified_at is null and a.email_confirmed_at is not null and not coalesce(a.is_anonymous,false)
   and (select count(*) from public.dv_quest_activity95 x where x.user_id=f.user_id and x.completed_at>=f.joined_at)>=10
   and (select count(distinct opponent) from public.dv_quest_activity95 x where x.user_id=f.user_id and x.completed_at>=f.joined_at)>=2
   and (select count(distinct (completed_at at time zone 'UTC')::date) from public.dv_quest_activity95 x where x.user_id=f.user_id and x.completed_at>=f.joined_at)>=3
  for update of f
 loop
  claimed:=null;
  insert into dv_private.referral_qualified95(email_key,referrer_id) values(r.email_key,u) on conflict do nothing returning email_key into claimed;
  if claimed is not null then update public.dv_referrals95 set qualified_at=now() where user_id=r.user_id;end if;
 end loop;
end;$$;
create function public.dv_quest_counts95(u uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('played',(select count(*) from public.dv_quest_activity95 where user_id=u),'won',(select count(*) from public.dv_quest_activity95 where user_id=u and won),'referrals',(select count(*) from dv_private.referral_qualified95 where referrer_id=u))
$$;
create function public.dv_quest_status95() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();code text;counts jsonb;
begin
 if u is null or not exists(select 1 from auth.users where id=u and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Verify your email to use quests' using errcode='42501';end if;
 perform 1 from public.dv_profiles where user_id=u for update;if not found then raise exception 'Initialize account first';end if;
 insert into public.dv_referral_codes95(user_id) values(u) on conflict do nothing;
 select c.code into code from public.dv_referral_codes95 c where c.user_id=u;
 perform public.dv_sync_referrals95(u);counts:=public.dv_quest_counts95(u);
 return jsonb_build_object('code',code,'counts',counts,
  'quests',(select jsonb_agg(to_jsonb(q) order by family,goal) from public.dv_quest_catalog95 q),
  'claims',coalesce((select jsonb_agg(jsonb_build_object('id',quest_id,'packs',pack_ids,'card',card,'at',claimed_at)) from public.dv_quest_claims95 where user_id=u),'[]'),
  'friends',coalesce((select jsonb_agg(jsonb_build_object('name',coalesce(p.display_name,'New player'),'qualified',f.qualified_at is not null,'verified',a.email_confirmed_at is not null,
   'rounds',(select count(*) from public.dv_quest_activity95 x where x.user_id=f.user_id and x.completed_at>=f.joined_at),
   'opponents',(select count(distinct opponent) from public.dv_quest_activity95 x where x.user_id=f.user_id and x.completed_at>=f.joined_at),
   'days',(select count(distinct (completed_at at time zone 'UTC')::date) from public.dv_quest_activity95 x where x.user_id=f.user_id and x.completed_at>=f.joined_at)) order by f.joined_at)
   from public.dv_referrals95 f join auth.users a on a.id=f.user_id left join public.dv_profiles p on p.user_id=f.user_id where f.referrer_id=u),'[]'));
end;$$;
create function public.dv_claim_quest95(p_quest text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();q public.dv_quest_catalog95%rowtype;old public.dv_quest_claims95%rowtype;counts jsonb;packs uuid[]:='{}';i integer;
begin
 if u is null or not exists(select 1 from auth.users where id=u and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Verify your email to claim rewards' using errcode='42501';end if;
 perform 1 from public.dv_profiles where user_id=u for update;if not found then raise exception 'Initialize account first';end if;
 select * into old from public.dv_quest_claims95 where user_id=u and quest_id=p_quest;
 if found then return jsonb_build_object('id',old.quest_id,'packs',old.pack_ids,'card',old.card,'replayed',true);end if;
 select * into q from public.dv_quest_catalog95 where id=p_quest;if not found then raise exception 'Unknown quest';end if;
 perform public.dv_sync_referrals95(u);counts:=public.dv_quest_counts95(u);
 if (counts->>q.family)::integer<q.goal then raise exception 'Quest progress not complete';end if;
 for i in 1..q.packs loop packs:=array_append(packs,public.dv_allocate_alpha56(u,gen_random_uuid(),'quest',0));end loop;
 if q.card is not null then insert into public.dv_inventory(user_id,variant_id,quantity) values(u,q.card,1) on conflict(user_id,variant_id) do update set quantity=public.dv_inventory.quantity+1;end if;
 insert into public.dv_quest_claims95(user_id,quest_id,pack_ids,card) values(u,q.id,packs,q.card);
 return jsonb_build_object('id',q.id,'packs',packs,'card',q.card,'replayed',false);
end;$$;
-- Earned referral artwork is permanent: it cannot be crafted or recycled for currency.
alter function public.dv_trade_card(uuid,text,text) rename to dv_trade_card_base95;
revoke all on function public.dv_trade_card_base95(uuid,text,text) from public,anon,authenticated,service_role;
create function public.dv_trade_card(p_request uuid,p_kind text,p_variant text) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.dv_card_variants where id=p_variant and edition='recruiter') then raise exception 'Referral rewards cannot be crafted or dismantled';end if;
 return public.dv_trade_card_base95(p_request,p_kind,p_variant);
end;$$;
revoke all on function public.dv_referral_email95(text),public.dv_bind_referral95(),public.dv_capture_quest_round95(),public.dv_sync_referrals95(uuid),public.dv_quest_counts95(uuid),public.dv_quest_status95(),public.dv_claim_quest95(text),public.dv_trade_card(uuid,text,text) from public,anon,authenticated,service_role;
grant execute on function public.dv_quest_status95(),public.dv_claim_quest95(text),public.dv_trade_card(uuid,text,text) to authenticated;
commit;
