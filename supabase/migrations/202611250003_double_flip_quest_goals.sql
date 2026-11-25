begin;

-- Keep the existing IDs so claimed milestones cannot pay out a second time.
update public.dv_quest_catalog95 q set goal=v.goal
from (values ('double-flips-10',25),('double-flips-50',100)) v(id,goal)
where q.id=v.id and q.family='double_flips';

commit;
