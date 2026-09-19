begin;

create extension if not exists pgtap with schema extensions;

select plan(24);

select has_table('public', 'itineraries', 'itineraries table exists');
select has_table('public', 'itinerary_stops', 'itinerary_stops table exists');
select has_table('public', 'itinerary_drafts', 'itinerary_drafts table exists');

select is(
  (select relrowsecurity from pg_class where oid = 'public.itineraries'::regclass),
  true,
  'itineraries has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.itinerary_stops'::regclass),
  true,
  'itinerary_stops has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.itinerary_drafts'::regclass),
  true,
  'itinerary_drafts has RLS enabled'
);

select has_column('public', 'itineraries', 'user_id', 'itineraries has an auth owner');
select has_column('public', 'itinerary_stops', 'position', 'itinerary_stops stores visit order');
select has_column('public', 'itinerary_drafts', 'draft_payload', 'drafts store a payload');

select is(
  public.is_provider_neutral_itinerary_payload(
    '{"transport_mode":"car","stops":[]}'::jsonb
  ),
  true,
  'an empty provider-neutral draft is accepted'
);
select is(
  public.is_provider_neutral_itinerary_payload(
    '{"transport_mode":"car","stops":[{"place_id":"01000000-0000-4000-8000-000000000001","position":1,"dwell_minutes":60}]}'::jsonb
  ),
  true,
  'an ordered provider-neutral draft is accepted'
);
select is(
  public.is_provider_neutral_itinerary_payload(
    '{"transport_mode":"car","stops":[],"map":"raw"}'::jsonb
  ),
  false,
  'map payloads are rejected'
);
select is(
  public.is_provider_neutral_itinerary_payload(
    '{"transport_mode":"car","stops":[],"provider":"kakao"}'::jsonb
  ),
  false,
  'provider payloads are rejected'
);
select is(
  public.is_provider_neutral_itinerary_payload(
    '{"transport_mode":"car","stops":[{"place_id":"01000000-0000-4000-8000-000000000001","position":1,"dwell_minutes":60,"polyline":"raw"}]}'::jsonb
  ),
  false,
  'provider fields inside a stop are rejected'
);
select is(
  public.is_provider_neutral_itinerary_payload(
    '{"transport_mode":"car","stops":[{"place_id":"01000000-0000-4000-8000-000000000001","position":1,"dwell_minutes":60},{"place_id":"01000000-0000-4000-8000-000000000002","position":1,"dwell_minutes":60}]}'::jsonb
  ),
  false,
  'duplicate positions are rejected'
);
select is(
  public.is_provider_neutral_itinerary_payload(
    '{"transport_mode":"car","stops":[{"place_id":"01000000-0000-4000-8000-000000000001","position":1,"dwell_minutes":60},{"place_id":"01000000-0000-4000-8000-000000000001","position":2,"dwell_minutes":60}]}'::jsonb
  ),
  false,
  'duplicate places are rejected'
);

select is(
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'itineraries'),
  4::bigint,
  'itineraries has separate CRUD ownership policies'
);
select is(
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'itinerary_stops'),
  4::bigint,
  'itinerary_stops has separate CRUD ownership policies'
);
select is(
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'itinerary_drafts'),
  4::bigint,
  'itinerary_drafts has separate CRUD ownership policies'
);

select is(
  (select confdeltype from pg_constraint where conname = 'itineraries_user_id_fkey'),
  'c'::"char",
  'deleting an auth user cascades to itineraries'
);
select is(
  (select confdeltype from pg_constraint where conname = 'itinerary_stops_itinerary_id_fkey'),
  'c'::"char",
  'deleting an itinerary cascades to stops'
);
select is(
  (select confdeltype from pg_constraint where conname = 'itinerary_drafts_itinerary_id_user_id_fkey'),
  'c'::"char",
  'deleting an itinerary cascades to its draft'
);
select is(
  (select confdeltype from pg_constraint where conname = 'itinerary_stops_place_id_fkey'),
  'r'::"char",
  'places remain protected by referenced saved stops'
);
select is(
  (select confdeltype from pg_constraint where conname = 'itineraries_source_curation_id_fkey'),
  'n'::"char",
  'removing a public source curation keeps the saved itinerary'
);

select * from finish();
rollback;
