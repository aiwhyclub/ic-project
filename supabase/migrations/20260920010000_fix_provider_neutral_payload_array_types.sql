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
  positions integer[] := array[]::integer[];
  place_ids uuid[] := array[]::uuid[];
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
    'provider_url', 'raw_response', 'kakao', 'tmap'
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
