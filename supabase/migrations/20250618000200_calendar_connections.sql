-- Google Calendar OAuth connections (tokens only via service role)

create table public.calendar_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  provider text not null default 'google',
  calendar_id text not null default 'primary',
  refresh_token text not null,
  watch_channel_id text,
  watch_resource_id text,
  watch_expires_at timestamptz,
  last_synced_at timestamptz,
  sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, household_id, provider)
);

create index calendar_connections_household_id_idx on public.calendar_connections (household_id);
create index calendar_connections_user_id_idx on public.calendar_connections (user_id);

create trigger calendar_connections_updated_at
  before update on public.calendar_connections
  for each row execute function public.handle_updated_at();

alter table public.calendar_connections enable row level security;

create policy "calendar_connections_select_own"
  on public.calendar_connections for select
  using (auth.uid() = user_id);

create policy "calendar_connections_delete_own"
  on public.calendar_connections for delete
  using (auth.uid() = user_id);

-- Inserts/updates only via Edge Functions (service role)
grant select, delete on public.calendar_connections to authenticated;

create or replace view public.calendar_connections_public
with (security_invoker = true) as
select
  id,
  user_id,
  household_id,
  provider,
  calendar_id,
  watch_expires_at,
  last_synced_at,
  sync_error,
  created_at,
  updated_at,
  (watch_channel_id is not null and watch_expires_at > now()) as watch_active
from public.calendar_connections;

grant select on public.calendar_connections_public to authenticated;
