-- Cosmetic replacement only: stable IDs preserve inventory, decks and history.
begin;
update public.dv_card_definitions set name='Let Him Cook' where id='salt-bae';
update public.dv_card_variants set image='/game/assets/cards/replacements-v129/let-him-cook.webp?finish='||rarity where definition_id='salt-bae' and edition='alpha';
commit;
