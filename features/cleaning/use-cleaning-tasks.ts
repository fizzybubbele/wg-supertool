import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useHouseholds } from '@/features/household/use-household';
import { getSupabase } from '@/lib/supabase';

export type CleaningTask = {
  id: string;
  title: string;
  done: boolean;
};

async function fetchCleaningTasks(householdId: string): Promise<CleaningTask[]> {
  const { data, error } = await getSupabase()
    .from('cleaning_tasks')
    .select('id, title, done')
    .eq('household_id', householdId)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export function useCleaningTasks() {
  const queryClient = useQueryClient();
  const { activeHousehold } = useHouseholds();
  const householdId = activeHousehold?.id;

  const query = useQuery({
    queryKey: ['cleaning', householdId],
    queryFn: () => fetchCleaningTasks(householdId!),
    enabled: Boolean(householdId),
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await getSupabase().from('cleaning_tasks').update({ done }).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['cleaning', householdId] }),
  });

  return { tasks: query.data ?? [], isLoading: query.isLoading, toggleTask };
}
