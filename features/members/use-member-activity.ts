import { useQuery } from '@tanstack/react-query';

import { fetchMemberActivitySummaries } from '@/features/members/member-activity-service';
import { useHouseholds } from '@/features/household/use-household';

export function useMemberActivity() {
  const { activeHousehold } = useHouseholds();
  const householdId = activeHousehold?.id;

  const query = useQuery({
    queryKey: ['member-activity', householdId],
    queryFn: () => fetchMemberActivitySummaries(householdId!),
    enabled: Boolean(householdId),
  });

  return {
    summaries: query.data ?? [],
    isLoading: query.isLoading,
  };
}
