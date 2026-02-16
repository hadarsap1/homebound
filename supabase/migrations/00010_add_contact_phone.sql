-- Add contact phone column to properties
alter table public.properties add column if not exists contact_phone text;
