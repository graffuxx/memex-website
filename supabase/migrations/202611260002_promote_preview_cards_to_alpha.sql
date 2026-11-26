begin;

-- Retain every original Alpha slot and all variant IDs referenced by inventory, decks and packs.
update public.dv_card_sets131
set size=130,limits='{"regular":85,"prime":20,"iconic":25}'
where id='alpha';

create or replace function public.dv_check_set_slot131()
returns trigger language plpgsql security definer set search_path='' as $$
declare
 edition public.dv_card_sets131%rowtype;
 capacity integer;
 used integer;
 first_slot integer;
 allowed boolean;
begin
 select * into edition from public.dv_card_sets131 where id=new.set_id for update;
 if not found or new.set_number<1 or new.set_number>edition.size then
  raise exception 'Card outside edition capacity';
 end if;
 capacity:=coalesce((edition.limits->>new.card_class)::integer,0);
 if edition.id='alpha' and edition.size=130 then
  allowed:=case new.card_class
   when 'regular' then new.set_number between 1 and 85
   when 'prime' then new.set_number between 86 and 100 or new.set_number between 121 and 125
   when 'iconic' then new.set_number between 101 and 120 or new.set_number between 126 and 130
   else false
  end;
 else
  first_slot:=case new.card_class
   when 'regular' then 1
   when 'prime' then 1+(edition.limits->>'regular')::integer
   when 'iconic' then 1+(edition.limits->>'regular')::integer+(edition.limits->>'prime')::integer
  end;
  allowed:=new.set_number>=first_slot and new.set_number<first_slot+capacity;
 end if;
 if not coalesce(allowed,false) then raise exception 'Card category does not match edition slot';end if;
 select count(*) into used from public.dv_card_definitions
 where set_id=new.set_id and card_class=new.card_class and id<>new.id;
 if used>=capacity then raise exception 'Edition category is full';end if;
 return new;
end;$$;

with promoted(id,slot) as (values
 ('beta-cinema',121),('beta-hamster',122),('beta-tpose',123),('beta-continued',124),('beta-hackerman',125),
 ('beta-spicy',126),('beta-headout',127),('beta-highground',128),('beta-parkour',129),('beta-over9000',130)
)
update public.dv_card_definitions d set set_id='alpha',set_number=p.slot
from promoted p where d.id=p.id and d.set_id='beta';

update public.dv_card_variants v set edition='alpha'
where v.edition='beta' and exists(select 1 from public.dv_card_definitions d where d.id=v.definition_id and d.set_id='alpha');

do $$
begin
 if (select count(*) from public.dv_card_definitions where set_id='alpha')<>130
    or (select count(*) from public.dv_card_variants where edition='alpha')<>650
    or exists(select 1 from public.dv_card_definitions where set_id='beta')
    or exists(select 1 from public.dv_card_variants where edition='beta') then
  raise exception 'Unexpected edition totals after Alpha expansion';
 end if;
end;$$;

-- Keep previous requests recoverable, including purchases from a stale tab.
create or replace function public.dv_buy_beta_booster(p_request uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare
 owner uuid:=auth.uid();
 saved public.dv_booster_purchases36%rowtype;
begin
 if owner is null or p_request is null then raise exception 'Invalid booster purchase' using errcode='22023';end if;
 perform 1 from public.dv_profiles where user_id=owner for update;
 select * into saved from public.dv_booster_purchases36 where user_id=owner and request_id=p_request;
 if found then
  if saved.product_id<>'beta' then raise exception 'Purchase request already used for another product';end if;
  return saved.id;
 end if;
 raise exception 'Beta preview sales are closed' using errcode='22023';
end;$$;

notify pgrst,'reload schema';
commit;
