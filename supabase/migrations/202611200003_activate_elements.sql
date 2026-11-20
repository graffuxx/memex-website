-- Release gate: apply only with the matching five-element game service and website.
begin;
do $$begin
 if (select count(*) from public.dv_card_definitions)<>85 or (select count(*) from public.dv_card_variants)<>2125 then raise exception 'Element catalog is incomplete';end if;
end$$;
update public.dv_card_variants set edition='alpha' where edition='alpha-preview53';
commit;
