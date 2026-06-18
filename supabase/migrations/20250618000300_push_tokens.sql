-- Expo push notification tokens for event reminders

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  expo_push_token text not null,
  platform text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

create index push_tokens_user_id_idx on public.push_tokens (user_id);

create trigger push_tokens_updated_at
  before update on public.push_tokens
  for each row execute function public.handle_updated_at();

alter table public.push_tokens enable row level security;

create policy "push_tokens_own_all"
  on public.push_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.push_tokens to authenticated;

create table public.event_reminder_log (
  id uuid primary key default gen_random_uuid(),
  org_event_id uuid not null references public.org_events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reminded_at timestamptz not null default now(),
  unique (org_event_id, user_id)
);

alter table public.event_reminder_log enable row level security;

create policy "event_reminder_log_select_own"
  on public.event_reminder_log for select
  using (auth.uid() = user_id);

grant select on public.event_reminder_log to authenticated;
