-- Retain stable quest IDs, receipts and earned cosmetics. No second claim.
begin;
update public.dv_quest_catalog95 q set goal=v.goal
from (values('collected-25',50),('collected-50',75),('collected-95',95)) v(id,goal)
where q.id=v.id;
commit;
