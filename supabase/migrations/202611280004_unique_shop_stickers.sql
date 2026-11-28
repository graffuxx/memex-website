begin;

-- Replace the shop offers. Purchased stickers and saved slots remain usable.
update public.dv_cosmetic_shop set listed=false
 where id in ('sticker-wow-static','sticker-one-more-static','sticker-wow','sticker-one-more','sticker-boom');

insert into public.dv_cosmetic_shop(id,kind,price) values
 ('sticker-grass-dlc','sticker',100),('sticker-404-brain','sticker',100),
 ('sticker-desk-flip','sticker',150),('sticker-bonk-goose','sticker',150),
 ('sticker-alt-f4-cat','sticker',250);

commit;
