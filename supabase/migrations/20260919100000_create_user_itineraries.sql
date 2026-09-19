alter table public.places
  add column tags text[] not null default '{}';

alter table public.plan_b_rules
  add column max_distance_meters integer,
  add column max_duration_minutes integer,
  add column recommendation_reason text not null default '이천에서 이용 가능한 대체 장소입니다.';

alter table public.plan_b_rules
  add constraint plan_b_rules_max_distance_check
    check (max_distance_meters is null or max_distance_meters > 0),
  add constraint plan_b_rules_max_duration_check
    check (max_duration_minutes is null or max_duration_minutes > 0),
  add constraint plan_b_rules_recommendation_reason_check
    check (length(trim(recommendation_reason)) > 0);

create table public.itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  travel_date date,
  companion_type text not null check (length(trim(companion_type)) > 0),
  transport_mode text not null check (transport_mode in ('walk', 'car', 'transit')),
  status text not null default 'confirmed' check (
    status in ('draft', 'confirmed', 'in_progress', 'completed', 'archived')
  ),
  source_curation_id uuid references public.curations(id) on delete set null,
  use_realtime_info boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.itinerary_stops (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references public.itineraries(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete restrict,
  position integer not null check (position > 0),
  dwell_minutes integer not null check (dwell_minutes between 1 and 1440),
  created_at timestamptz not null default now(),
  unique (itinerary_id, position),
  unique (itinerary_id, place_id)
);

create or replace function public.is_provider_neutral_itinerary_payload(payload jsonb)
returns boolean
language plpgsql
immutable
as $$
declare
  stop_payload jsonb;
  position_value integer;
  dwell_value integer;
  place_id_value uuid;
  positions integer[] := '{}';
  place_ids uuid[] := '{}';
begin
  if payload is null or jsonb_typeof(payload) <> 'object' then
    return false;
  end if;

  if not (payload ?& array['transport_mode', 'stops'])
     or exists (
       select 1
       from jsonb_object_keys(payload) as object_key
       where object_key not in ('transport_mode', 'stops')
     ) then
    return false;
  end if;

  if jsonb_typeof(payload->'transport_mode') <> 'string'
     or payload->>'transport_mode' not in ('walk', 'car', 'transit')
     or jsonb_typeof(payload->'stops') <> 'array'
     or jsonb_array_length(payload->'stops') > 50 then
    return false;
  end if;

  if payload ?| array[
    'map', 'map_image', 'map_tiles', 'screenshot', 'polyline', 'geometry',
    'route', 'route_response', 'directions', 'provider', 'provider_id',
    'provider_url', 'raw', 'raw_response', 'current_location', 'latitude',
    'longitude', 'distance_meters', 'duration_seconds'
  ] then
    return false;
  end if;

  for stop_payload in
    select value
    from jsonb_array_elements(payload->'stops') as stop_item(value)
  loop
    if jsonb_typeof(stop_payload) <> 'object'
       or not (stop_payload ?& array['place_id', 'position', 'dwell_minutes'])
       or exists (
         select 1
         from jsonb_object_keys(stop_payload) as object_key
         where object_key not in ('place_id', 'position', 'dwell_minutes')
       )
       or jsonb_typeof(stop_payload->'place_id') <> 'string'
       or jsonb_typeof(stop_payload->'position') <> 'number'
       or jsonb_typeof(stop_payload->'dwell_minutes') <> 'number'
       or stop_payload->>'place_id' !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
       or stop_payload->>'position' !~ '^[0-9]+$'
       or stop_payload->>'dwell_minutes' !~ '^[0-9]+$' then
      return false;
    end if;

    place_id_value := (stop_payload->>'place_id')::uuid;
    position_value := (stop_payload->>'position')::integer;
    dwell_value := (stop_payload->>'dwell_minutes')::integer;

    if position_value < 1
       or dwell_value not between 1 and 1440
       or position_value = any(positions)
       or place_id_value = any(place_ids) then
      return false;
    end if;

    positions := array_append(positions, position_value);
    place_ids := array_append(place_ids, place_id_value);
  end loop;

  return true;
end;
$$;

create table public.itinerary_drafts (
  itinerary_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  draft_payload jsonb not null
    check (public.is_provider_neutral_itinerary_payload(draft_payload)),
  saved_at timestamptz not null default now(),
  base_updated_at timestamptz not null default now(),
  primary key (itinerary_id),
  foreign key (itinerary_id, user_id)
    references public.itineraries(id, user_id)
    on delete cascade
);

create or replace function public.touch_itinerary_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger itineraries_touch_updated_at
before update on public.itineraries
for each row execute function public.touch_itinerary_updated_at();

create index itineraries_user_updated_at_idx
  on public.itineraries (user_id, updated_at desc);

create index itinerary_stops_itinerary_position_idx
  on public.itinerary_stops (itinerary_id, position);

create index itinerary_drafts_user_saved_at_idx
  on public.itinerary_drafts (user_id, saved_at desc);

alter table public.itineraries enable row level security;
alter table public.itinerary_stops enable row level security;
alter table public.itinerary_drafts enable row level security;

revoke all on table public.itineraries from anon, authenticated;
revoke all on table public.itinerary_stops from anon, authenticated;
revoke all on table public.itinerary_drafts from anon, authenticated;

grant select, insert, update, delete on table public.itineraries to authenticated;
grant select, insert, update, delete on table public.itinerary_stops to authenticated;
grant select, insert, update, delete on table public.itinerary_drafts to authenticated;
grant all on table public.itineraries to service_role;
grant all on table public.itinerary_stops to service_role;
grant all on table public.itinerary_drafts to service_role;

create policy "Users can read their itineraries"
on public.itineraries
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their itineraries"
on public.itineraries
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their itineraries"
on public.itineraries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their itineraries"
on public.itineraries
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can read stops from their itineraries"
on public.itinerary_stops
for select
to authenticated
using (
  exists (
    select 1
    from public.itineraries
    where itineraries.id = itinerary_stops.itinerary_id
      and itineraries.user_id = auth.uid()
  )
);

create policy "Users can create stops in their itineraries"
on public.itinerary_stops
for insert
to authenticated
with check (
  exists (
    select 1
    from public.itineraries
    where itineraries.id = itinerary_stops.itinerary_id
      and itineraries.user_id = auth.uid()
  )
);

create policy "Users can update stops in their itineraries"
on public.itinerary_stops
for update
to authenticated
using (
  exists (
    select 1
    from public.itineraries
    where itineraries.id = itinerary_stops.itinerary_id
      and itineraries.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.itineraries
    where itineraries.id = itinerary_stops.itinerary_id
      and itineraries.user_id = auth.uid()
  )
);

create policy "Users can delete stops from their itineraries"
on public.itinerary_stops
for delete
to authenticated
using (
  exists (
    select 1
    from public.itineraries
    where itineraries.id = itinerary_stops.itinerary_id
      and itineraries.user_id = auth.uid()
  )
);

create policy "Users can read their itinerary drafts"
on public.itinerary_drafts
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their itinerary drafts"
on public.itinerary_drafts
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.itineraries
    where itineraries.id = itinerary_drafts.itinerary_id
      and itineraries.user_id = auth.uid()
  )
);

create policy "Users can update their itinerary drafts"
on public.itinerary_drafts
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.itineraries
    where itineraries.id = itinerary_drafts.itinerary_id
      and itineraries.user_id = auth.uid()
  )
);

create policy "Users can delete their itinerary drafts"
on public.itinerary_drafts
for delete
to authenticated
using (auth.uid() = user_id);
