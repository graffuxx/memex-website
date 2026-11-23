-- Fixed edition slots and private-only borrowed decks. No inventory or wallet grants.
begin;
create table if not exists public.dv_card_sets131(id text primary key,name text not null,size integer not null check(size>0),limits jsonb not null,current_set boolean not null default false);
alter table public.dv_card_sets131 enable row level security;
drop policy if exists dv_sets_public131 on public.dv_card_sets131;
create policy dv_sets_public131 on public.dv_card_sets131 for select to anon,authenticated using(true);
revoke all on public.dv_card_sets131 from public,anon,authenticated;
grant select on public.dv_card_sets131 to anon,authenticated;
create unique index if not exists dv_current_set131 on public.dv_card_sets131(current_set) where current_set;
insert into public.dv_card_sets131(id,name,size,limits,current_set) values('alpha','Alpha',120,'{"regular":85,"prime":15,"iconic":20}',true) on conflict(id) do nothing;
alter table public.dv_card_definitions add column if not exists set_id text references public.dv_card_sets131(id),add column if not exists set_number integer,add column if not exists card_class text;
update public.dv_card_definitions d set set_id='alpha',set_number=v.n,card_class=v.kind from (values
('pepe',1,'regular'),
('doge',2,'regular'),
('roll-safe',3,'regular'),
('harold',4,'regular'),
('disaster-girl',5,'regular'),
('distracted',6,'regular'),
('side-eye',7,'regular'),
('success-kid',8,'regular'),
('grumpy-cat',9,'regular'),
('aliens-guy',10,'regular'),
('smudge',11,'regular'),
('confused',12,'regular'),
('bad-luck-brian',13,'regular'),
('gigachad',14,'regular'),
('this-is-fine',15,'regular'),
('trollface',16,'regular'),
('stonks',17,'regular'),
('press-f',18,'regular'),
('git-gud',19,'regular'),
('rage-quit',20,'regular'),
('lag-spike',21,'regular'),
('hodl',22,'regular'),
('diamond-hands',23,'regular'),
('to-the-moon',24,'regular'),
('rug-pull',25,'regular'),
('crying-cat',26,'regular'),
('keyboard-cat',27,'regular'),
('coffin-dance',28,'regular'),
('galaxy-brain',29,'regular'),
('npc',30,'regular'),
('leeroy-jenkins',31,'regular'),
('touch-grass',32,'regular'),
('copium',33,'regular'),
('paper-hands',34,'regular'),
('buy-the-dip',35,'regular'),
('angry-wojak',36,'regular'),
('screaming-marmot',37,'regular'),
('table-flip',38,'regular'),
('triggered',39,'regular'),
('salt-bae',40,'regular'),
('floor-is-lava',41,'regular'),
('hot-take',42,'regular'),
('headshot',43,'regular'),
('rage-hamster',44,'regular'),
('burning-toast',45,'regular'),
('capybara-chill',46,'regular'),
('sad-keanu',47,'regular'),
('crying-wojak',48,'regular'),
('tears-of-joy',49,'regular'),
('duck-float',50,'regular'),
('seal-of-approval',51,'regular'),
('sink-or-swim',52,'regular'),
('stay-hydrated',53,'regular'),
('pool-noodle',54,'regular'),
('wet-cat',55,'regular'),
('bonk',56,'regular'),
('cheems',57,'regular'),
('walter',58,'regular'),
('absolute-unit',59,'regular'),
('couch-potato',60,'regular'),
('monke',61,'regular'),
('banana-for-scale',62,'regular'),
('turtle-stack',63,'regular'),
('stone-face',64,'regular'),
('rock-solid',65,'regular'),
('nyan-cat',66,'regular'),
('dramatic-chipmunk',67,'regular'),
('spinning-seal',68,'regular'),
('longcat',69,'regular'),
('ceiling-cat',70,'regular'),
('hover-cat',71,'regular'),
('bird-is-word',72,'regular'),
('flying-spaghetti',73,'regular'),
('airhorn',74,'regular'),
('yeet',75,'regular'),
('error-404',76,'regular'),
('blue-screen',77,'regular'),
('cat-jam',78,'regular'),
('shocked-monkey',79,'regular'),
('math-lady',80,'regular'),
('surprised-rat',81,'regular'),
('plot-twist',82,'regular'),
('big-brain-time',83,'regular'),
('rickroll',84,'regular'),
('uno-reverse',85,'regular'),
('evil-ernie',86,'prime'),
('nuck-chorris',87,'prime'),
('sparta-kick',88,'prime'),
('emotional-damage',89,'prime'),
('pablo-waiting',90,'prime'),
('here-we-go-again',91,'prime'),
('one-does-not-simply',92,'prime'),
('sanic',93,'prime'),
('numa-numa',94,'prime'),
('keyboard-crusher',95,'prime')
) v(id,n,kind) where d.id=v.id;
alter table public.dv_card_definitions alter column set_id set not null,alter column set_number set not null,alter column card_class set not null;
create unique index if not exists dv_set_slot131 on public.dv_card_definitions(set_id,set_number);
alter table public.dv_card_definitions drop constraint if exists dv_card_class131;
alter table public.dv_card_definitions add constraint dv_card_class131 check(card_class in ('regular','prime','iconic') and is_prime=(card_class='prime'));
create or replace function public.dv_check_set_slot131() returns trigger language plpgsql security definer set search_path='' as $$
declare s public.dv_card_sets131%rowtype;n integer;low_slot integer;high_slot integer;
begin select * into s from public.dv_card_sets131 where id=new.set_id for update;
 if not found or new.set_number<1 or new.set_number>s.size then raise exception 'Card outside edition capacity';end if;
 low_slot:=case new.card_class when 'regular' then 0 when 'prime' then (s.limits->>'regular')::integer when 'iconic' then (s.limits->>'regular')::integer+(s.limits->>'prime')::integer else s.size end;high_slot:=low_slot+coalesce((s.limits->>new.card_class)::integer,0);if new.set_number<=low_slot or new.set_number>high_slot then raise exception 'Card category does not match edition slot';end if;
 select count(*) into n from public.dv_card_definitions where set_id=new.set_id and card_class=new.card_class and id<>new.id;
 if n>=coalesce((s.limits->>new.card_class)::integer,0) then raise exception 'Edition category is full';end if;return new;end;$$;
drop trigger if exists dv_set_slot_guard131 on public.dv_card_definitions;
create trigger dv_set_slot_guard131 before insert or update of set_id,set_number,card_class on public.dv_card_definitions for each row execute function public.dv_check_set_slot131();
revoke all on function public.dv_check_set_slot131() from public,anon,authenticated,service_role;
alter table public.dv_decks add column if not exists format text not null default 'owned' check(format in ('owned','friendly'));
create or replace function public.dv_validate_cards131(p_cards text[],p_set text default null) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_cards is null or cardinality(p_cards)<>15 or array_ndims(p_cards)<>1 or array_position(p_cards,null) is not null then raise exception 'Exactly 15 cards required';end if;
 if exists(select 1 from unnest(p_cards)c(id) left join public.dv_card_variants v on v.id=c.id left join public.dv_card_definitions d on d.id=v.definition_id where v.id is null or d.set_id is null or (p_set is not null and d.set_id<>p_set)) then raise exception 'Card unavailable in this format';end if;
 if exists(select 1 from unnest(p_cards)c(id) join public.dv_card_variants v on v.id=c.id group by v.definition_id having count(*)>1) then raise exception 'Maximum 1 copy per meme across all finishes';end if;
 if (select count(*) from unnest(p_cards)c(id) join public.dv_card_variants v on v.id=c.id join public.dv_card_definitions d on d.id=v.definition_id where d.is_prime)>1 then raise exception 'Maximum 1 Prime per deck';end if;
end;$$;
create or replace function public.dv_save_friendly_deck131(p_id uuid,p_name text,p_cards text[]) returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();chosen_cards text[];result uuid;
begin
 if u is null or not exists(select 1 from auth.users where id=u and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Verify your email before saving a private deck' using errcode='42501';end if;
 if p_name is null or char_length(trim(p_name)) not between 1 and 40 then raise exception 'Invalid deck name';end if;
 perform 1 from public.dv_profiles where user_id=u for update;if not found then raise exception 'Initialize account first';end if;
 chosen_cards:=public.dv_original_cards116(p_cards);perform public.dv_validate_cards131(chosen_cards);
 if exists(select 1 from unnest(chosen_cards)c(id) join public.dv_card_variants v on v.id=c.id where v.edition='recruiter' and not exists(select 1 from public.dv_inventory i where i.user_id=u and i.variant_id=c.id and i.quantity>0)) then raise exception 'Recruiter artwork must be earned';end if;
 if p_id is not null then
  update public.dv_decks set name=trim(p_name),cards=chosen_cards,updated_at=now() where id=p_id and user_id=u and format='friendly' returning id into result;
  if result is null then raise exception 'Private deck not found';end if;
 else
  if (select count(*) from public.dv_decks where user_id=u)>=10 then raise exception 'Deck limit reached';end if;
  insert into public.dv_decks(user_id,name,cards,active,format) values(u,trim(p_name),chosen_cards,false,'friendly') returning id into result;
 end if;return result;end;$$;
do $$begin
 if to_regprocedure('public.dv_save_deck_base131(uuid,text,text[])') is null then alter function public.dv_save_deck(uuid,text,text[]) rename to dv_save_deck_base131;end if;
 if to_regprocedure('public.dv_match_deck_base131(uuid,uuid)') is null then alter function public.dv_match_deck90(uuid,uuid) rename to dv_match_deck_base131;end if;
 if to_regprocedure('public.dv_match_join_base131(uuid,text,uuid,text)') is null then alter function public.dv_match_join90(uuid,text,uuid,text) rename to dv_match_join_base131;end if;
end;$$;
create or replace function public.dv_save_deck(p_id uuid,p_name text,p_cards text[]) returns uuid language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.dv_decks where id=p_id and user_id=auth.uid() and format='friendly') then raise exception 'Save this deck in the private deck builder';end if;
 return public.dv_save_deck_base131(p_id,p_name,p_cards);end;$$;
create or replace function public.dv_match_deck90(p_user uuid,p_deck uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.dv_decks%rowtype;
begin
 select * into d from public.dv_decks where id=p_deck and user_id=p_user;
 if not found then raise exception 'Choose a saved 15-card deck';end if;
 if d.format<>'friendly' then return public.dv_match_deck_base131(p_user,p_deck);end if;
 perform public.dv_validate_cards131(d.cards);
 if exists(select 1 from unnest(d.cards)c(id) join public.dv_card_variants v on v.id=c.id where v.edition='recruiter' and not exists(select 1 from public.dv_inventory i where i.user_id=p_user and i.variant_id=c.id and i.quantity>0)) then raise exception 'Recruiter artwork must be earned';end if;
 return jsonb_build_object('id',d.id,'name',d.name,'cards',to_jsonb(d.cards),'format','friendly');end;$$;
create or replace function public.dv_match_join90(p_user uuid,p_kind text,p_deck uuid,p_code text default null) returns uuid language plpgsql security definer set search_path='' as $$
begin
 if p_kind='random' and exists(select 1 from public.dv_decks where user_id=p_user and id=p_deck and format='friendly') then raise exception 'Private loan decks cannot enter Random or Ranked';end if;
 return public.dv_match_join_base131(p_user,p_kind,p_deck,p_code);end;$$;
revoke all on function public.dv_validate_cards131(text[],text),public.dv_save_friendly_deck131(uuid,text,text[]),public.dv_save_deck_base131(uuid,text,text[]),public.dv_match_deck_base131(uuid,uuid),public.dv_match_join_base131(uuid,text,uuid,text),public.dv_save_deck(uuid,text,text[]),public.dv_match_deck90(uuid,uuid),public.dv_match_join90(uuid,text,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.dv_save_deck(uuid,text,text[]),public.dv_save_friendly_deck131(uuid,text,text[]) to authenticated;
grant execute on function public.dv_match_join90(uuid,text,uuid,text) to service_role;
-- The final collection milestone follows the fixed edition size; prior claims stay valid.
update public.dv_quest_catalog95 set goal=120 where id='collected-95';
create or replace function public.dv_trade_card_base95(p_request uuid,p_kind text,p_variant text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();v public.dv_card_variants%rowtype;old public.dv_card_transactions30%rowtype;owned integer;reserved integer;delta integer;balance bigint;
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 if p_request is null or p_kind is null or p_kind not in ('craft','dismantle') then raise exception 'Invalid card action';end if;
 -- Same lock order as deck saving; retries and simultaneous trades cannot double-spend.
 perform 1 from public.dv_profiles where user_id=u for update;
 if not found then raise exception 'Initialize account first';end if;
 select * into old from public.dv_card_transactions30 where user_id=u and request_id=p_request;
 if found then
  if old.kind is distinct from p_kind or old.variant_id is distinct from p_variant then raise exception 'Request already used for a different action';end if;
  return jsonb_build_object('replayed',true,'variant',p_variant,'echo_delta',old.token_delta);
 end if;
 select * into v from public.dv_card_variants where id=p_variant;
 if not found then raise exception 'Unknown card';end if;
 select coalesce((select quantity from public.dv_inventory where user_id=u and variant_id=p_variant),0) into owned;
 select echoes into balance from public.dv_wallets where user_id=u for update;
 if not found then raise exception 'Wallet missing';end if;
 if p_kind='craft' then
  delta:=case v.rarity when 'common' then -100 when 'rare' then -400 when 'epic' then -1600 else null end;
  if delta is null then raise exception 'Diamond and Void are booster exclusive';end if;
  if balance+delta<0 then raise exception 'Not enough Echoes';end if;
  if owned>=100000 then raise exception 'Collection limit reached';end if;
  insert into public.dv_inventory(user_id,variant_id,quantity) values(u,p_variant,1)
   on conflict(user_id,variant_id) do update set quantity=public.dv_inventory.quantity+1;
 else
  -- A collection copy can serve several decks: reserve the maximum, never their sum.
  select coalesce(max(c.n),0)::integer into reserved from public.dv_decks d
    cross join lateral(select count(*)::integer n from unnest(d.cards) as card(id) where card.id=p_variant)c where d.user_id=u and d.format='owned';
  if v.rarity='common' and v.definition_id in ('pepe','doge','roll-safe','harold','disaster-girl','confused','side-eye','success-kid','grumpy-cat','aliens-guy','smudge','bad-luck-brian','gigachad','stonks','trollface') then reserved:=greatest(reserved,1);end if;
  reserved:=least(reserved,1);
  if owned<=reserved then raise exception 'No spare copy: starter cards and saved decks are protected';end if;
  delta:=case v.rarity when 'common' then 10 when 'rare' then 25 when 'epic' then 60 when 'legendary' then 150 when 'mythic' then 400 end;
  update public.dv_inventory set quantity=quantity-1 where user_id=u and variant_id=p_variant;
 end if;
 update public.dv_wallets set echoes=echoes+delta where user_id=u returning echoes into balance;
 insert into public.dv_card_transactions30(user_id,request_id,kind,variant_id,token_delta) values(u,p_request,p_kind,p_variant,delta);
 insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values(u,'card30:'||u||':'||p_request,'echoes',delta);
 return jsonb_build_object('replayed',false,'variant',p_variant,'echo_delta',delta,'echoes',balance);
end;$$;

commit;
