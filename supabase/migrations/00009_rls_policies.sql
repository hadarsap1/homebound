-- Helper: get current user's family_id
create or replace function public.auth_family_id()
returns uuid as $$
  select family_id from public.profiles where id = auth.uid()
$$ language sql security definer stable;

-- ============================================
-- PROFILES
-- ============================================
-- Users can read profiles in their family
create policy "profiles_select" on public.profiles
  for select using (family_id = public.auth_family_id() or id = auth.uid());

-- Users can update their own profile
create policy "profiles_update" on public.profiles
  for update using (id = auth.uid());

-- Users can insert their own profile (trigger does this, but allow for family join flow)
create policy "profiles_insert" on public.profiles
  for insert with check (id = auth.uid());

-- ============================================
-- FAMILIES
-- ============================================
-- Users can read their own family
create policy "families_select" on public.families
  for select using (id = public.auth_family_id());

-- Anyone authenticated can create a family
create policy "families_insert" on public.families
  for insert with check (true);

-- Allow reading family by invite code (for join flow)
create policy "families_select_by_invite" on public.families
  for select using (true);

-- Family members can update their family
create policy "families_update" on public.families
  for update using (id = public.auth_family_id());

-- ============================================
-- FAMILY SETTINGS
-- ============================================
create policy "family_settings_select" on public.family_settings
  for select using (family_id = public.auth_family_id());

create policy "family_settings_update" on public.family_settings
  for update using (family_id = public.auth_family_id());

-- ============================================
-- LOCATIONS
-- ============================================
create policy "locations_select" on public.locations
  for select using (family_id = public.auth_family_id());

create policy "locations_insert" on public.locations
  for insert with check (family_id = public.auth_family_id());

create policy "locations_update" on public.locations
  for update using (family_id = public.auth_family_id());

create policy "locations_delete" on public.locations
  for delete using (family_id = public.auth_family_id());

-- ============================================
-- PROPERTIES
-- ============================================
create policy "properties_select" on public.properties
  for select using (family_id = public.auth_family_id());

create policy "properties_insert" on public.properties
  for insert with check (family_id = public.auth_family_id());

create policy "properties_update" on public.properties
  for update using (family_id = public.auth_family_id());

create policy "properties_delete" on public.properties
  for delete using (family_id = public.auth_family_id());

-- ============================================
-- PROPERTY RATINGS (scoped through properties)
-- ============================================
create policy "ratings_select" on public.property_ratings
  for select using (
    exists (
      select 1 from public.properties
      where properties.id = property_ratings.property_id
      and properties.family_id = public.auth_family_id()
    )
  );

create policy "ratings_insert" on public.property_ratings
  for insert with check (
    profile_id = auth.uid() and
    exists (
      select 1 from public.properties
      where properties.id = property_ratings.property_id
      and properties.family_id = public.auth_family_id()
    )
  );

create policy "ratings_update" on public.property_ratings
  for update using (profile_id = auth.uid());

create policy "ratings_delete" on public.property_ratings
  for delete using (profile_id = auth.uid());

-- ============================================
-- VISIT CHECKLISTS (scoped through properties)
-- ============================================
create policy "checklists_select" on public.visit_checklists
  for select using (
    exists (
      select 1 from public.properties
      where properties.id = visit_checklists.property_id
      and properties.family_id = public.auth_family_id()
    )
  );

create policy "checklists_insert" on public.visit_checklists
  for insert with check (
    exists (
      select 1 from public.properties
      where properties.id = visit_checklists.property_id
      and properties.family_id = public.auth_family_id()
    )
  );

create policy "checklists_update" on public.visit_checklists
  for update using (
    exists (
      select 1 from public.properties
      where properties.id = visit_checklists.property_id
      and properties.family_id = public.auth_family_id()
    )
  );

create policy "checklists_delete" on public.visit_checklists
  for delete using (
    exists (
      select 1 from public.properties
      where properties.id = visit_checklists.property_id
      and properties.family_id = public.auth_family_id()
    )
  );

-- ============================================
-- TASKS
-- ============================================
create policy "tasks_select" on public.tasks
  for select using (family_id = public.auth_family_id());

create policy "tasks_insert" on public.tasks
  for insert with check (family_id = public.auth_family_id());

create policy "tasks_update" on public.tasks
  for update using (family_id = public.auth_family_id());

create policy "tasks_delete" on public.tasks
  for delete using (family_id = public.auth_family_id());
