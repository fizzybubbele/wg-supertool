-- Zuständigkeiten pro Bereich (Finanzen, Putzplan, Organisation, Vorrat)

create type public.household_area as enum ('finances', 'cleaning', 'organization', 'pantry');

create table public.area_responsibilities (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  area public.household_area not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, area)
);

create index area_responsibilities_household_id_idx on public.area_responsibilities (household_id);

alter table public.area_responsibilities enable row level security;

create trigger area_responsibilities_updated_at
  before update on public.area_responsibilities
  for each row execute function public.handle_updated_at();

create policy "area_responsibilities_member_all"
  on public.area_responsibilities for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

grant select, insert, update, delete on public.area_responsibilities to authenticated;

-- Mitglieder dürfen Profile anderer Haushaltsmitglieder sehen (für Zuständigkeiten)
create policy "profiles_select_household_co_members"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.household_members hm_self
      join public.household_members hm_other
        on hm_self.household_id = hm_other.household_id
      where hm_self.user_id = auth.uid()
        and hm_other.user_id = profiles.id
    )
  );

-- Mitglieder dürfen nur Haushaltsmitglieder als Zuständige setzen
create or replace function public.validate_area_responsible_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.household_members hm
    where hm.household_id = new.household_id
      and hm.user_id = new.user_id
  ) then
    raise exception 'User is not a member of this household';
  end if;
  return new;
end;
$$;

create trigger area_responsibilities_validate_member
  before insert or update on public.area_responsibilities
  for each row execute function public.validate_area_responsible_member();
