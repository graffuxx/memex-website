begin;
alter table public.dv_quest_catalog95 drop constraint if exists dv_quest_catalog95_family_check;
alter table public.dv_quest_catalog95 add constraint dv_quest_catalog95_family_check check(family in ('played','won','referrals','collected'));
alter table public.dv_quest_catalog95 add column if not exists portrait text,add column if not exists title text;
insert into public.dv_identity_catalog85(kind,id,min_level,min_wins,source,requirements) values
('portrait','collector-gold',1,0,'owned','{}'),('title','meme-collector',1,0,'owned','{}'),
('portrait','collector-diamond',1,0,'owned','{}'),('title','gallery-curator',1,0,'owned','{}'),
('portrait','collector-void',1,0,'owned','{}'),('title','archive-overlord',1,0,'owned','{}') on conflict(kind,id) do nothing;
insert into public.dv_quest_catalog95(id,family,goal,packs,portrait,title) values
('collected-25','collected',25,0,'collector-gold','meme-collector'),('collected-50','collected',50,0,'collector-diamond','gallery-curator'),('collected-95','collected',95,0,'collector-void','archive-overlord') on conflict(id) do update set portrait=excluded.portrait,title=excluded.title;
create or replace function public.dv_quest_counts95(u uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('played',(select count(*) from public.dv_quest_activity95 where user_id=u)+(select count(*) from public.dv_random_ai_rounds98 where user_id=u),'won',(select count(*) from public.dv_quest_activity95 where user_id=u and won)+(select count(*) from public.dv_random_ai_rounds98 where user_id=u and award=5),'referrals',(select count(*) from dv_private.referral_qualified95 where referrer_id=u),'collected',(select count(distinct v.definition_id) from public.dv_card_acquired36 a join public.dv_card_variants v on v.id=a.variant_id where a.user_id=u and a.quantity>0))
$$;
do $$begin if to_regprocedure('public.dv_claim_quest_base129(text)') is null then alter function public.dv_claim_quest95(text) rename to dv_claim_quest_base129;end if;if to_regprocedure('public.dv_quest_status_base129()') is null then alter function public.dv_quest_status95() rename to dv_quest_status_base129;end if;end;$$;
create or replace function public.dv_claim_quest95(p_quest text) returns jsonb language plpgsql security definer set search_path='' as $$
declare receipt jsonb;q public.dv_quest_catalog95%rowtype;u uuid:=auth.uid();
begin
 receipt:=public.dv_claim_quest_base129(p_quest);select * into q from public.dv_quest_catalog95 where id=p_quest;
 if q.portrait is not null then insert into public.dv_cosmetic_ownership(user_id,kind,cosmetic_id) values(u,'portrait',q.portrait) on conflict do nothing;end if;
 if q.title is not null then insert into public.dv_cosmetic_ownership(user_id,kind,cosmetic_id) values(u,'title',q.title) on conflict do nothing;end if;
 return receipt||jsonb_build_object('portrait',q.portrait,'title',q.title);
end;$$;
create or replace function public.dv_quest_status95() returns jsonb language plpgsql security definer set search_path='' as $$
declare receipt jsonb;u uuid:=auth.uid();
begin receipt:=public.dv_quest_status_base129();return receipt||jsonb_build_object('claims',coalesce((select jsonb_agg(jsonb_build_object('id',c.quest_id,'packs',c.pack_ids,'card',c.card,'at',c.claimed_at,'portrait',q.portrait,'title',q.title)) from public.dv_quest_claims95 c join public.dv_quest_catalog95 q on q.id=c.quest_id where c.user_id=u),'[]'::jsonb));end;$$;
revoke all on function public.dv_claim_quest_base129(text),public.dv_quest_status_base129(),public.dv_quest_counts95(uuid),public.dv_claim_quest95(text),public.dv_quest_status95() from public,anon,authenticated,service_role;
grant execute on function public.dv_claim_quest95(text),public.dv_quest_status95() to authenticated;
commit;
