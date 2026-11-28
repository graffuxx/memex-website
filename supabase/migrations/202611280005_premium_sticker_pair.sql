begin;

insert into public.dv_cosmetic_shop(id,kind,price)
values
  ('sticker-loot-goblin','sticker',250),
  ('sticker-panic-button','sticker',250)
on conflict (id) do update set kind=excluded.kind, price=excluded.price, listed=true;

commit;
