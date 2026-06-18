import { getSupabase } from '@/lib/supabase';
import { fetchProfiles } from '@/features/responsibilities/responsibility-service';

export type CleaningTask = {
  id: string;
  title: string;
  done: boolean;
  assigned_to: string | null;
  assignee_name: string | null;
};

export async function fetchCleaningTasks(householdId: string): Promise<CleaningTask[]> {
  const { data, error } = await getSupabase()
    .from('cleaning_tasks')
    .select('id, title, done, assigned_to')
    .eq('household_id', householdId)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const assigneeIds = rows
    .map((row) => row.assigned_to as string | null)
    .filter((id): id is string => Boolean(id));
  const profiles = await fetchProfiles(assigneeIds);

  return rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    done: row.done as boolean,
    assigned_to: (row.assigned_to as string | null) ?? null,
    assignee_name: row.assigned_to ? (profiles.get(row.assigned_to as string) ?? null) : null,
  }));
}

export async function toggleCleaningTask(id: string, done: boolean): Promise<void> {
  const supabase = getSupabase();

  if (done) {
    const { data: task, error: fetchError } = await supabase
      .from('cleaning_tasks')
      .select('assigned_to')
      .eq('id', id)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    let completedBy = task?.assigned_to as string | null;
    if (!completedBy) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      completedBy = user?.id ?? null;
    }

    const { error } = await supabase
      .from('cleaning_tasks')
      .update({
        done: true,
        completed_by: completedBy,
        completed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase
    .from('cleaning_tasks')
    .update({
      done: false,
      completed_by: null,
      completed_at: null,
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function assignCleaningTask(id: string, userId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('cleaning_tasks')
    .update({ assigned_to: userId })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function clearCleaningTaskAssignee(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('cleaning_tasks')
    .update({ assigned_to: null })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function createCleaningTask(householdId: string, title: string): Promise<void> {
  const { data: existing, error: countError } = await getSupabase()
    .from('cleaning_tasks')
    .select('sort_order')
    .eq('household_id', householdId)
    .order('sort_order', { ascending: false })
    .limit(1);

  if (countError) throw new Error(countError.message);

  const nextSortOrder = existing?.[0]?.sort_order != null ? (existing[0].sort_order as number) + 1 : 0;

  const { error } = await getSupabase().from('cleaning_tasks').insert({
    household_id: householdId,
    title,
    sort_order: nextSortOrder,
  });

  if (error) throw new Error(error.message);
}

export async function deleteCleaningTask(id: string): Promise<void> {
  const { error } = await getSupabase().from('cleaning_tasks').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
