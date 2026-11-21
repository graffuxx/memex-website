-- Private operator analytics. No player can write telemetry or appoint an operator.
begin;
create table public.dv_balance_admins94(user_id uuid primary key references auth.users(id) on delete cascade,enabled boolean not null default true);
create table public.dv_balance_rounds94(
 source text not null check(source in ('pvp','account')),match_id uuid not null,round_no integer not null check(round_no in (1,2)),
 mode text not null check(mode in ('random','private','ai')),patch text not null,fingerprint text not null,
 completed boolean not null,ended_at timestamptz not null default now(),duration_ms bigint,
 starter integer,winner integer,players text[] not null,facts jsonb not null,snapshot jsonb not null,
 primary key(source,match_id,round_no)
);
create index dv_balance_filter94 on public.dv_balance_rounds94(ended_at desc,mode,patch);
alter table public.dv_balance_admins94 enable row level security;
alter table public.dv_balance_rounds94 enable row level security;
revoke all on public.dv_balance_admins94,public.dv_balance_rounds94 from public,anon,authenticated,service_role;

create function public.dv_balance_facts94(g jsonb,decks jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare side integer;c jsonb;cards jsonb;seats jsonb:='[]';facts jsonb;played_cell text;event jsonb;flips integer;lost integer;placements integer;
begin
 for side in 0..1 loop
  cards:='[]';
  for c in select value from jsonb_array_elements(coalesce(g->'players'->side->'hand','[]')||coalesce(g->'players'->side->'deck','[]'))
   union all select value from jsonb_each(g->'board') where (value->>'origin')::integer=side
  loop
   -- Native/legacy cards without a catalog variant cannot inform card balance.
   if c->>'variantId' is null then continue;end if;
   played_cell:=null;flips:=0;lost:=0;
   select e->>'cell',coalesce(jsonb_array_length(e->'flips'),0) into played_cell,flips
    from jsonb_array_elements(g->'history') e where e->>'type'='place' and e->>'uid'=c->>'uid' limit 1;
   if played_cell is not null then
    select count(*) into lost from jsonb_array_elements(g->'history') e
     where e->>'type'='place' and (e->>'side')::integer<>side and (e->'flips') ? played_cell;
   end if;
   cards:=cards||jsonb_build_array(jsonb_build_object('id',c->>'variantId','element',c->>'element',
    'drawn',not exists(select 1 from jsonb_array_elements(g->'players'->side->'deck') d where d->>'uid'=c->>'uid'),
    'played',played_cell is not null,'flips',coalesce(flips,0),'recaptured',lost,
    'retained',played_cell is not null and (g->'board'->played_cell->>'controller')::integer=side));
  end loop;
  select count(*) into placements from jsonb_array_elements(g->'history') e where e->>'type'='place' and (e->>'side')::integer=side;
  -- Freeze the actual element, including native variants whose ID omits it.
  seats:=seats||jsonb_build_array(jsonb_build_object('deck',coalesce((select jsonb_agg(case when array_length(string_to_array(v->>'id',':'),1)=2 and v->>'element' is not null then (v->>'id')||':'||(v->>'element') else v->>'id' end) from jsonb_array_elements(cards) v),decks->side->'cards','[]'),'cards',cards,'placements',placements,
   'score',(select count(*) from jsonb_each(g->'board') b where (b.value->>'controller')::integer=side)));
 end loop;
 return seats;
end;$$;

create function public.dv_balance_archive94(p_source text,p_id uuid,p_state jsonb,p_mode text,p_users uuid[],p_created timestamptz) returns void
 language plpgsql security definer set search_path='' as $$
declare g jsonb:=p_state->'game';complete boolean;decks jsonb;started timestamptz;rn integer;patch text;fingerprint text;
begin
 if jsonb_typeof(g->'players') is distinct from 'array' or jsonb_typeof(g->'board') is distinct from 'object' or jsonb_typeof(g->'history') is distinct from 'array' then return;end if;
 complete:=coalesce((g->>'finished')::boolean,false) and (g->>'placements')::integer=18 and p_state->>'forfeit' is null;
 if not complete and p_state->>'forfeit' is null then return;end if;
 rn:=(p_state->>'round')::integer;
 decks:=case when p_source='pvp' then p_state->'decks' else jsonb_build_array(p_state->'deck',jsonb_build_object('cards',
  (select jsonb_agg(c->>'variantId' order by c->>'variantId') from (
   select value c from jsonb_array_elements(g->'players'->1->'hand') union all select value from jsonb_array_elements(g->'players'->1->'deck')
   union all select value from jsonb_each(g->'board') where (value->>'origin')::integer=1) all_cards))) end;
 patch:=case when p_state->'balance'->>'mixed'='true' then 'mixed-patch' else coalesce(p_state->'balance'->>'patch','legacy-unversioned') end;fingerprint:=coalesce(p_state->'balance'->>'fingerprint','unknown');
 started:=case when p_state->'balance'->>'roundStartedAt' ~ '^[0-9]{1,16}$' then to_timestamp((p_state->'balance'->>'roundStartedAt')::double precision/1000) else p_created end;
 insert into public.dv_balance_rounds94(source,match_id,round_no,mode,patch,fingerprint,completed,duration_ms,starter,winner,players,facts,snapshot)
 values(p_source,p_id,rn,p_mode,patch,fingerprint,complete,greatest(0,(extract(epoch from (now()-started))*1000)::bigint),
  (g->>'starter')::integer,case when complete then (g->>'winner')::integer else null end,
  array(select case when u is null then 'ai' else md5(u::text) end from unnest(p_users) u),
  public.dv_balance_facts94(g,decks),jsonb_build_object('game',g,'decks',decks,'seed',p_state->'seed','balance',p_state->'balance'))
 on conflict do nothing;
end;$$;

create function public.dv_balance_capture94() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_table_name='dv_pvp90' then
  perform public.dv_balance_archive94('pvp',new.id,new.state,new.kind,array[new.host_id,new.guest_id],new.created_at);
 else
  perform public.dv_balance_archive94('account',new.id,new.state,'ai',array[new.user_id,null::uuid],new.created_at);
 end if;
 return new;
end;$$;
create trigger dv_balance_pvp94 after insert or update of state on public.dv_pvp90 for each row execute function public.dv_balance_capture94();
create trigger dv_balance_account94 after insert or update of state on public.dv_game_sessions50 for each row execute function public.dv_balance_capture94();

-- Recover only histories that still exist, never invent overwritten first rounds.
do $$declare r record;begin
 for r in select * from public.dv_pvp90 where state is not null loop perform public.dv_balance_archive94('pvp',r.id,r.state,r.kind,array[r.host_id,r.guest_id],r.created_at);end loop;
 for r in select * from public.dv_game_sessions50 loop perform public.dv_balance_archive94('account',r.id,r.state,'ai',array[r.user_id,null::uuid],r.created_at);end loop;
end;$$;

create function public.dv_balance_dashboard94(p_days integer default 30,p_mode text default 'random') returns jsonb
 language plpgsql security definer set search_path='' as $$
declare report jsonb;total integer;
begin
 if auth.uid() is null or not exists(select 1 from public.dv_balance_admins94 a join auth.users u on u.id=a.user_id where a.user_id=auth.uid() and a.enabled and u.email_confirmed_at is not null) then raise exception 'Operator access required' using errcode='42501';end if;
 if p_days not in (7,30,90,365) or p_mode not in ('random','private','ai') or p_days is null or p_mode is null then raise exception 'Invalid report filter';end if;
 select count(*) into total from public.dv_balance_rounds94 where ended_at>=now()-make_interval(days=>p_days) and mode=p_mode;
 select coalesce(jsonb_agg(jsonb_build_object('id',source||':'||match_id||':'||round_no,'patch',patch,'fingerprint',fingerprint,
  'complete',completed,'at',ended_at,'duration',duration_ms,'starter',starter,'winner',winner,'players',players,'seats',facts) order by ended_at desc),'[]') into report
 from (select * from public.dv_balance_rounds94 where ended_at>=now()-make_interval(days=>p_days) and mode=p_mode order by ended_at desc,match_id,round_no limit 1000) r;
 return jsonb_build_object('rows',report,'total',total,'limit',1000,'generatedAt',now());
end;$$;
revoke all on function public.dv_balance_facts94(jsonb,jsonb),public.dv_balance_archive94(text,uuid,jsonb,text,uuid[],timestamptz),public.dv_balance_capture94(),public.dv_balance_dashboard94(integer,text) from public,anon,authenticated,service_role;
grant execute on function public.dv_balance_dashboard94(integer,text) to authenticated;
commit;
