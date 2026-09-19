create table public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  category text not null check (length(trim(category)) > 0),
  latitude numeric(10, 7) not null check (latitude between -90 and 90),
  longitude numeric(10, 7) not null check (longitude between -180 and 180),
  address text not null check (length(trim(address)) > 0),
  phone text,
  opening_hours jsonb not null default '{}'::jsonb check (jsonb_typeof(opening_hours) = 'object'),
  closed_days text[] not null default '{}',
  market_days text[] not null default '{}',
  reservation_required boolean not null default false,
  parking_info text,
  default_dwell_minutes integer not null check (default_dwell_minutes between 1 and 1440),
  source_url text not null check (length(trim(source_url)) > 0),
  verified_at date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.place_media (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  asset_url text not null check (length(trim(asset_url)) > 0),
  alt_text text not null check (length(trim(alt_text)) > 0),
  license_source text not null check (length(trim(license_source)) > 0),
  display_order integer not null check (display_order > 0),
  created_at timestamptz not null default now(),
  unique (place_id, display_order)
);

create table public.curations (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  audience_type text not null check (length(trim(audience_type)) > 0),
  transport_mode text not null check (transport_mode in ('walk', 'car', 'transit')),
  duration_minutes integer not null check (duration_minutes between 1 and 1440),
  interest_tags text[] not null default '{}',
  recommendation_reason text not null check (length(trim(recommendation_reason)) > 0),
  is_fallback boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.curation_stops (
  curation_id uuid not null references public.curations(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete restrict,
  position integer not null check (position > 0),
  dwell_minutes integer not null check (dwell_minutes between 1 and 1440),
  stop_reason text not null check (length(trim(stop_reason)) > 0),
  created_at timestamptz not null default now(),
  primary key (curation_id, place_id),
  unique (curation_id, position)
);

create table public.plan_b_rules (
  id uuid primary key default gen_random_uuid(),
  blocked_reason text not null check (length(trim(blocked_reason)) > 0),
  required_tags text[] not null default '{}',
  excluded_tags text[] not null default '{}',
  priority integer not null check (priority >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.places enable row level security;
alter table public.place_media enable row level security;
alter table public.curations enable row level security;
alter table public.curation_stops enable row level security;
alter table public.plan_b_rules enable row level security;

revoke all on table public.places from anon, authenticated;
revoke all on table public.place_media from anon, authenticated;
revoke all on table public.curations from anon, authenticated;
revoke all on table public.curation_stops from anon, authenticated;
revoke all on table public.plan_b_rules from anon, authenticated;

grant select on table public.places to anon, authenticated;
grant select on table public.place_media to anon, authenticated;
grant select on table public.curations to anon, authenticated;
grant select on table public.curation_stops to anon, authenticated;
grant all on table public.places to service_role;
grant all on table public.place_media to service_role;
grant all on table public.curations to service_role;
grant all on table public.curation_stops to service_role;
grant all on table public.plan_b_rules to service_role;

create policy "Public places are readable"
on public.places
for select
to anon, authenticated
using (true);

create policy "Public place media are readable"
on public.place_media
for select
to anon, authenticated
using (true);

create policy "Published curations are readable"
on public.curations
for select
to anon, authenticated
using (published_at is not null and published_at <= now());

create policy "Published curation stops are readable"
on public.curation_stops
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.curations
    where curations.id = curation_stops.curation_id
      and curations.published_at is not null
      and curations.published_at <= now()
  )
);
