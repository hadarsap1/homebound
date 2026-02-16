-- Families table
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_at timestamptz not null default now()
);

alter table public.families enable row level security;
