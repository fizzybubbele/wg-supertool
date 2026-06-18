-- Starter content for the four core areas

create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  quantity numeric not null default 1,
  unit text not null default 'Stk',
  created_at timestamptz not null default now()
);

create table public.cleaning_tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  done boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.org_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  event_date date not null,
  description text,
  created_at timestamptz not null default now()
);

create index shopping_list_items_household_id_idx on public.shopping_list_items (household_id);
create index pantry_items_household_id_idx on public.pantry_items (household_id);
create index cleaning_tasks_household_id_idx on public.cleaning_tasks (household_id);
create index org_events_household_id_idx on public.org_events (household_id);

alter table public.shopping_list_items enable row level security;
alter table public.pantry_items enable row level security;
alter table public.cleaning_tasks enable row level security;
alter table public.org_events enable row level security;

create policy "shopping_list_items_member_all"
  on public.shopping_list_items for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "pantry_items_member_all"
  on public.pantry_items for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "cleaning_tasks_member_all"
  on public.cleaning_tasks for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "org_events_member_all"
  on public.org_events for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

grant select, insert, update, delete on public.shopping_list_items to authenticated;
grant select, insert, update, delete on public.pantry_items to authenticated;
grant select, insert, update, delete on public.cleaning_tasks to authenticated;
grant select, insert, update, delete on public.org_events to authenticated;
