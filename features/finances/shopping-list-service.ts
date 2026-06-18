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

export async function completeCheckedShoppingItems(
  householdId: string,
  shoppedBy: string,
): Promise<number> {
  const supabase = getSupabase();

  const { data: checked, error: fetchError } = await supabase
    .from('shopping_list_items')
    .select('id, name')
    .eq('household_id', householdId)
    .eq('checked', true);

  if (fetchError) throw new Error(fetchError.message);
  if (!checked?.length) return 0;

  const { error: insertError } = await supabase.from('shopping_list_completions').insert(
    checked.map((item) => ({
      household_id: householdId,
      name: item.name,
      completed_by: shoppedBy,
    })),
  );

  if (insertError) throw new Error(insertError.message);

  const ids = checked.map((item) => item.id);
  const { error: deleteError } = await supabase.from('shopping_list_items').delete().in('id', ids);

  if (deleteError) throw new Error(deleteError.message);

  return checked.length;
}

export { fetchShoppingList };
