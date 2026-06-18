-- Personenbezug für Einkäufe und erledigte Putzaufgaben

alter table public.receipts
  add column shopped_by uuid references auth.users (id) on delete set null;

create index receipts_shopped_by_idx on public.receipts (shopped_by);

update public.receipts
set shopped_by = uploaded_by
where shopped_by is null;

create or replace function public.validate_receipt_shopped_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.shopped_by is not null and not exists (
    select 1 from public.household_members hm
    where hm.household_id = new.household_id
      and hm.user_id = new.shopped_by
  ) then
    raise exception 'User is not a member of this household';
  end if;
  return new;
end;
$$;

create trigger receipts_validate_shopped_by
  before insert or update on public.receipts
  for each row execute function public.validate_receipt_shopped_by();

alter table public.cleaning_tasks
  add column completed_by uuid references auth.users (id) on delete set null,
  add column completed_at timestamptz;

create index cleaning_tasks_completed_by_idx on public.cleaning_tasks (completed_by);

create or replace function public.validate_cleaning_task_completed_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.completed_by is not null and not exists (
    select 1 from public.household_members hm
    where hm.household_id = new.household_id
      and hm.user_id = new.completed_by
  ) then
    raise exception 'User is not a member of this household';
  end if;
  return new;
end;
$$;

create trigger cleaning_tasks_validate_completed_by
  before insert or update on public.cleaning_tasks
  for each row execute function public.validate_cleaning_task_completed_by();

create or replace function public.validate_shopping_completion_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.completed_by is not null and not exists (
    select 1 from public.household_members hm
    where hm.household_id = new.household_id
      and hm.user_id = new.completed_by
  ) then
    raise exception 'User is not a member of this household';
  end if;
  return new;
end;
$$;

create trigger shopping_list_completions_validate_member
  before insert or update on public.shopping_list_completions
  for each row execute function public.validate_shopping_completion_member();
