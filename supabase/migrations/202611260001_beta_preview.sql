-- Beta preview fits the same fixed 120-slot format as Alpha.
begin;
set local lock_timeout = '5s';
insert into public.dv_card_sets131(id,name,size,limits,current_set)
values ('beta','Beta',120,'{"regular":85,"prime":15,"iconic":20}',false)
on conflict(id) do nothing;

insert into public.dv_card_definitions(id,rule_id,name,element,edge_values,is_prime,set_id,set_number,card_class) values
('beta-cinema', 'beta-cinema', 'Absolute Cinema', 'fire',array[7,4,3,10,2,4],true,'beta',86,'prime'),
('beta-hamster', 'beta-hamster', 'Sad Hamster', 'water',array[4,10,4,5,6,2],true,'beta',87,'prime'),
('beta-tpose', 'beta-tpose', 'T-Pose', 'earth',array[5,3,10,3,6,3],true,'beta',88,'prime'),
('beta-continued', 'beta-continued', 'To Be Continued', 'air',array[5,3,6,2,10,3],true,'beta',89,'prime'),
('beta-hackerman', 'beta-hackerman', 'Hackerman', 'storm',array[3,6,4,5,4,10],true,'beta',90,'prime'),
('beta-spicy', 'beta-spicy', 'Why Is It Spicy?', 'fire',array[3,6,4,3,6,5],false,'beta',101,'iconic'),
('beta-headout', 'beta-headout', 'Imma Head Out', 'water',array[7,3,5,3,5,4],false,'beta',102,'iconic'),
('beta-highground', 'beta-highground', 'High Ground', 'earth',array[4,6,4,5,3,5],false,'beta',103,'iconic'),
('beta-parkour', 'beta-parkour', 'Parkour!', 'air',array[6,3,6,3,6,4],false,'beta',104,'iconic'),
('beta-over9000', 'beta-over9000', 'Over 9000', 'storm',array[6,3,4,5,3,5],false,'beta',105,'iconic')
on conflict(id) do nothing;

insert into public.dv_card_variants(id,definition_id,rarity,image,element,edition) values
('beta-cinema:common', 'beta-cinema', 'common', '/game/assets/cards/beta-v1/cinema.webp', 'fire', 'beta'),
('beta-hamster:common', 'beta-hamster', 'common', '/game/assets/cards/beta-v1/hamster.webp', 'water', 'beta'),
('beta-tpose:common', 'beta-tpose', 'common', '/game/assets/cards/beta-v1/tpose.webp', 'earth', 'beta'),
('beta-continued:common', 'beta-continued', 'common', '/game/assets/cards/beta-v1/continued.webp', 'air', 'beta'),
('beta-hackerman:common', 'beta-hackerman', 'common', '/game/assets/cards/beta-v1/hackerman.webp', 'storm', 'beta'),
('beta-spicy:common', 'beta-spicy', 'common', '/game/assets/cards/beta-v1/spicy.webp', 'fire', 'beta'),
('beta-headout:common', 'beta-headout', 'common', '/game/assets/cards/beta-v1/headout.webp', 'water', 'beta'),
('beta-highground:common', 'beta-highground', 'common', '/game/assets/cards/beta-v1/highground.webp', 'earth', 'beta'),
('beta-parkour:common', 'beta-parkour', 'common', '/game/assets/cards/beta-v1/parkour.webp', 'air', 'beta'),
('beta-over9000:common', 'beta-over9000', 'common', '/game/assets/cards/beta-v1/over9000.webp', 'storm', 'beta'),
('beta-cinema:rare', 'beta-cinema', 'rare', '/game/assets/cards/beta-v1/cinema.webp', 'fire', 'beta'),
('beta-hamster:rare', 'beta-hamster', 'rare', '/game/assets/cards/beta-v1/hamster.webp', 'water', 'beta'),
('beta-tpose:rare', 'beta-tpose', 'rare', '/game/assets/cards/beta-v1/tpose.webp', 'earth', 'beta'),
('beta-continued:rare', 'beta-continued', 'rare', '/game/assets/cards/beta-v1/continued.webp', 'air', 'beta'),
('beta-hackerman:rare', 'beta-hackerman', 'rare', '/game/assets/cards/beta-v1/hackerman.webp', 'storm', 'beta'),
('beta-spicy:rare', 'beta-spicy', 'rare', '/game/assets/cards/beta-v1/spicy.webp', 'fire', 'beta'),
('beta-headout:rare', 'beta-headout', 'rare', '/game/assets/cards/beta-v1/headout.webp', 'water', 'beta'),
('beta-highground:rare', 'beta-highground', 'rare', '/game/assets/cards/beta-v1/highground.webp', 'earth', 'beta'),
('beta-parkour:rare', 'beta-parkour', 'rare', '/game/assets/cards/beta-v1/parkour.webp', 'air', 'beta'),
('beta-over9000:rare', 'beta-over9000', 'rare', '/game/assets/cards/beta-v1/over9000.webp', 'storm', 'beta'),
('beta-cinema:epic', 'beta-cinema', 'epic', '/game/assets/cards/beta-v1/cinema.webp', 'fire', 'beta'),
('beta-hamster:epic', 'beta-hamster', 'epic', '/game/assets/cards/beta-v1/hamster.webp', 'water', 'beta'),
('beta-tpose:epic', 'beta-tpose', 'epic', '/game/assets/cards/beta-v1/tpose.webp', 'earth', 'beta'),
('beta-continued:epic', 'beta-continued', 'epic', '/game/assets/cards/beta-v1/continued.webp', 'air', 'beta'),
('beta-hackerman:epic', 'beta-hackerman', 'epic', '/game/assets/cards/beta-v1/hackerman.webp', 'storm', 'beta'),
('beta-spicy:epic', 'beta-spicy', 'epic', '/game/assets/cards/beta-v1/spicy.webp', 'fire', 'beta'),
('beta-headout:epic', 'beta-headout', 'epic', '/game/assets/cards/beta-v1/headout.webp', 'water', 'beta'),
('beta-highground:epic', 'beta-highground', 'epic', '/game/assets/cards/beta-v1/highground.webp', 'earth', 'beta'),
('beta-parkour:epic', 'beta-parkour', 'epic', '/game/assets/cards/beta-v1/parkour.webp', 'air', 'beta'),
('beta-over9000:epic', 'beta-over9000', 'epic', '/game/assets/cards/beta-v1/over9000.webp', 'storm', 'beta'),
('beta-cinema:legendary', 'beta-cinema', 'legendary', '/game/assets/cards/beta-v1/cinema.webp', 'fire', 'beta'),
('beta-hamster:legendary', 'beta-hamster', 'legendary', '/game/assets/cards/beta-v1/hamster.webp', 'water', 'beta'),
('beta-tpose:legendary', 'beta-tpose', 'legendary', '/game/assets/cards/beta-v1/tpose.webp', 'earth', 'beta'),
('beta-continued:legendary', 'beta-continued', 'legendary', '/game/assets/cards/beta-v1/continued.webp', 'air', 'beta'),
('beta-hackerman:legendary', 'beta-hackerman', 'legendary', '/game/assets/cards/beta-v1/hackerman.webp', 'storm', 'beta'),
('beta-spicy:legendary', 'beta-spicy', 'legendary', '/game/assets/cards/beta-v1/spicy.webp', 'fire', 'beta'),
('beta-headout:legendary', 'beta-headout', 'legendary', '/game/assets/cards/beta-v1/headout.webp', 'water', 'beta'),
('beta-highground:legendary', 'beta-highground', 'legendary', '/game/assets/cards/beta-v1/highground.webp', 'earth', 'beta'),
('beta-parkour:legendary', 'beta-parkour', 'legendary', '/game/assets/cards/beta-v1/parkour.webp', 'air', 'beta'),
('beta-over9000:legendary', 'beta-over9000', 'legendary', '/game/assets/cards/beta-v1/over9000.webp', 'storm', 'beta'),
('beta-cinema:mythic', 'beta-cinema', 'mythic', '/game/assets/cards/beta-v1/cinema.webp', 'fire', 'beta'),
('beta-hamster:mythic', 'beta-hamster', 'mythic', '/game/assets/cards/beta-v1/hamster.webp', 'water', 'beta'),
('beta-tpose:mythic', 'beta-tpose', 'mythic', '/game/assets/cards/beta-v1/tpose.webp', 'earth', 'beta'),
('beta-continued:mythic', 'beta-continued', 'mythic', '/game/assets/cards/beta-v1/continued.webp', 'air', 'beta'),
('beta-hackerman:mythic', 'beta-hackerman', 'mythic', '/game/assets/cards/beta-v1/hackerman.webp', 'storm', 'beta'),
('beta-spicy:mythic', 'beta-spicy', 'mythic', '/game/assets/cards/beta-v1/spicy.webp', 'fire', 'beta'),
('beta-headout:mythic', 'beta-headout', 'mythic', '/game/assets/cards/beta-v1/headout.webp', 'water', 'beta'),
('beta-highground:mythic', 'beta-highground', 'mythic', '/game/assets/cards/beta-v1/highground.webp', 'earth', 'beta'),
('beta-parkour:mythic', 'beta-parkour', 'mythic', '/game/assets/cards/beta-v1/parkour.webp', 'air', 'beta'),
('beta-over9000:mythic', 'beta-over9000', 'mythic', '/game/assets/cards/beta-v1/over9000.webp', 'storm', 'beta')
on conflict(id) do nothing;

do $$
begin
 if (select count(*) from public.dv_card_definitions where set_id='beta')<>10
    or (select count(*) from public.dv_card_variants where edition='beta')<>50
    or (select count(*) from public.dv_card_definitions where set_id='alpha')<>120 then
  raise exception 'Unexpected edition catalog totals';
 end if;
end;$$;

alter table public.dv_booster_purchases36 drop constraint if exists dv_booster_purchases36_product_id_check;
alter table public.dv_booster_purchases36 add constraint dv_booster_purchases36_product_id_check
 check(product_id='alpha' or (product_id='beta' and currency='pixels' and cost=100));

create or replace function public.dv_buy_beta_booster(p_request uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare
 u uuid:=auth.uid();
 saved public.dv_booster_purchases36%rowtype;
 result uuid;
 funds bigint;
 pack text[]:='{}';
 fresh text[]:='{}';
 pack_edition text;
 category text;
 finish text;
 chosen text;
 acquired bigint;
 roll integer;
 i integer;
begin
 if u is null or p_request is null then raise exception 'Invalid booster purchase' using errcode='22023';end if;
 perform 1 from public.dv_profiles where user_id=u for update;
 if not found then raise exception 'Initialize account first';end if;
 select * into saved from public.dv_booster_purchases36 where user_id=u and request_id=p_request;
 if found then
  if saved.product_id<>'beta' then raise exception 'Purchase request already used for another product';end if;
  return saved.id;
 end if;
 select earned into funds from public.dv_wallets where user_id=u for update;
 if funds is null or funds<100 then raise exception 'Not enough Pixels';end if;
 for i in 1..5 loop
  pack_edition:=case when i=1 then 'beta' else 'alpha' end;
  category:=case when pack_edition='alpha' then 'regular' when random()<0.25 then 'prime' else 'iconic' end;
  roll:=floor(random()*10000)::integer;
  if i=5 then
   finish:=case when roll<9300 then 'rare' when roll<9900 then 'epic' when roll<9990 then 'legendary' else 'mythic' end;
  else
   finish:=case when roll<7700 then 'common' when roll<9700 then 'rare' when roll<9950 then 'epic' when roll<9995 then 'legendary' else 'mythic' end;
  end if;
  select v.id,coalesce(a.quantity,0) into chosen,acquired
  from public.dv_card_variants v
  join public.dv_card_definitions d on d.id=v.definition_id
  left join public.dv_card_acquired36 a on a.user_id=u and a.variant_id=v.id
  where v.edition=pack_edition and v.rarity=finish and d.card_class=category
  order by coalesce(a.quantity,0)>0, v.id=any(pack), random()
  limit 1;
  if chosen is null then raise exception 'Booster catalog unavailable';end if;
  if coalesce((select quantity from public.dv_inventory where user_id=u and variant_id=chosen),0)>=100000 then
   raise exception 'Collection limit reached';
  end if;
  if acquired=0 then fresh:=array_append(fresh,chosen);end if;
  insert into public.dv_inventory(user_id,variant_id,quantity) values(u,chosen,1)
  on conflict(user_id,variant_id) do update set quantity=public.dv_inventory.quantity+1;
  pack:=array_append(pack,chosen);
 end loop;
 select array_agg(x.card order by random()) into pack from unnest(pack) as x(card);
 update public.dv_wallets set earned=earned-100 where user_id=u;
 insert into public.dv_booster_purchases36(user_id,request_id,product_id,currency,cost,cards,new_variants)
 values(u,p_request,'beta','pixels',100,pack,fresh) returning id into result;
 insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values(u,'beta-booster:'||u||':'||p_request,'earned',-100);
 return result;
end;$$;
revoke all on function public.dv_buy_beta_booster(uuid) from public,anon,service_role;
grant execute on function public.dv_buy_beta_booster(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
