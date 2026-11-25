begin;

alter table public.dv_quest_catalog95 drop constraint dv_quest_catalog95_family_check;
alter table public.dv_quest_catalog95 add constraint dv_quest_catalog95_family_check
 check(family in ('played','won','referrals','collected','double_flips','triple_flips','quad_flips'));

insert into public.dv_identity_catalog85(kind,id,min_level,min_wins,source,requirements) values
 ('title','quest-goldfinger',1,0,'owned','{}'),
 ('title','quest-diamond-hands',1,0,'owned','{}'),
 ('portrait','quest-diamond-hands-portrait',1,0,'owned','{}')
on conflict(kind,id) do nothing;

insert into public.dv_quest_catalog95(id,family,goal,packs,portrait,title) values
 ('double-flips-10','double_flips',10,1,null,null),
 ('double-flips-50','double_flips',50,3,null,null),
 ('triple-flips-10','triple_flips',10,3,null,'quest-goldfinger'),
 ('quad-flips-1','quad_flips',1,5,'quest-diamond-hands-portrait','quest-diamond-hands')
on conflict(id) do nothing;

create or replace function public.dv_quest_counts95(u uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
  'played',(select count(*) from public.dv_quest_activity95 where user_id=u)+(select count(*) from public.dv_random_ai_rounds98 where user_id=u),
  'won',(select count(*) from public.dv_quest_activity95 where user_id=u and won)+(select count(*) from public.dv_random_ai_rounds98 where user_id=u and award=5),
  'referrals',(select count(*) from dv_private.referral_qualified95 where referrer_id=u),
  'collected',(select count(distinct v.definition_id) from public.dv_card_acquired36 a join public.dv_card_variants v on v.id=a.variant_id where a.user_id=u and a.quantity>0),
  'double_flips',coalesce(skills.double_flips,0),
  'triple_flips',coalesce(skills.triple_flips,0),
  'quad_flips',coalesce(skills.quad_flips,0))
 from (values (u)) player(id) left join public.dv_random_skills90 skills on skills.user_id=player.id
$$;

commit;
