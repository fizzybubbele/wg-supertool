-- Kassenzettel: Storage + receipts + receipt_items

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

create type public.receipt_status as enum ('pending', 'parsed', 'confirmed', 'failed');

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  uploaded_by uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  store_name text,
  purchase_date date,
  total_amount numeric(10, 2),
  currency text not null default 'EUR',
  status public.receipt_status not null default 'pending',
  raw_vision_json jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table public.receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.receipts (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(10, 2),
  total_price numeric(10, 2),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index receipts_household_id_idx on public.receipts (household_id);
create index receipts_status_idx on public.receipts (status);
create index receipt_items_receipt_id_idx on public.receipt_items (receipt_id);
create index receipt_items_household_id_idx on public.receipt_items (household_id);

alter table public.receipts enable row level security;
alter table public.receipt_items enable row level security;

create policy "receipts_member_all"
  on public.receipts for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "receipt_items_member_all"
  on public.receipt_items for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

grant select, insert, update, delete on public.receipts to authenticated;
grant select, insert, update, delete on public.receipt_items to authenticated;

-- Storage: receipts/{household_id}/...
create policy "receipts_storage_select_member"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'receipts'
    and public.is_household_member(((storage.foldername(name))[1])::uuid)
  );

create policy "receipts_storage_insert_member"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'receipts'
    and public.is_household_member(((storage.foldername(name))[1])::uuid)
  );

create policy "receipts_storage_update_member"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'receipts'
    and public.is_household_member(((storage.foldername(name))[1])::uuid)
  );

create policy "receipts_storage_delete_member"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'receipts'
    and public.is_household_member(((storage.foldername(name))[1])::uuid)
  );
