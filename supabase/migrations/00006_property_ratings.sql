-- Property ratings (one per user per property)
create table public.property_ratings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  overall smallint not null check (overall between 1 and 5),
  location smallint not null check (location between 1 and 5),
  condition smallint not null check (condition between 1 and 5),
  value smallint not null check (value between 1 and 5),
  notes text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (property_id, profile_id)
);

alter table public.property_ratings enable row level security;
