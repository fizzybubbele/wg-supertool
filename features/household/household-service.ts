import { getSupabase } from '@/lib/supabase';
import { assignAllAreasToUser } from '@/features/responsibilities/responsibility-service';

export type Household = {
  id: string;
  name: string;
  created_at: string;
};

const DEFAULT_CLEANING_TASKS = [
  'Küche putzen',
  'Bad reinigen',
  'Flur staubsaugen',
  'Müll rausbringen',
];

export async function fetchMyHouseholds(): Promise<Household[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('households')
    .select('id, name, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createHousehold(name: string): Promise<Household> {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Nicht angemeldet');
  }

  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({ name })
    .select('id, name, created_at')
    .single();

  if (householdError || !household) {
    throw new Error(householdError?.message ?? 'Haushalt konnte nicht erstellt werden');
  }

  const { error: memberError } = await supabase.from('household_members').insert({
    household_id: household.id,
    user_id: user.id,
    role: 'owner',
  });

  if (memberError) {
    throw new Error(memberError.message);
  }

  const cleaningTasks = DEFAULT_CLEANING_TASKS.map((title, index) => ({
    household_id: household.id,
    title,
    sort_order: index,
  }));

  const { error: cleaningError } = await supabase.from('cleaning_tasks').insert(cleaningTasks);

  if (cleaningError) {
    throw new Error(cleaningError.message);
  }

  const { error: pantryError } = await supabase.from('pantry_items').insert([
    { household_id: household.id, name: 'Milch', quantity: 1, unit: 'L' },
    { household_id: household.id, name: 'Nudeln', quantity: 500, unit: 'g' },
    { household_id: household.id, name: 'Kaffee', quantity: 1, unit: 'Packung' },
  ]);

  if (pantryError) {
    throw new Error(pantryError.message);
  }

  const { error: shoppingError } = await supabase.from('shopping_list_items').insert([
    { household_id: household.id, name: 'Brot' },
    { household_id: household.id, name: 'Eier' },
  ]);

  if (shoppingError) {
    throw new Error(shoppingError.message);
  }

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const { error: eventError } = await supabase.from('org_events').insert({
    household_id: household.id,
    title: 'WG-Abend',
    event_date: nextWeek.toISOString().slice(0, 10),
    starts_at: `${nextWeek.toISOString().slice(0, 10)}T12:00:00.000Z`,
    description: 'Gemeinsames Kochen und Planung',
    sync_source: 'app',
  });

  if (eventError) {
    throw new Error(eventError.message);
  }

  await assignAllAreasToUser(household.id, user.id);

  return household;
}
