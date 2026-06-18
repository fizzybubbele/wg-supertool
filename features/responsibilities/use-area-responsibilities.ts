import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useHouseholds } from '@/features/household/use-household';
import type { HouseholdArea } from '@/features/responsibilities/areas';
import {
  clearAreaResponsible,
  fetchAreaResponsibilities,
  fetchHouseholdMembers,
  setAreaResponsible,
} from '@/features/responsibilities/responsibility-service';

export function useAreaResponsibilities() {
  const queryClient = useQueryClient();
  const { activeHousehold } = useHouseholds();
  const householdId = activeHousehold?.id;

  const membersQuery = useQuery({
    queryKey: ['household-members', householdId],
    queryFn: () => fetchHouseholdMembers(householdId!),
    enabled: Boolean(householdId),
  });

  const responsibilitiesQuery = useQuery({
    queryKey: ['area-responsibilities', householdId],
    queryFn: () => fetchAreaResponsibilities(householdId!),
    enabled: Boolean(householdId),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['area-responsibilities', householdId] });
  };

  const assignMutation = useMutation({
    mutationFn: ({ area, userId }: { area: HouseholdArea; userId: string }) =>
      setAreaResponsible(householdId!, area, userId),
    onSuccess: invalidate,
  });

  const clearMutation = useMutation({
    mutationFn: (area: HouseholdArea) => clearAreaResponsible(householdId!, area),
    onSuccess: invalidate,
  });

  const getResponsibleForArea = (area: HouseholdArea) =>
    responsibilitiesQuery.data?.find((entry) => entry.area === area) ?? null;

  return {
    members: membersQuery.data ?? [],
    responsibilities: responsibilitiesQuery.data ?? [],
    isLoading: membersQuery.isLoading || responsibilitiesQuery.isLoading,
    getResponsibleForArea,
    assignResponsible: assignMutation.mutateAsync,
    clearResponsible: clearMutation.mutateAsync,
    isUpdating: assignMutation.isPending || clearMutation.isPending,
  };
}
