-- Expand the public catalog only. No inventory, premium items or balances are granted.
begin;
create or replace function public.dv_initialize_account() returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); fresh uuid; starter text[];
begin
 if u is null then raise exception 'Authentication required' using errcode='28000';end if;
 insert into public.dv_profiles(user_id) values(u) on conflict do nothing returning user_id into fresh;
 -- Only the first transaction grants the starter set. Repeated loads cannot farm cards.
 if fresh is not null then
  insert into public.dv_inventory(user_id,variant_id,quantity) select u,id,6 from public.dv_card_variants where rarity='common' and definition_id in ('pepe','doge','roll-safe');
  insert into public.dv_wallets(user_id) values(u);
  select array_agg(v.id order by v.id,g.n) into starter from public.dv_card_variants v cross join generate_series(1,5) g(n) where v.rarity='common' and v.definition_id in ('pepe','doge','roll-safe');
  insert into public.dv_decks(user_id,name,cards,active) values(u,'My first deck',starter,true);
 end if;
end;$$;

insert into public.dv_card_definitions(id,rule_id,name,element,edge_values) values
('harold','harold','Hide the Pain Harold','stone',ARRAY[5,4,4,5,3,3]),
('disaster-girl','disaster-girl','Disaster Girl','fire',ARRAY[7,3,3,4,3,4]),
('distracted','distracted','Distracted Boyfriend','storm',ARRAY[3,5,4,3,4,4]),
('side-eye','side-eye','Side Eye Chloe','stone',ARRAY[6,4,2,5,4,3]),
('success-kid','success-kid','Success Kid','fire',ARRAY[6,5,4,2,3,4]),
('grumpy-cat','grumpy-cat','Grumpy Cat','stone',ARRAY[3,4,5,5,4,3]),
('aliens-guy','aliens-guy','Ancient Aliens Guy','storm',ARRAY[3,5,4,3,6,3]),
('smudge','smudge','Smudge the Cat','fire',ARRAY[3,3,6,2,4,4]),
('confused','confused','Confused Nick Young','storm',ARRAY[5,3,4,4,5,3]),
('bad-luck-brian','bad-luck-brian','Bad Luck Brian','storm',ARRAY[4,4,4,4,4,4])
on conflict(id) do update set rule_id=excluded.rule_id,name=excluded.name,element=excluded.element,edge_values=excluded.edge_values;
insert into public.dv_card_variants(id,definition_id,rarity,image) values
('harold:common','harold','common','/game/assets/cards/memes-v27/harold-common.webp'),
('harold:rare','harold','rare','/game/assets/cards/memes-v27/harold-rare.webp'),
('harold:epic','harold','epic','/game/assets/cards/memes-v27/harold-epic.webp'),
('harold:legendary','harold','legendary','/game/assets/cards/memes-v27/harold-legendary.webp'),
('harold:mythic','harold','mythic','/game/assets/cards/memes-v27/harold-mythic.webp'),
('disaster-girl:common','disaster-girl','common','/game/assets/cards/memes-v27/disaster-girl-common.webp'),
('disaster-girl:rare','disaster-girl','rare','/game/assets/cards/memes-v27/disaster-girl-rare.webp'),
('disaster-girl:epic','disaster-girl','epic','/game/assets/cards/memes-v27/disaster-girl-epic.webp'),
('disaster-girl:legendary','disaster-girl','legendary','/game/assets/cards/memes-v27/disaster-girl-legendary.webp'),
('disaster-girl:mythic','disaster-girl','mythic','/game/assets/cards/memes-v27/disaster-girl-mythic.webp'),
('distracted:common','distracted','common','/game/assets/cards/memes-v27/distracted-common.webp'),
('distracted:rare','distracted','rare','/game/assets/cards/memes-v27/distracted-rare.webp'),
('distracted:epic','distracted','epic','/game/assets/cards/memes-v27/distracted-epic.webp'),
('distracted:legendary','distracted','legendary','/game/assets/cards/memes-v27/distracted-legendary.webp'),
('distracted:mythic','distracted','mythic','/game/assets/cards/memes-v27/distracted-mythic.webp'),
('side-eye:common','side-eye','common','/game/assets/cards/memes-v27/side-eye-common.webp'),
('side-eye:rare','side-eye','rare','/game/assets/cards/memes-v27/side-eye-rare.webp'),
('side-eye:epic','side-eye','epic','/game/assets/cards/memes-v27/side-eye-epic.webp'),
('side-eye:legendary','side-eye','legendary','/game/assets/cards/memes-v27/side-eye-legendary.webp'),
('side-eye:mythic','side-eye','mythic','/game/assets/cards/memes-v27/side-eye-mythic.webp'),
('success-kid:common','success-kid','common','/game/assets/cards/memes-v27/success-kid-common.webp'),
('success-kid:rare','success-kid','rare','/game/assets/cards/memes-v27/success-kid-rare.webp'),
('success-kid:epic','success-kid','epic','/game/assets/cards/memes-v27/success-kid-epic.webp'),
('success-kid:legendary','success-kid','legendary','/game/assets/cards/memes-v27/success-kid-legendary.webp'),
('success-kid:mythic','success-kid','mythic','/game/assets/cards/memes-v27/success-kid-mythic.webp'),
('grumpy-cat:common','grumpy-cat','common','/game/assets/cards/memes-v27/grumpy-cat-common.webp'),
('grumpy-cat:rare','grumpy-cat','rare','/game/assets/cards/memes-v27/grumpy-cat-rare.webp'),
('grumpy-cat:epic','grumpy-cat','epic','/game/assets/cards/memes-v27/grumpy-cat-epic.webp'),
('grumpy-cat:legendary','grumpy-cat','legendary','/game/assets/cards/memes-v27/grumpy-cat-legendary.webp'),
('grumpy-cat:mythic','grumpy-cat','mythic','/game/assets/cards/memes-v27/grumpy-cat-mythic.webp'),
('aliens-guy:common','aliens-guy','common','/game/assets/cards/memes-v27/aliens-guy-common.webp'),
('aliens-guy:rare','aliens-guy','rare','/game/assets/cards/memes-v27/aliens-guy-rare.webp'),
('aliens-guy:epic','aliens-guy','epic','/game/assets/cards/memes-v27/aliens-guy-epic.webp'),
('aliens-guy:legendary','aliens-guy','legendary','/game/assets/cards/memes-v27/aliens-guy-legendary.webp'),
('aliens-guy:mythic','aliens-guy','mythic','/game/assets/cards/memes-v27/aliens-guy-mythic.webp'),
('smudge:common','smudge','common','/game/assets/cards/memes-v27/smudge-common.webp'),
('smudge:rare','smudge','rare','/game/assets/cards/memes-v27/smudge-rare.webp'),
('smudge:epic','smudge','epic','/game/assets/cards/memes-v27/smudge-epic.webp'),
('smudge:legendary','smudge','legendary','/game/assets/cards/memes-v27/smudge-legendary.webp'),
('smudge:mythic','smudge','mythic','/game/assets/cards/memes-v27/smudge-mythic.webp'),
('confused:common','confused','common','/game/assets/cards/memes-v27/confused-common.webp'),
('confused:rare','confused','rare','/game/assets/cards/memes-v27/confused-rare.webp'),
('confused:epic','confused','epic','/game/assets/cards/memes-v27/confused-epic.webp'),
('confused:legendary','confused','legendary','/game/assets/cards/memes-v27/confused-legendary.webp'),
('confused:mythic','confused','mythic','/game/assets/cards/memes-v27/confused-mythic.webp'),
('bad-luck-brian:common','bad-luck-brian','common','/game/assets/cards/memes-v27/bad-luck-brian-common.webp'),
('bad-luck-brian:rare','bad-luck-brian','rare','/game/assets/cards/memes-v27/bad-luck-brian-rare.webp'),
('bad-luck-brian:epic','bad-luck-brian','epic','/game/assets/cards/memes-v27/bad-luck-brian-epic.webp'),
('bad-luck-brian:legendary','bad-luck-brian','legendary','/game/assets/cards/memes-v27/bad-luck-brian-legendary.webp'),
('bad-luck-brian:mythic','bad-luck-brian','mythic','/game/assets/cards/memes-v27/bad-luck-brian-mythic.webp')
on conflict(id) do update set image=excluded.image;
commit;
