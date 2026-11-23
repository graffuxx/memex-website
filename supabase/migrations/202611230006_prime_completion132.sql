-- Prepared release only; fills Alpha slots 096–100 without granting inventory.
begin;
insert into public.dv_card_definitions(id,rule_id,name,element,edge_values,is_prime,set_id,set_number,card_class) values
('idiot-sandwich','prime-idiot-sandwich','IDIOT SANDWICH','fire',array[10,7,3,2,7,4],true,'alpha',96,'prime'),
('crying-jordan','prime-crying-jordan','CRYING JORDAN','water',array[2,6,10,4,7,4],true,'alpha',97,'prime'),
('disappointed-fan','prime-disappointed-fan','DISAPPOINTED FAN','earth',array[6,4,3,7,10,3],true,'alpha',98,'prime'),
('blinking-guy','prime-blinking-guy','BLINKING GUY','air',array[5,4,7,2,5,10],true,'alpha',99,'prime'),
('overly-attached','prime-overly-attached','OVERLY ATTACHED','storm',array[7,3,2,10,6,5],true,'alpha',100,'prime')
on conflict(id) do nothing;
insert into public.dv_card_variants(id,definition_id,rarity,image,element,edition) values
('idiot-sandwich:common','idiot-sandwich','common','/game/assets/cards/primes-v132/idiot-sandwich-common.webp','fire','alpha'),
('idiot-sandwich:rare','idiot-sandwich','rare','/game/assets/cards/primes-v132/idiot-sandwich-rare.webp','fire','alpha'),
('idiot-sandwich:epic','idiot-sandwich','epic','/game/assets/cards/primes-v132/idiot-sandwich-epic.webp','fire','alpha'),
('idiot-sandwich:legendary','idiot-sandwich','legendary','/game/assets/cards/primes-v132/idiot-sandwich-legendary.webp','fire','alpha'),
('idiot-sandwich:mythic','idiot-sandwich','mythic','/game/assets/cards/primes-v132/idiot-sandwich-mythic.webp','fire','alpha'),
('crying-jordan:common','crying-jordan','common','/game/assets/cards/primes-v132/crying-jordan-common.webp','water','alpha'),
('crying-jordan:rare','crying-jordan','rare','/game/assets/cards/primes-v132/crying-jordan-rare.webp','water','alpha'),
('crying-jordan:epic','crying-jordan','epic','/game/assets/cards/primes-v132/crying-jordan-epic.webp','water','alpha'),
('crying-jordan:legendary','crying-jordan','legendary','/game/assets/cards/primes-v132/crying-jordan-legendary.webp','water','alpha'),
('crying-jordan:mythic','crying-jordan','mythic','/game/assets/cards/primes-v132/crying-jordan-mythic.webp','water','alpha'),
('disappointed-fan:common','disappointed-fan','common','/game/assets/cards/primes-v132/disappointed-fan-common.webp','earth','alpha'),
('disappointed-fan:rare','disappointed-fan','rare','/game/assets/cards/primes-v132/disappointed-fan-rare.webp','earth','alpha'),
('disappointed-fan:epic','disappointed-fan','epic','/game/assets/cards/primes-v132/disappointed-fan-epic.webp','earth','alpha'),
('disappointed-fan:legendary','disappointed-fan','legendary','/game/assets/cards/primes-v132/disappointed-fan-legendary.webp','earth','alpha'),
('disappointed-fan:mythic','disappointed-fan','mythic','/game/assets/cards/primes-v132/disappointed-fan-mythic.webp','earth','alpha'),
('blinking-guy:common','blinking-guy','common','/game/assets/cards/primes-v132/blinking-guy-common.webp','air','alpha'),
('blinking-guy:rare','blinking-guy','rare','/game/assets/cards/primes-v132/blinking-guy-rare.webp','air','alpha'),
('blinking-guy:epic','blinking-guy','epic','/game/assets/cards/primes-v132/blinking-guy-epic.webp','air','alpha'),
('blinking-guy:legendary','blinking-guy','legendary','/game/assets/cards/primes-v132/blinking-guy-legendary.webp','air','alpha'),
('blinking-guy:mythic','blinking-guy','mythic','/game/assets/cards/primes-v132/blinking-guy-mythic.webp','air','alpha'),
('overly-attached:common','overly-attached','common','/game/assets/cards/primes-v132/overly-attached-common.webp','storm','alpha'),
('overly-attached:rare','overly-attached','rare','/game/assets/cards/primes-v132/overly-attached-rare.webp','storm','alpha'),
('overly-attached:epic','overly-attached','epic','/game/assets/cards/primes-v132/overly-attached-epic.webp','storm','alpha'),
('overly-attached:legendary','overly-attached','legendary','/game/assets/cards/primes-v132/overly-attached-legendary.webp','storm','alpha'),
('overly-attached:mythic','overly-attached','mythic','/game/assets/cards/primes-v132/overly-attached-mythic.webp','storm','alpha')
on conflict(id) do nothing;
commit;
