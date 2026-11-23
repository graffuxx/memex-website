-- Business-level stale versions are HTTP conflicts, not serialization failures.
-- SQLSTATE 40001 may cause PostgREST to retry the same stale transaction forever.
-- Preserve all version checks, request receipts, row locks, rewards and ACLs.
begin;
do $conflict139$
declare fn record;definition text;replacement text;
begin
 for fn in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.prokind='f'
   and p.proname in ('dv_game_commit50','dv_game_commit_base113',
                    'dv_match_commit90','dv_match_commit_human96')
 loop
  definition:=pg_get_functiondef(fn.oid);
  replacement:=regexp_replace(definition,'errcode[[:space:]]*=[[:space:]]*''40001''',
                              'errcode=''PT409''','gi');
  if replacement is distinct from definition then execute replacement;end if;
 end loop;
 if exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname in ('dv_game_commit50','dv_game_commit_base113',
       'dv_match_commit90','dv_match_commit_human96')
   and p.prosrc~*'errcode[[:space:]]*=[[:space:]]*''40001''')
 then raise exception 'Stale-version retry code remains';end if;
end;
$conflict139$;
commit;
