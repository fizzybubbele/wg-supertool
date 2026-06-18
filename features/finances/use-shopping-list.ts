import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  completeCheckedShoppingItems,
  fetchShoppingList,
} from '@/features/finances/shopping-list-service';
import { useHouseholds } from '@/features/household/use-household';
import { getSupabase } from '@/lib/supabase';

export type { ShoppingListItem } from '@/features/finances/shopping-list-service';

export function useShoppingList() {
  const queryClient = useQueryClient();
  const { activeHousehold } = useHouseholds();
  const householdId = activeHousehold?.id;

  const query = useQuery({
    queryKey: ['shopping-list', householdId],
    queryFn: () => fetchShoppingList(householdId!),
    enabled: Boolean(householdId),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['shopping-list', householdId] });
  };

  const invalidateStats = () => {
    void queryClient.invalidateQueries({ queryKey: ['purchase-stats', householdId] });
    void queryClient.invalidateQueries({ queryKey: ['member-activity', householdId] });
  };

  const addItem = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await getSupabase()
        .from('shopping_list_items')
        .insert({ household_id: householdId!, name });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });

  const toggleItem = useMutation({
    mutationFn: async ({ id, checked }: { id: string; checked: boolean }) => {
      const { error } = await getSupabase()
        .from('shopping_list_items')
        .update({ checked })
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase().from('shopping_list_items').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });

  const completeCheckedItems = useMutation({
    mutationFn: (shoppedBy: string) => completeCheckedShoppingItems(householdId!, shoppedBy),
    onSuccess: () => {
      invalidate();
      invalidateStats();
    },
  });

  const items = query.data ?? [];
  const checkedCount = items.filter((item) => item.checked).length;

  return {
    items,
    checkedCount,
    isLoading: query.isLoading,
    addItem,
    toggleItem,
    deleteItem,
    completeCheckedItems,
  };
}
