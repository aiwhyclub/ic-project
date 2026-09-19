begin;

create extension if not exists pgtap with schema extensions;

select plan(20);

select has_table('public', 'places', 'places table exists');
select has_table('public', 'place_media', 'place_media table exists');
select has_table('public', 'curations', 'curations table exists');
select has_table('public', 'curation_stops', 'curation_stops table exists');
select has_table('public', 'plan_b_rules', 'plan_b_rules table exists');

select is(
  (select relrowsecurity from pg_class where oid = 'public.places'::regclass),
  true,
  'places has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.place_media'::regclass),
  true,
  'place_media has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.curations'::regclass),
  true,
  'curations has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.curation_stops'::regclass),
  true,
  'curation_stops has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.plan_b_rules'::regclass),
  true,
  'plan_b_rules has RLS enabled'
);

insert into public.places (
  id,
  name,
  category,
  latitude,
  longitude,
  address,
  default_dwell_minutes,
  source_url,
  verified_at
) values (
  '10000000-0000-4000-8000-000000000001',
  'RLS 연습 장소',
  '공원',
  37.0000000,
  127.0000000,
  '경기도 이천시 테스트로 1',
  60,
  'https://example.com/places/rls-practice',
  '2026-09-19'
);

insert into public.place_media (
  id,
  place_id,
  asset_url,
  alt_text,
  license_source,
  display_order
) values (
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'https://example.com/assets/rls-practice.jpg',
  'RLS 연습 장소 전경',
  '테스트 전용 자료',
  1
);

insert into public.curations (
  id,
  title,
  audience_type,
  transport_mode,
  duration_minutes,
  interest_tags,
  recommendation_reason,
  is_fallback,
  published_at
) values
  (
    '30000000-0000-4000-8000-000000000001',
    '공개 RLS 연습 코스',
    '가족',
    'car',
    180,
    array['공원'],
    '공개 데이터 권한을 검증합니다.',
    false,
    '2026-09-19T00:00:00Z'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '비공개 RLS 연습 코스',
    '가족',
    'car',
    180,
    array['공원'],
    '공개 전 데이터는 노출하지 않습니다.',
    false,
    null
  );

insert into public.curation_stops (
  curation_id,
  place_id,
  position,
  dwell_minutes,
  stop_reason
) values
  (
    '30000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    1,
    60,
    '공개 코스의 장소입니다.'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    1,
    60,
    '비공개 코스의 장소입니다.'
  );

insert into public.plan_b_rules (
  id,
  blocked_reason,
  required_tags,
  excluded_tags,
  priority
) values (
  '40000000-0000-4000-8000-000000000001',
  'rain',
  array['indoor'],
  array['outdoor'],
  10
);

set local role anon;

select results_eq(
  $$select name from public.places where id = '10000000-0000-4000-8000-000000000001'$$,
  $$values ('RLS 연습 장소'::text)$$,
  'anon can read places'
);
select results_eq(
  $$select alt_text from public.place_media where id = '20000000-0000-4000-8000-000000000001'$$,
  $$values ('RLS 연습 장소 전경'::text)$$,
  'anon can read place media'
);
select results_eq(
  $$select title from public.curations where id in ('30000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002') order by title$$,
  $$values ('공개 RLS 연습 코스'::text)$$,
  'anon can read only published curations'
);
select results_eq(
  $$select position from public.curation_stops where curation_id in ('30000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002')$$,
  $$values (1)$$,
  'anon can read stops only for published curations'
);
select throws_ok(
  $$select count(*) from public.plan_b_rules$$,
  '42501',
  null,
  'anon cannot read server-only plan B rules'
);
select throws_ok(
  $$insert into public.places (name, category, latitude, longitude, address, default_dwell_minutes, source_url, verified_at) values ('차단', '공원', 37, 127, '차단', 30, 'https://example.com', '2026-09-19')$$,
  '42501',
  null,
  'anon cannot insert places'
);
select throws_ok(
  $$update public.places set name = '변조' where id = '10000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'anon cannot update places'
);
select throws_ok(
  $$delete from public.curations where id = '30000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'anon cannot delete curations'
);

reset role;
set local role authenticated;

select results_eq(
  $$select title from public.curations where id in ('30000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002') order by title$$,
  $$values ('공개 RLS 연습 코스'::text)$$,
  'authenticated users can read only published curations'
);
select throws_ok(
  $$update public.curations set title = '변조' where id = '30000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'authenticated users cannot update curations'
);

reset role;

select * from finish();
rollback;
