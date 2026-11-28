begin;

update public.dv_cosmetic_shop set price=100 where id in ('portrait-cosmic-doge','portrait-crystal-cat','portrait-void-pepe');
update public.dv_cosmetic_shop set price=150 where id in ('sticker-wow','sticker-one-more');
update public.dv_cosmetic_shop set price=250 where id='sticker-boom';

insert into public.dv_cosmetic_shop(id,kind,price) values
 ('sticker-wow-static','sticker',100),('sticker-one-more-static','sticker',100),
 ('portrait-cosmic-doge-animated','portrait',150),('portrait-void-pepe-animated','portrait',250);

insert into public.dv_identity_catalog85(kind,id,min_level,min_wins,source) values
 ('portrait','portrait-cosmic-doge-animated',1,0,'owned'),
 ('portrait','portrait-void-pepe-animated',1,0,'owned');

commit;
