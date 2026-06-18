import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useHouseholds } from '@/features/household/use-household';
import { getSupabase } from '@/lib/supabase';

export type PantryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

async function fetchPantry(householdId: string): Promise<PantryItem[]> {
  const { data, error } = await getSupabase()
    .from('pantry_items')
    .select('id, name, quantity, unit')
    .eq('household_id', householdId)
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export function usePantry() {
  const queryClient = useQueryClient();
  const { activeHousehold } = useHouseholds();
  const householdId = activeHousehold?.id;

  const query = useQuery({
    queryKey: ['pantry', householdId],
    queryFn: () => fetchPantry(householdId!),
    enabled: Boolean(householdId),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['pantry', householdId] });

  const addItem = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await getSupabase()
        .from('pantry_items')
        .insert({ household_id: householdId!, name, quantity: 1, unit: 'Stk' });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase().from('pantry_items').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });

  return { items: query.data ?? [], isLoading: query.isLoading, addItem, deleteItem };
}
