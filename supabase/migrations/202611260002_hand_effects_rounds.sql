-- A recall leaves a free hex, but the round still has 18 placements.
begin;

create or replace function public.dv_skill_snapshot88(p_state jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare history jsonb:=p_state->'game'->'history';e jsonb;cell text;side integer;board jsonb:='{}';n integer;placed integer:=0;own_turns integer:=0;own_score integer;enemy_score integer;deficit integer:=0;double_count integer:=0;triple_count integer:=0;quad_count integer:=0;flipped integer:=0;comeback integer:=0;dominant integer:=0;sweep integer:=0;round_no integer;recalls integer:=0;recall_cell text;swap_a text;swap_b text;old_owner jsonb;move_from text;move_to text;
 recall_rules boolean:=coalesce((p_state->'game'->>'iconicAbilityWave')::integer,0)>=11;
begin
 if p_state->>'ruleset' is distinct from 'account-50' or not coalesce((p_state->'game'->>'finished')::boolean,false) or (p_state->'game'->>'placements')::integer is distinct from 18 or jsonb_typeof(history) is distinct from 'array' then return null;end if;
 round_no:=(p_state->>'round')::integer;if round_no is null or round_no<1 then return null;end if;
 for e in select value from jsonb_array_elements(history) loop
  if e->>'type' is distinct from 'place' then continue;end if;
  side:=(e->>'side')::integer;cell:=e->>'cell';
  if side is null or side not in (0,1) or cell is null or jsonb_typeof(e->'flips') is distinct from 'array' then return null;end if;
  board:=jsonb_set(board,array[cell],to_jsonb(side),true);
  for cell in select jsonb_array_elements_text(e->'flips') loop if cell is null then return null;end if;board:=jsonb_set(board,array[cell],to_jsonb(side),true);end loop;
  if recall_rules then
   if jsonb_typeof(e->'swapCells')='array' and jsonb_array_length(e->'swapCells')=2 then
    swap_a:=e->'swapCells'->>0;swap_b:=e->'swapCells'->>1;old_owner:=board->swap_a;
    if old_owner is not null and board->swap_b is not null then
     board:=jsonb_set(jsonb_set(board,array[swap_a],board->swap_b),array[swap_b],old_owner);
    end if;
   end if;
   if jsonb_typeof(e->'relocation')='object' then
    move_from:=e->'relocation'->>'from';move_to:=e->'relocation'->>'to';
    if move_to is not null and board->move_from is not null then
     board:=jsonb_set(board-move_from,array[move_to],board->move_from);
    end if;
   end if;
   recall_cell:=e->>'recalledCell';
   if recall_cell is not null then
    if board->recall_cell is distinct from to_jsonb(side) then return null;end if;
    board:=board-recall_cell;recalls:=recalls+1;
   end if;
  end if;
  select count(*) filter(where value='0'::jsonb),count(*) filter(where value='1'::jsonb) into own_score,enemy_score from jsonb_each(board);
  deficit:=greatest(deficit,enemy_score-own_score);placed:=placed+1;
  if side=0 then own_turns:=own_turns+1;n:=jsonb_array_length(e->'flips');flipped:=flipped+n;if n>=2 then double_count:=double_count+1;end if;if n>=3 then triple_count:=triple_count+1;end if;if n>=4 then quad_count:=quad_count+1;end if;end if;
 end loop;
 if placed<>18 or own_turns<>9 or recalls>2 or own_score+enemy_score<>18-recalls then return null;end if;
 if recall_rules then
  own_score:=(p_state->'results'->(round_no-1)->>0)::integer;
  enemy_score:=(p_state->'results'->(round_no-1)->>1)::integer;
  if own_score is null or enemy_score is null or least(own_score,enemy_score)<0 or own_score+enemy_score<>18-recalls then return null;end if;
 end if;
 if (p_state->'game'->>'winner')::integer=0 then if deficit>=4 then comeback:=1;end if;if own_score>=14 then dominant:=1;end if;end if;
 if round_no=2 and jsonb_typeof(p_state->'results')='array' and jsonb_array_length(p_state->'results')=2 and (p_state->'results'->0->>0)::integer>(p_state->'results'->0->>1)::integer and (p_state->'results'->1->>0)::integer>(p_state->'results'->1->>1)::integer then sweep:=1;end if;
 return jsonb_build_object('double_flips',double_count,'triple_flips',triple_count,'quad_flips',quad_count,'total_flips',flipped,'comeback_wins',comeback,'dominant_wins',dominant,'duel_sweeps',sweep);
exception when invalid_text_representation or numeric_value_out_of_range or invalid_parameter_value then return null;
end;$$;

create or replace function public.dv_balance_facts94(g jsonb,decks jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare side integer;c jsonb;cards jsonb;seats jsonb:='[]';facts jsonb;played_cell text;event jsonb;flips integer;lost integer;placements integer;
begin
 for side in 0..1 loop
  cards:='[]';
  for c in select value from jsonb_array_elements(coalesce(g->'players'->side->'hand','[]')||coalesce(g->'players'->side->'deck','[]')||coalesce(g->'players'->side->'discard','[]'))
   union all select value from jsonb_each(g->'board') where (value->>'origin')::integer=side
  loop
   -- Native/legacy cards without a catalog variant cannot inform card balance.
   if c->>'variantId' is null then continue;end if;
   played_cell:=null;flips:=0;lost:=0;
   select (array_agg(e->>'cell' order by n desc))[1],coalesce(sum(jsonb_array_length(e->'flips')),0) into played_cell,flips
    from jsonb_array_elements(g->'history') with ordinality h(e,n) where e->>'type'='place' and e->>'uid'=c->>'uid';
   if played_cell is not null then
    select count(*) into lost from jsonb_array_elements(g->'history') e
     where e->>'type'='place' and (e->>'side')::integer<>side and (e->'flips') ? played_cell;
   end if;
   cards:=cards||jsonb_build_array(jsonb_build_object('id',c->>'variantId','element',c->>'element',
    'drawn',not exists(select 1 from jsonb_array_elements(g->'players'->side->'deck') d where d->>'uid'=c->>'uid'),
    'played',played_cell is not null,'flips',coalesce(flips,0),'recaptured',lost,
    'retained',exists(select 1 from jsonb_each(g->'board') b
     where b.value->>'uid'=c->>'uid' and (b.value->>'controller')::integer=side)));
  end loop;
  select count(*) into placements from jsonb_array_elements(g->'history') e where e->>'type'='place' and (e->>'side')::integer=side;
  -- Freeze the actual element, including native variants whose ID omits it.
  seats:=seats||jsonb_build_array(jsonb_build_object('deck',coalesce((select jsonb_agg(case when array_length(string_to_array(v->>'id',':'),1)=2 and v->>'element' is not null then (v->>'id')||':'||(v->>'element') else v->>'id' end) from jsonb_array_elements(cards) v),decks->side->'cards','[]'),'cards',cards,'placements',placements,
   'score',(select count(*) from jsonb_each(g->'board') b where (b.value->>'controller')::integer=side)));
 end loop;
 return seats;
end;$$;

commit;
