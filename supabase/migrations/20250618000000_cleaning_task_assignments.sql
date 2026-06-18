-- Feste Zuständigkeit pro Putzaufgabe

alter table public.cleaning_tasks
  add column assigned_to uuid references auth.users (id) on delete set null;

create index cleaning_tasks_assigned_to_idx on public.cleaning_tasks (assigned_to);

create or replace function public.validate_cleaning_task_assignee()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assigned_to is not null and not exists (
    select 1 from public.household_members hm
    where hm.household_id = new.household_id
      and hm.user_id = new.assigned_to
  ) then
    raise exception 'User is not a member of this household';
  end if;
  return new;
end;
$$;

create trigger cleaning_tasks_validate_assignee
  before insert or update on public.cleaning_tasks
  for each row execute function public.validate_cleaning_task_assignee();
