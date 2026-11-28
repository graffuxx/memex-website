begin;

alter table public.dv_supporter_packages
 drop constraint dv_supporter_packages_boosters_check,
 add constraint dv_supporter_packages_boosters_check check(boosters between 1 and 10),
 add column sticker_id text;
alter table public.dv_supporter_orders
 drop constraint dv_supporter_orders_boosters_check,
 add constraint dv_supporter_orders_boosters_check check(boosters between 1 and 10),
 add column sticker_id text;

insert into public.dv_identity_catalog85(kind,id,min_level,min_wins,source) values
 ('portrait','supporter-cash-cow',1,0,'owned'),
 ('title','supporter-certified-cash-cow',1,0,'owned');

insert into public.dv_supporter_packages(id,cents,boosters,portrait_id,title_id,sticker_id)
values('supporter-100',10000,10,'supporter-cash-cow','supporter-certified-cash-cow','sticker-make-it-rain');

create or replace function public.dv_prepare_supporter_order(p_user uuid,p_request uuid,p_product text,p_environment text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare item public.dv_supporter_orders%rowtype; pack public.dv_supporter_packages%rowtype;
begin
 if p_request is null or p_environment is distinct from 'sandbox' then raise exception 'Invalid test purchase';end if;
 perform 1 from public.dv_profiles where user_id=p_user for update;
 if not found then raise exception 'Initialize account first';end if;
 select * into item from public.dv_supporter_orders where user_id=p_user and request_id=p_request;
 if found then
  if item.product_id is distinct from p_product then raise exception 'Payment request already used';end if;
  return to_jsonb(item);
 end if;
 select * into pack from public.dv_supporter_packages where id=p_product;
 if not found then raise exception 'Unknown supporter package';end if;
 if (select count(*) from public.dv_supporter_orders where user_id=p_user and status='created'
     and created_at>now()-interval '15 minutes')>=5 then raise exception 'Too many pending purchases';end if;
 insert into public.dv_supporter_orders(user_id,request_id,product_id,environment,cents,boosters,portrait_id,title_id,sticker_id)
 values(p_user,p_request,pack.id,p_environment,pack.cents,pack.boosters,pack.portrait_id,pack.title_id,pack.sticker_id)
 returning * into item;
 return to_jsonb(item);
end;$$;

create or replace function public.dv_complete_supporter_order(p_user uuid,p_id uuid,p_paypal text,p_capture text,p_cents integer,p_currency text,p_environment text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare item public.dv_supporter_orders%rowtype; packs uuid[]:='{}'; replayed boolean;
begin
 -- Lock the account before the order, as in regular booster purchases.
 perform 1 from public.dv_profiles where user_id=p_user for update;
 if not found then raise exception 'Account unavailable';end if;
 select * into item from public.dv_supporter_orders where id=p_id and user_id=p_user for update;
 if not found then raise exception 'Payment unavailable';end if;
 if p_environment is distinct from 'sandbox' or item.paypal_order_id is null or item.paypal_order_id is distinct from p_paypal
    or item.cents is distinct from p_cents or item.currency is distinct from p_currency
    or p_capture is null or p_capture!~'^[A-Z0-9]{10,40}$' then raise exception 'Payment receipt mismatch';end if;
 replayed:=item.completed_at is not null;
 if replayed then
  if item.capture_id is distinct from p_capture then raise exception 'Capture already assigned';end if;
 else
  for i in 1..item.boosters loop
   packs:=array_append(packs,public.dv_allocate_alpha56(p_user,gen_random_uuid(),'supporter',0));
  end loop;
  insert into public.dv_cosmetic_ownership(user_id,kind,cosmetic_id)
  values(p_user,'portrait',item.portrait_id) on conflict do nothing;
  if item.title_id is not null then
   insert into public.dv_cosmetic_ownership(user_id,kind,cosmetic_id)
   values(p_user,'title',item.title_id) on conflict do nothing;
  end if;
  if item.sticker_id is not null then
   insert into public.dv_cosmetic_ownership(user_id,kind,cosmetic_id)
   values(p_user,'sticker',item.sticker_id) on conflict do nothing;
  end if;
  update public.dv_supporter_orders set capture_id=p_capture,status='completed',completed_at=now(),pack_ids=packs
  where id=p_id returning * into item;
 end if;
 return jsonb_build_object('id',item.id,'status',item.status,'replayed',replayed,'sandbox',true,
  'boosters',item.boosters,'packIds',item.pack_ids,'portraitId',item.portrait_id,'titleId',item.title_id,'stickerId',item.sticker_id);
end;$$;

notify pgrst,'reload schema';
commit;
