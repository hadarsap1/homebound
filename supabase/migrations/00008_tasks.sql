-- Tasks (shared to-do list)
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  due_date date,
  completed boolean not null default false,
  property_id uuid references public.properties(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
