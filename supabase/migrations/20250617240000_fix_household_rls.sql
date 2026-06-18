-- Fix: creator must read household before household_members row exists

alter table public.households
  add column created_by uuid references auth.users (id) on delete set null;

create or replace function public.set_household_creator()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.created_by = auth.uid();
  return new;
end;
$$;

create trigger households_set_creator
  before insert on public.households
  for each row execute function public.set_household_creator();

drop policy if exists "households_select_member" on public.households;

create policy "households_select_member"
  on public.households for select
  using (
    public.is_household_member(id)
    or created_by = auth.uid()
  );
