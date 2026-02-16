-- Visit checklists
create table public.visit_checklists (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  scheduled_at timestamptz,
  completed boolean not null default false,
  items jsonb not null default '[]',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.visit_checklists enable row level security;
