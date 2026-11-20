-- One exceptional quad flip earns the luck title; mastery does not require quads.
begin;
update public.dv_identity_catalog85 set requirements='{"quad_flips":1}'::jsonb where kind='title' and id='no-touch-grass';
update public.dv_identity_catalog85 set requirements='{"triple_flips":50,"duel_sweeps":50}'::jsonb where kind='title' and id='final-boss';
commit;
