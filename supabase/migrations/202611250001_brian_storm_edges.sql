-- Move one point to the opposite edge so Brian can use Flanking Lightning.
update public.dv_card_definitions
set edge_values = array[4, 4, 3, 4, 4, 5]
where id = 'bad-luck-brian' and rule_id = 'bad-luck-brian';
