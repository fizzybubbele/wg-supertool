-- Extend org_events for calendar sync (Phase 0 foundation)

alter table public.org_events
  add column starts_at timestamptz,
  add column ends_at timestamptz,
  add column all_day boolean not null default true,
  add column updated_at timestamptz not null default now(),
  add column deleted_at timestamptz,
  add column external_provider text,
  add column external_calendar_id text,
  add column external_event_id text,
  add column sync_source text,
  add column synced_at timestamptz;

update public.org_events
set starts_at = (event_date::timestamptz + interval '12 hours')
where starts_at is null;

alter table public.org_events
  alter column starts_at set not null;

create trigger org_events_updated_at
  before update on public.org_events
  for each row execute function public.handle_updated_at();

create index org_events_starts_at_idx on public.org_events (household_id, starts_at);
create index org_events_external_event_id_idx on public.org_events (external_event_id)
  where external_event_id is not null;
