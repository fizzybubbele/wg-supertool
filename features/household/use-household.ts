import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAppStore } from '@/features/app/app-store';
import { createHousehold, fetchMyHouseholds } from '@/features/household/household-service';

export function useHouseholds() {
  const queryClient = useQueryClient();
  const activeHouseholdId = useAppStore((state) => state.activeHouseholdId);
  const setActiveHouseholdId = useAppStore((state) => state.setActiveHouseholdId);

  const query = useQuery({
    queryKey: ['households'],
    queryFn: fetchMyHouseholds,
  });

  const households = query.data ?? [];
  const activeHousehold =
    households.find((household) => household.id === activeHouseholdId) ?? households[0] ?? null;

  useEffect(() => {
    if (households.length > 0 && !activeHouseholdId) {
      setActiveHouseholdId(households[0].id);
    }
  }, [households, activeHouseholdId, setActiveHouseholdId]);

  const createMutation = useMutation({
    mutationFn: createHousehold,
    onSuccess: (household) => {
      setActiveHouseholdId(household.id);
      void queryClient.invalidateQueries({ queryKey: ['households'] });
      void queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
      void queryClient.invalidateQueries({ queryKey: ['pantry'] });
      void queryClient.invalidateQueries({ queryKey: ['cleaning'] });
      void queryClient.invalidateQueries({ queryKey: ['org-events'] });
    },
  });

  return {
    households,
    activeHousehold,
    isLoading: query.isLoading,
    error: query.error,
    createHousehold: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}
