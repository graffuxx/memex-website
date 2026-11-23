-- Class odds are independent of the finish and of the player's acquisition history.
-- Existing pack contents were saved when granted or purchased.
begin;
set local lock_timeout = '5s';

do $$
begin
 if (select count(distinct (d.card_class,v.rarity))
     from public.dv_card_variants v join public.dv_card_definitions d on d.id=v.definition_id
     where v.edition='alpha')<>15 then
  raise exception 'Alpha boosters require all five finishes in each card class';
 end if;
end;$$;

create or replace function public.dv_alpha_class_odds144()
returns jsonb language sql immutable set search_path='' as $$
 select '{"regular":9600,"iconic":300,"prime":100}'::jsonb;
$$;
revoke all on function public.dv_alpha_class_odds144() from public,anon,authenticated,service_role;
grant execute on function public.dv_alpha_class_odds144() to anon,authenticated;

create or replace function public.dv_allocate_alpha56(u uuid,p_request uuid,p_currency text,price integer)
returns uuid language plpgsql security definer set search_path='' as $$
declare
 class_odds jsonb := public.dv_alpha_class_odds144();
 prime_limit integer := (class_odds->>'prime')::integer;
 iconic_limit integer := prime_limit+(class_odds->>'iconic')::integer;
 slot integer;
 roll integer;
 class_roll integer;
 category text;
 finish text;
 chosen text;
 history bigint;
 selected text[] := '{}';
 fresh text[] := '{}';
 result uuid;
begin
 for slot in 1..5 loop
  roll:=floor(random()*10000)::integer;
  if slot=5 then
   finish:=case when roll<9300 then 'rare' when roll<9900 then 'epic' when roll<9990 then 'legendary' else 'mythic' end;
  else
   finish:=case when roll<7700 then 'common' when roll<9700 then 'rare' when roll<9950 then 'epic' when roll<9995 then 'legendary' else 'mythic' end;
  end if;
  class_roll:=floor(random()*10000)::integer;
  category:=case when class_roll<prime_limit then 'prime' when class_roll<iconic_limit then 'iconic' else 'regular' end;

  -- Previously acquired cards rank after every unseen card in the same class and finish.
  -- Exhausting that pool allows duplicates without changing the rolled class or finish.
  select v.id,coalesce(a.quantity,0) into chosen,history
  from public.dv_card_variants v
  join public.dv_card_definitions d on d.id=v.definition_id
  left join public.dv_card_acquired36 a on a.user_id=u and a.variant_id=v.id
  where v.edition='alpha' and v.rarity=finish and d.card_class=category
  order by coalesce(a.quantity,0)>0,random()
  limit 1;
  if chosen is null then raise exception 'Booster catalog unavailable';end if;
  if coalesce((select quantity from public.dv_inventory where user_id=u and variant_id=chosen),0)>=100000 then raise exception 'Collection limit reached';end if;
  if history=0 and not(chosen=any(fresh)) then fresh:=array_append(fresh,chosen);end if;
  insert into public.dv_inventory(user_id,variant_id,quantity) values(u,chosen,1)
  on conflict(user_id,variant_id) do update set quantity=public.dv_inventory.quantity+1;
  selected:=array_append(selected,chosen);
 end loop;
 select array_agg(card order by random()) into selected from unnest(selected) as c(card);
 insert into public.dv_booster_purchases36(user_id,request_id,product_id,currency,cost,cards,new_variants)
 values(u,p_request,'alpha',p_currency,price,selected,fresh) returning id into result;
 return result;
end;$$;
revoke all on function public.dv_allocate_alpha56(uuid,uuid,text,integer) from public,anon,authenticated,service_role;
notify pgrst,'reload schema';
commit;
