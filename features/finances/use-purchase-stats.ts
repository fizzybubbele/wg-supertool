import { useQuery } from '@tanstack/react-query';

import { fetchPurchaseStats } from '@/features/finances/purchase-stats-service';
import { useHouseholds } from '@/features/household/use-household';

export type {
  MonthlySpend,
  PurchaseStats,
  TopProduct,
  TopProductSource,
} from '@/features/finances/purchase-stats-service';

export function usePurchaseStats() {
  const { activeHousehold } = useHouseholds();
  const householdId = activeHousehold?.id;

  const query = useQuery({
    queryKey: ['purchase-stats', householdId],
    queryFn: () => fetchPurchaseStats(householdId!),
    enabled: Boolean(householdId),
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
  };
}
