import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { syncOrgEventToCalendar } from '@/features/integrations/calendar/calendar-service';
import { useHouseholds } from '@/features/household/use-household';
import { getSupabase } from '@/lib/supabase';

export type OrgEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  description: string | null;
  externalEventId: string | null;
};

type OrgEventRow = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  description: string | null;
  external_event_id: string | null;
};

function mapEvent(row: OrgEventRow): OrgEvent {
  return {
    id: row.id,
    title: row.title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    allDay: row.all_day,
    description: row.description,
    externalEventId: row.external_event_id,
  };
}

async function fetchOrgEvents(householdId: string): Promise<OrgEvent[]> {
  const { data, error } = await getSupabase()
    .from('org_events')
    .select('id, title, starts_at, ends_at, all_day, description, external_event_id')
    .eq('household_id', householdId)
    .is('deleted_at', null)
    .order('starts_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapEvent(row as OrgEventRow));
}

export function useOrgEvents() {
  const queryClient = useQueryClient();
  const { activeHousehold } = useHouseholds();
  const householdId = activeHousehold?.id;

  const query = useQuery({
    queryKey: ['org-events', householdId],
    queryFn: () => fetchOrgEvents(householdId!),
    enabled: Boolean(householdId),
  });

  const addEvent = useMutation({
    mutationFn: async ({ title, startsAt }: { title: string; startsAt: string }) => {
      const { data, error } = await getSupabase()
        .from('org_events')
        .insert({
          household_id: householdId!,
          title,
          event_date: startsAt.slice(0, 10),
          starts_at: startsAt,
          all_day: true,
          sync_source: 'app',
        })
        .select('id')
        .single();

      if (error) throw new Error(error.message);
      return data.id as string;
    },
    onSuccess: async (eventId) => {
      void queryClient.invalidateQueries({ queryKey: ['org-events', householdId] });
      if (householdId) {
        await syncOrgEventToCalendar(eventId, 'upsert').catch(() => undefined);
      }
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await getSupabase()
        .from('org_events')
        .update({ deleted_at: new Date().toISOString(), sync_source: 'app' })
        .eq('id', eventId);

      if (error) throw new Error(error.message);
      return eventId;
    },
    onSuccess: async (eventId) => {
      void queryClient.invalidateQueries({ queryKey: ['org-events', householdId] });
      await syncOrgEventToCalendar(eventId, 'delete').catch(() => undefined);
    },
  });

  return {
    events: query.data ?? [],
    isLoading: query.isLoading,
    addEvent,
    deleteEvent,
  };
}
