-- Multi-tenancy foundation: profiles, households, household_members

create type public.household_role as enum ('owner', 'member');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.household_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (household_id, user_id)
);

create index household_members_user_id_idx on public.household_members (user_id);
create index household_members_household_id_idx on public.household_members (household_id);

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger households_updated_at
  before update on public.households
  for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = auth.uid()
  );
$$;

-- profiles: users can read/update only their own profile
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- households: members can read their households; any authenticated user can create
create policy "households_select_member"
  on public.households for select
  using (public.is_household_member(id));

create policy "households_insert_authenticated"
  on public.households for insert
  to authenticated
  with check (true);

create policy "households_update_owner"
  on public.households for update
  using (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = id
        and hm.user_id = auth.uid()
        and hm.role = 'owner'
    )
  );

-- household_members: members see co-members; owners manage membership
create policy "household_members_select_member"
  on public.household_members for select
  using (public.is_household_member(household_id));

create policy "household_members_insert_owner_or_self"
  on public.household_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.household_members hm
      where hm.household_id = household_id
        and hm.user_id = auth.uid()
        and hm.role = 'owner'
    )
  );

create policy "household_members_delete_owner"
  on public.household_members for delete
  using (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = household_id
        and hm.user_id = auth.uid()
        and hm.role = 'owner'
    )
  );

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to authenticated, service_role;
