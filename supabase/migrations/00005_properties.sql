-- Properties (core entity)
create type public.property_status as enum (
  'new', 'visited', 'interested', 'offer_made', 'rejected', 'archived'
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  address text not null,
  google_place_id text,
  lat double precision,
  lng double precision,
  price numeric,
  beds smallint,
  baths smallint,
  sqm numeric,
  floor smallint,
  parking boolean not null default false,
  elevator boolean not null default false,
  status public.property_status not null default 'new',
  vibe_tags text[] not null default '{}',
  metadata jsonb not null default '{}',
  images text[] not null default '{}',
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties enable row level security;

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger properties_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();
