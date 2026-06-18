import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useHouseholds } from '@/features/household/use-household';
import { getSupabase } from '@/lib/supabase';

export type ShoppingListItem = {
  id: string;
  name: string;
  checked: boolean;
};

async function fetchShoppingList(householdId: string): Promise<ShoppingListItem[]> {
  const { data, error } = await getSupabase()
    .from('shopping_list_items')
    .select('id, name, checked')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export function useShoppingList() {
  const queryClient = useQueryClient();
  const { activeHousehold } = useHouseholds();
  const householdId = activeHousehold?.id;

  const query = useQuery({
    queryKey: ['shopping-list', householdId],
    queryFn: () => fetchShoppingList(householdId!),
    enabled: Boolean(householdId),
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ['shopping-list', householdId] });

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

  return { items: query.data ?? [], isLoading: query.isLoading, addItem, toggleItem, deleteItem };
}
