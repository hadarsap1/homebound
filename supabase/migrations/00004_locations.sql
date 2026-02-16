-- Locations / neighborhoods
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  lat double precision,
  lng double precision,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.locations enable row level security;
