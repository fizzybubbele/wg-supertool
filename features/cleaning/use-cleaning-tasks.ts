import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  assignCleaningTask,
  clearCleaningTaskAssignee,
  createCleaningTask,
  deleteCleaningTask,
  fetchCleaningTasks,
  toggleCleaningTask,
  type CleaningTask,
} from '@/features/cleaning/cleaning-service';
import { useHouseholds } from '@/features/household/use-household';

export type { CleaningTask };

export function useCleaningTasks() {
  const queryClient = useQueryClient();
  const { activeHousehold } = useHouseholds();
  const householdId = activeHousehold?.id;

  const query = useQuery({
    queryKey: ['cleaning', householdId],
    queryFn: () => fetchCleaningTasks(householdId!),
    enabled: Boolean(householdId),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['cleaning', householdId] });
    void queryClient.invalidateQueries({ queryKey: ['member-activity', householdId] });
  };

  const toggleTask = useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) => toggleCleaningTask(id, done),
    onSuccess: invalidate,
  });

  const assignTask = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      assignCleaningTask(id, userId),
    onSuccess: invalidate,
  });

  const clearAssignee = useMutation({
    mutationFn: (id: string) => clearCleaningTaskAssignee(id),
    onSuccess: invalidate,
  });

  const addTask = useMutation({
    mutationFn: (title: string) => createCleaningTask(householdId!, title),
    onSuccess: invalidate,
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => deleteCleaningTask(id),
    onSuccess: invalidate,
  });

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    toggleTask,
    assignTask,
    clearAssignee,
    addTask,
    deleteTask,
  };
}
