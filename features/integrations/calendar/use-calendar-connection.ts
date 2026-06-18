import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  fetchCalendarConnection,
  syncCalendarInbound,
} from '@/features/integrations/calendar/calendar-service';
import { useHouseholds } from '@/features/household/use-household';

export function useCalendarConnection() {
  const queryClient = useQueryClient();
  const { activeHousehold } = useHouseholds();
  const householdId = activeHousehold?.id;

  const query = useQuery({
    queryKey: ['calendar-connection', householdId],
    queryFn: () => fetchCalendarConnection(householdId!),
    enabled: Boolean(householdId),
  });

  const connect = useMutation({
    mutationFn: () => connectGoogleCalendar(householdId!),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['calendar-connection', householdId] }),
  });

  const disconnect = useMutation({
    mutationFn: () => disconnectGoogleCalendar(householdId!),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['calendar-connection', householdId] }),
  });

  const syncNow = useMutation({
    mutationFn: () => syncCalendarInbound(householdId!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['calendar-connection', householdId] });
      void queryClient.invalidateQueries({ queryKey: ['org-events', householdId] });
    },
  });

  return {
    connection: query.data ?? null,
    isLoading: query.isLoading,
    connect,
    disconnect,
    syncNow,
  };
}
