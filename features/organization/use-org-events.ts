import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useHouseholds } from '@/features/household/use-household';
import { getSupabase } from '@/lib/supabase';

export type OrgEvent = {
  id: string;
  title: string;
  event_date: string;
  description: string | null;
};

async function fetchOrgEvents(householdId: string): Promise<OrgEvent[]> {
  const { data, error } = await getSupabase()
    .from('org_events')
    .select('id, title, event_date, description')
    .eq('household_id', householdId)
    .order('event_date', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
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
    mutationFn: async ({ title, eventDate }: { title: string; eventDate: string }) => {
      const { error } = await getSupabase()
        .from('org_events')
        .insert({ household_id: householdId!, title, event_date: eventDate });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['org-events', householdId] }),
  });

  return { events: query.data ?? [], isLoading: query.isLoading, addEvent };
}
