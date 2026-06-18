-- Archiv abgeschlossener Einkaufslisten-Einträge für Kaufstatistik

create table public.shopping_list_completions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  completed_at timestamptz not null default now(),
  completed_by uuid references auth.users (id) on delete set null
);

create index shopping_list_completions_household_completed_idx
  on public.shopping_list_completions (household_id, completed_at desc);

alter table public.shopping_list_completions enable row level security;

create policy "shopping_list_completions_member_all"
  on public.shopping_list_completions for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

grant select, insert, update, delete on public.shopping_list_completions to authenticated;
