-- Complete Alpha: 85 Regular, 15 Prime, 20 Iconic. No inventory, wallet or saved-deck rewrites.
begin;
insert into public.dv_card_definitions(id,rule_id,name,element,edge_values,is_prime,set_id,set_number,card_class) values
('rage-guy','iconic-rage-guy','Rage Guy – FUUUU','fire',array[8,7,4,3,3,3],false,'alpha',101,'iconic'),
('take-my-money','iconic-take-my-money','Shut Up and Take My Money','fire',array[3,6,6,5,5,3],false,'alpha',102,'iconic'),
('why-are-you-running','iconic-why-are-you-running','Why Are You Running?','fire',array[4,3,3,8,7,3],false,'alpha',103,'iconic'),
('no-god-please-no','iconic-no-god-please-no','No God, Please No!','fire',array[6,2,2,7,7,4],false,'alpha',104,'iconic'),
('kekw','iconic-kekw','KEKW – El Risitas','water',array[3,8,7,3,3,4],false,'alpha',105,'iconic'),
('forever-alone','iconic-forever-alone','Forever Alone','water',array[5,3,3,3,6,8],false,'alpha',106,'iconic'),
('first-world-problems','iconic-first-world-problems','First World Problems','water',array[7,4,2,2,6,7],false,'alpha',107,'iconic'),
('awkward-penguin','iconic-awkward-penguin','Socially Awkward Penguin','water',array[3,5,5,6,6,3],false,'alpha',108,'iconic'),
('overly-manly-man','iconic-overly-manly-man','Overly Manly Man','earth',array[7,6,4,2,2,7],false,'alpha',109,'iconic'),
('good-guy-greg','iconic-good-guy-greg','Good Guy Greg','earth',array[4,5,6,6,4,3],false,'alpha',110,'iconic'),
('scumbag-steve','iconic-scumbag-steve','Scumbag Steve','earth',array[3,3,8,7,4,3],false,'alpha',111,'iconic'),
('change-my-mind','iconic-change-my-mind','Change My Mind','earth',array[2,7,7,6,4,2],false,'alpha',112,'iconic'),
('confused-travolta','iconic-confused-travolta','Confused Travolta','air',array[7,3,3,3,4,8],false,'alpha',113,'iconic'),
('epic-sax-guy','iconic-epic-sax-guy','Epic Sax Guy','air',array[3,2,7,7,6,3],false,'alpha',114,'iconic'),
('is-this-a-pigeon','iconic-is-this-a-pigeon','Is This a Pigeon?','air',array[5,6,6,4,3,4],false,'alpha',115,'iconic'),
('double-rainbow','iconic-double-rainbow','Double Rainbow','air',array[8,3,3,4,7,3],false,'alpha',116,'iconic'),
('philosoraptor','iconic-philosoraptor','Philosoraptor','storm',array[3,3,4,7,8,3],false,'alpha',117,'iconic'),
('two-buttons','iconic-two-buttons','Two Buttons','storm',array[6,7,2,2,4,7],false,'alpha',118,'iconic'),
('always-has-been','iconic-always-has-been','Always Has Been','storm',array[4,3,4,6,6,5],false,'alpha',119,'iconic'),
('yo-dawg','iconic-yo-dawg','Yo Dawg','storm',array[7,3,3,3,8,4],false,'alpha',120,'iconic')
on conflict(id) do nothing;
insert into public.dv_card_variants(id,definition_id,rarity,image,element,edition) values
('rage-guy:common','rage-guy','common','/game/assets/cards/iconics-v136/rage-guy-common.webp','fire','alpha'),
('rage-guy:rare','rage-guy','rare','/game/assets/cards/iconics-v136/rage-guy-rare.webp','fire','alpha'),
('rage-guy:epic','rage-guy','epic','/game/assets/cards/iconics-v136/rage-guy-epic.webp','fire','alpha'),
('rage-guy:legendary','rage-guy','legendary','/game/assets/cards/iconics-v136/rage-guy-legendary.webp','fire','alpha'),
('rage-guy:mythic','rage-guy','mythic','/game/assets/cards/iconics-v136/rage-guy-mythic.webp','fire','alpha'),
('take-my-money:common','take-my-money','common','/game/assets/cards/iconics-v136/take-my-money-common.webp','fire','alpha'),
('take-my-money:rare','take-my-money','rare','/game/assets/cards/iconics-v136/take-my-money-rare.webp','fire','alpha'),
('take-my-money:epic','take-my-money','epic','/game/assets/cards/iconics-v136/take-my-money-epic.webp','fire','alpha'),
('take-my-money:legendary','take-my-money','legendary','/game/assets/cards/iconics-v136/take-my-money-legendary.webp','fire','alpha'),
('take-my-money:mythic','take-my-money','mythic','/game/assets/cards/iconics-v136/take-my-money-mythic.webp','fire','alpha'),
('why-are-you-running:common','why-are-you-running','common','/game/assets/cards/iconics-v136/why-are-you-running-common.webp','fire','alpha'),
('why-are-you-running:rare','why-are-you-running','rare','/game/assets/cards/iconics-v136/why-are-you-running-rare.webp','fire','alpha'),
('why-are-you-running:epic','why-are-you-running','epic','/game/assets/cards/iconics-v136/why-are-you-running-epic.webp','fire','alpha'),
('why-are-you-running:legendary','why-are-you-running','legendary','/game/assets/cards/iconics-v136/why-are-you-running-legendary.webp','fire','alpha'),
('why-are-you-running:mythic','why-are-you-running','mythic','/game/assets/cards/iconics-v136/why-are-you-running-mythic.webp','fire','alpha'),
('no-god-please-no:common','no-god-please-no','common','/game/assets/cards/iconics-v136/no-god-please-no-common.webp','fire','alpha'),
('no-god-please-no:rare','no-god-please-no','rare','/game/assets/cards/iconics-v136/no-god-please-no-rare.webp','fire','alpha'),
('no-god-please-no:epic','no-god-please-no','epic','/game/assets/cards/iconics-v136/no-god-please-no-epic.webp','fire','alpha'),
('no-god-please-no:legendary','no-god-please-no','legendary','/game/assets/cards/iconics-v136/no-god-please-no-legendary.webp','fire','alpha'),
('no-god-please-no:mythic','no-god-please-no','mythic','/game/assets/cards/iconics-v136/no-god-please-no-mythic.webp','fire','alpha'),
('kekw:common','kekw','common','/game/assets/cards/iconics-v136/kekw-common.webp','water','alpha'),
('kekw:rare','kekw','rare','/game/assets/cards/iconics-v136/kekw-rare.webp','water','alpha'),
('kekw:epic','kekw','epic','/game/assets/cards/iconics-v136/kekw-epic.webp','water','alpha'),
('kekw:legendary','kekw','legendary','/game/assets/cards/iconics-v136/kekw-legendary.webp','water','alpha'),
('kekw:mythic','kekw','mythic','/game/assets/cards/iconics-v136/kekw-mythic.webp','water','alpha'),
('forever-alone:common','forever-alone','common','/game/assets/cards/iconics-v136/forever-alone-common.webp','water','alpha'),
('forever-alone:rare','forever-alone','rare','/game/assets/cards/iconics-v136/forever-alone-rare.webp','water','alpha'),
('forever-alone:epic','forever-alone','epic','/game/assets/cards/iconics-v136/forever-alone-epic.webp','water','alpha'),
('forever-alone:legendary','forever-alone','legendary','/game/assets/cards/iconics-v136/forever-alone-legendary.webp','water','alpha'),
('forever-alone:mythic','forever-alone','mythic','/game/assets/cards/iconics-v136/forever-alone-mythic.webp','water','alpha'),
('first-world-problems:common','first-world-problems','common','/game/assets/cards/iconics-v136/first-world-problems-common.webp','water','alpha'),
('first-world-problems:rare','first-world-problems','rare','/game/assets/cards/iconics-v136/first-world-problems-rare.webp','water','alpha'),
('first-world-problems:epic','first-world-problems','epic','/game/assets/cards/iconics-v136/first-world-problems-epic.webp','water','alpha'),
('first-world-problems:legendary','first-world-problems','legendary','/game/assets/cards/iconics-v136/first-world-problems-legendary.webp','water','alpha'),
('first-world-problems:mythic','first-world-problems','mythic','/game/assets/cards/iconics-v136/first-world-problems-mythic.webp','water','alpha'),
('awkward-penguin:common','awkward-penguin','common','/game/assets/cards/iconics-v136/awkward-penguin-common.webp','water','alpha'),
('awkward-penguin:rare','awkward-penguin','rare','/game/assets/cards/iconics-v136/awkward-penguin-rare.webp','water','alpha'),
('awkward-penguin:epic','awkward-penguin','epic','/game/assets/cards/iconics-v136/awkward-penguin-epic.webp','water','alpha'),
('awkward-penguin:legendary','awkward-penguin','legendary','/game/assets/cards/iconics-v136/awkward-penguin-legendary.webp','water','alpha'),
('awkward-penguin:mythic','awkward-penguin','mythic','/game/assets/cards/iconics-v136/awkward-penguin-mythic.webp','water','alpha'),
('overly-manly-man:common','overly-manly-man','common','/game/assets/cards/iconics-v136/overly-manly-man-common.webp','earth','alpha'),
('overly-manly-man:rare','overly-manly-man','rare','/game/assets/cards/iconics-v136/overly-manly-man-rare.webp','earth','alpha'),
('overly-manly-man:epic','overly-manly-man','epic','/game/assets/cards/iconics-v136/overly-manly-man-epic.webp','earth','alpha'),
('overly-manly-man:legendary','overly-manly-man','legendary','/game/assets/cards/iconics-v136/overly-manly-man-legendary.webp','earth','alpha'),
('overly-manly-man:mythic','overly-manly-man','mythic','/game/assets/cards/iconics-v136/overly-manly-man-mythic.webp','earth','alpha'),
('good-guy-greg:common','good-guy-greg','common','/game/assets/cards/iconics-v136/good-guy-greg-common.webp','earth','alpha'),
('good-guy-greg:rare','good-guy-greg','rare','/game/assets/cards/iconics-v136/good-guy-greg-rare.webp','earth','alpha'),
('good-guy-greg:epic','good-guy-greg','epic','/game/assets/cards/iconics-v136/good-guy-greg-epic.webp','earth','alpha'),
('good-guy-greg:legendary','good-guy-greg','legendary','/game/assets/cards/iconics-v136/good-guy-greg-legendary.webp','earth','alpha'),
('good-guy-greg:mythic','good-guy-greg','mythic','/game/assets/cards/iconics-v136/good-guy-greg-mythic.webp','earth','alpha'),
('scumbag-steve:common','scumbag-steve','common','/game/assets/cards/iconics-v136/scumbag-steve-common.webp','earth','alpha'),
('scumbag-steve:rare','scumbag-steve','rare','/game/assets/cards/iconics-v136/scumbag-steve-rare.webp','earth','alpha'),
('scumbag-steve:epic','scumbag-steve','epic','/game/assets/cards/iconics-v136/scumbag-steve-epic.webp','earth','alpha'),
('scumbag-steve:legendary','scumbag-steve','legendary','/game/assets/cards/iconics-v136/scumbag-steve-legendary.webp','earth','alpha'),
('scumbag-steve:mythic','scumbag-steve','mythic','/game/assets/cards/iconics-v136/scumbag-steve-mythic.webp','earth','alpha'),
('change-my-mind:common','change-my-mind','common','/game/assets/cards/iconics-v136/change-my-mind-common.webp','earth','alpha'),
('change-my-mind:rare','change-my-mind','rare','/game/assets/cards/iconics-v136/change-my-mind-rare.webp','earth','alpha'),
('change-my-mind:epic','change-my-mind','epic','/game/assets/cards/iconics-v136/change-my-mind-epic.webp','earth','alpha'),
('change-my-mind:legendary','change-my-mind','legendary','/game/assets/cards/iconics-v136/change-my-mind-legendary.webp','earth','alpha'),
('change-my-mind:mythic','change-my-mind','mythic','/game/assets/cards/iconics-v136/change-my-mind-mythic.webp','earth','alpha'),
('confused-travolta:common','confused-travolta','common','/game/assets/cards/iconics-v136/confused-travolta-common.webp','air','alpha'),
('confused-travolta:rare','confused-travolta','rare','/game/assets/cards/iconics-v136/confused-travolta-rare.webp','air','alpha'),
('confused-travolta:epic','confused-travolta','epic','/game/assets/cards/iconics-v136/confused-travolta-epic.webp','air','alpha'),
('confused-travolta:legendary','confused-travolta','legendary','/game/assets/cards/iconics-v136/confused-travolta-legendary.webp','air','alpha'),
('confused-travolta:mythic','confused-travolta','mythic','/game/assets/cards/iconics-v136/confused-travolta-mythic.webp','air','alpha'),
('epic-sax-guy:common','epic-sax-guy','common','/game/assets/cards/iconics-v136/epic-sax-guy-common.webp','air','alpha'),
('epic-sax-guy:rare','epic-sax-guy','rare','/game/assets/cards/iconics-v136/epic-sax-guy-rare.webp','air','alpha'),
('epic-sax-guy:epic','epic-sax-guy','epic','/game/assets/cards/iconics-v136/epic-sax-guy-epic.webp','air','alpha'),
('epic-sax-guy:legendary','epic-sax-guy','legendary','/game/assets/cards/iconics-v136/epic-sax-guy-legendary.webp','air','alpha'),
('epic-sax-guy:mythic','epic-sax-guy','mythic','/game/assets/cards/iconics-v136/epic-sax-guy-mythic.webp','air','alpha'),
('is-this-a-pigeon:common','is-this-a-pigeon','common','/game/assets/cards/iconics-v136/is-this-a-pigeon-common.webp','air','alpha'),
('is-this-a-pigeon:rare','is-this-a-pigeon','rare','/game/assets/cards/iconics-v136/is-this-a-pigeon-rare.webp','air','alpha'),
('is-this-a-pigeon:epic','is-this-a-pigeon','epic','/game/assets/cards/iconics-v136/is-this-a-pigeon-epic.webp','air','alpha'),
('is-this-a-pigeon:legendary','is-this-a-pigeon','legendary','/game/assets/cards/iconics-v136/is-this-a-pigeon-legendary.webp','air','alpha'),
('is-this-a-pigeon:mythic','is-this-a-pigeon','mythic','/game/assets/cards/iconics-v136/is-this-a-pigeon-mythic.webp','air','alpha'),
('double-rainbow:common','double-rainbow','common','/game/assets/cards/iconics-v136/double-rainbow-common.webp','air','alpha'),
('double-rainbow:rare','double-rainbow','rare','/game/assets/cards/iconics-v136/double-rainbow-rare.webp','air','alpha'),
('double-rainbow:epic','double-rainbow','epic','/game/assets/cards/iconics-v136/double-rainbow-epic.webp','air','alpha'),
('double-rainbow:legendary','double-rainbow','legendary','/game/assets/cards/iconics-v136/double-rainbow-legendary.webp','air','alpha'),
('double-rainbow:mythic','double-rainbow','mythic','/game/assets/cards/iconics-v136/double-rainbow-mythic.webp','air','alpha'),
('philosoraptor:common','philosoraptor','common','/game/assets/cards/iconics-v136/philosoraptor-common.webp','storm','alpha'),
('philosoraptor:rare','philosoraptor','rare','/game/assets/cards/iconics-v136/philosoraptor-rare.webp','storm','alpha'),
('philosoraptor:epic','philosoraptor','epic','/game/assets/cards/iconics-v136/philosoraptor-epic.webp','storm','alpha'),
('philosoraptor:legendary','philosoraptor','legendary','/game/assets/cards/iconics-v136/philosoraptor-legendary.webp','storm','alpha'),
('philosoraptor:mythic','philosoraptor','mythic','/game/assets/cards/iconics-v136/philosoraptor-mythic.webp','storm','alpha'),
('two-buttons:common','two-buttons','common','/game/assets/cards/iconics-v136/two-buttons-common.webp','storm','alpha'),
('two-buttons:rare','two-buttons','rare','/game/assets/cards/iconics-v136/two-buttons-rare.webp','storm','alpha'),
('two-buttons:epic','two-buttons','epic','/game/assets/cards/iconics-v136/two-buttons-epic.webp','storm','alpha'),
('two-buttons:legendary','two-buttons','legendary','/game/assets/cards/iconics-v136/two-buttons-legendary.webp','storm','alpha'),
('two-buttons:mythic','two-buttons','mythic','/game/assets/cards/iconics-v136/two-buttons-mythic.webp','storm','alpha'),
('always-has-been:common','always-has-been','common','/game/assets/cards/iconics-v136/always-has-been-common.webp','storm','alpha'),
('always-has-been:rare','always-has-been','rare','/game/assets/cards/iconics-v136/always-has-been-rare.webp','storm','alpha'),
('always-has-been:epic','always-has-been','epic','/game/assets/cards/iconics-v136/always-has-been-epic.webp','storm','alpha'),
('always-has-been:legendary','always-has-been','legendary','/game/assets/cards/iconics-v136/always-has-been-legendary.webp','storm','alpha'),
('always-has-been:mythic','always-has-been','mythic','/game/assets/cards/iconics-v136/always-has-been-mythic.webp','storm','alpha'),
('yo-dawg:common','yo-dawg','common','/game/assets/cards/iconics-v136/yo-dawg-common.webp','storm','alpha'),
('yo-dawg:rare','yo-dawg','rare','/game/assets/cards/iconics-v136/yo-dawg-rare.webp','storm','alpha'),
('yo-dawg:epic','yo-dawg','epic','/game/assets/cards/iconics-v136/yo-dawg-epic.webp','storm','alpha'),
('yo-dawg:legendary','yo-dawg','legendary','/game/assets/cards/iconics-v136/yo-dawg-legendary.webp','storm','alpha'),
('yo-dawg:mythic','yo-dawg','mythic','/game/assets/cards/iconics-v136/yo-dawg-mythic.webp','storm','alpha')
on conflict(id) do nothing;
create or replace function public.dv_validate_cards131(p_cards text[],p_set text default null) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_cards is null or cardinality(p_cards)<>15 or array_ndims(p_cards)<>1 or array_position(p_cards,null) is not null then raise exception 'Exactly 15 cards required';end if;
 if exists(select 1 from unnest(p_cards)c(id) left join public.dv_card_variants v on v.id=c.id left join public.dv_card_definitions d on d.id=v.definition_id where v.id is null or d.set_id is null or (p_set is not null and d.set_id<>p_set)) then raise exception 'Card unavailable in this format';end if;
 if exists(select 1 from unnest(p_cards)c(id) join public.dv_card_variants v on v.id=c.id group by v.definition_id having count(*)>1) then raise exception 'Maximum 1 copy per meme across all finishes';end if;
 if (select count(*) from unnest(p_cards)c(id) join public.dv_card_variants v on v.id=c.id join public.dv_card_definitions d on d.id=v.definition_id where d.is_prime)>1 then raise exception 'Maximum 1 Prime per deck';end if;
 if (select count(*) from unnest(p_cards)c(id) join public.dv_card_variants v on v.id=c.id join public.dv_card_definitions d on d.id=v.definition_id where d.card_class='iconic')>1 then raise exception 'Maximum 1 Iconic per deck';end if;
end;$$;
create or replace function public.dv_save_deck(p_id uuid,p_name text,p_cards text[]) returns uuid language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.dv_decks where id=p_id and user_id=auth.uid() and format='friendly') then raise exception 'Save this deck in the private deck builder';end if;
 perform public.dv_validate_cards131(public.dv_original_cards116(p_cards));
 return public.dv_save_deck_base131(p_id,p_name,p_cards);end;$$;
create or replace function public.dv_match_deck90(p_user uuid,p_deck uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.dv_decks%rowtype;
begin
 select * into d from public.dv_decks where id=p_deck and user_id=p_user;
 if not found then raise exception 'Choose a saved 15-card deck';end if;
 perform public.dv_validate_cards131(d.cards);
 if d.format<>'friendly' then return public.dv_match_deck_base131(p_user,p_deck);end if;
 if exists(select 1 from unnest(d.cards)c(id) join public.dv_card_variants v on v.id=c.id where v.edition='recruiter' and not exists(select 1 from public.dv_inventory i where i.user_id=p_user and i.variant_id=c.id and i.quantity>0)) then raise exception 'Recruiter artwork must be earned';end if;
 return jsonb_build_object('id',d.id,'name',d.name,'cards',to_jsonb(d.cards),'format','friendly');end;$$;
create or replace function public.dv_match_fill_ai96(p_user uuid,p_id uuid,p_deck jsonb,p_identity jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.dv_pvp90%rowtype;
begin
 -- Same queue lock as human pairing and cancellation: exactly one outcome wins.
 perform pg_advisory_xact_lock(900090);
 select * into m from public.dv_pvp90 where id=p_id and host_id=p_user for update;
 if not found then raise exception 'Duel unavailable';end if;
 if m.status<>'waiting' or m.kind<>'random' or m.created_at>now()-interval '35 seconds' then return public.dv_match_get90(p_user,p_id);end if;
 if jsonb_typeof(p_deck->'cards') is distinct from 'array' then raise exception 'Invalid AI deck';end if;
 if jsonb_array_length(p_deck->'cards')<>15 or exists(select 1 from jsonb_array_elements_text(p_deck->'cards') c(id) left join public.dv_card_variants v on v.id=c.id where v.id is null or v.edition<>'alpha') or exists(select 1 from jsonb_array_elements_text(p_deck->'cards') c(id) join public.dv_card_variants v on v.id=c.id group by v.definition_id having count(*)>1) or (select count(*) from jsonb_array_elements_text(p_deck->'cards') c(id) join public.dv_card_variants v on v.id=c.id join public.dv_card_definitions d on d.id=v.definition_id where d.is_prime)>1 then raise exception 'Invalid AI deck';end if;
 perform public.dv_validate_cards131(array(select jsonb_array_elements_text(p_deck->'cards')),'alpha');
 if jsonb_typeof(p_identity) is distinct from 'object' or p_identity->>'isAi' is distinct from 'true' or length(p_identity->>'displayName') not between 1 and 24 then raise exception 'Invalid AI identity';end if;
 -- Refresh owned copies once, then freeze both decks for this duel and reconnects.
 m.host_deck:=public.dv_match_deck90(p_user,(m.host_deck->>'id')::uuid);
 update public.dv_pvp90 set status='matched',host_deck=m.host_deck,guest_deck=p_deck,ai_opponent96=p_identity,updated_at=now() where id=p_id;
 return public.dv_match_get90(p_user,p_id);
end;$$;
revoke all on function public.dv_validate_cards131(text[],text),public.dv_save_deck(uuid,text,text[]),public.dv_match_deck90(uuid,uuid),public.dv_match_fill_ai96(uuid,uuid,jsonb,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.dv_save_deck(uuid,text,text[]) to authenticated;
grant execute on function public.dv_match_fill_ai96(uuid,uuid,jsonb,jsonb) to service_role;
commit;
