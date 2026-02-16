-- Family settings (custom tags + dynamic field definitions)
create table public.family_settings (
  id uuid primary key default gen_random_uuid(),
  family_id uuid unique not null references public.families(id) on delete cascade,
  custom_tags jsonb not null default '["Quiet street", "Near park", "Good light", "Renovated", "Garden"]'::jsonb,
  custom_field_definitions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.family_settings enable row level security;

-- Auto-create settings when family is created
create or replace function public.handle_new_family()
returns trigger as $$
begin
  insert into public.family_settings (family_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_family_created
  after insert on public.families
  for each row execute function public.handle_new_family();
