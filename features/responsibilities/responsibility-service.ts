import { getSupabase } from '@/lib/supabase';

import type { HouseholdArea } from '@/features/responsibilities/areas';

export type HouseholdMember = {
  user_id: string;
  role: 'owner' | 'member';
  display_name: string | null;
};

export type AreaResponsibility = {
  id: string;
  area: HouseholdArea;
  user_id: string;
  display_name: string | null;
};

export async function fetchProfiles(userIds: string[]): Promise<Map<string, string | null>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((profile) => [profile.id as string, profile.display_name as string | null]));
}

export async function fetchHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  const { data, error } = await getSupabase()
    .from('household_members')
    .select('user_id, role')
    .eq('household_id', householdId);

  if (error) {
    throw new Error(error.message);
  }

  const members = data ?? [];
  const profiles = await fetchProfiles(members.map((member) => member.user_id as string));

  return members.map((member) => ({
    user_id: member.user_id as string,
    role: member.role as 'owner' | 'member',
    display_name: profiles.get(member.user_id as string) ?? null,
  }));
}

export async function fetchAreaResponsibilities(householdId: string): Promise<AreaResponsibility[]> {
  const { data, error } = await getSupabase()
    .from('area_responsibilities')
    .select('id, area, user_id')
    .eq('household_id', householdId);

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const profiles = await fetchProfiles(rows.map((row) => row.user_id as string));

  return rows.map((row) => ({
    id: row.id as string,
    area: row.area as HouseholdArea,
    user_id: row.user_id as string,
    display_name: profiles.get(row.user_id as string) ?? null,
  }));
}

export async function setAreaResponsible(
  householdId: string,
  area: HouseholdArea,
  userId: string,
): Promise<void> {
  const { error } = await getSupabase().from('area_responsibilities').upsert(
    {
      household_id: householdId,
      area,
      user_id: userId,
    },
    { onConflict: 'household_id,area' },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function clearAreaResponsible(householdId: string, area: HouseholdArea): Promise<void> {
  const { error } = await getSupabase()
    .from('area_responsibilities')
    .delete()
    .eq('household_id', householdId)
    .eq('area', area);

  if (error) {
    throw new Error(error.message);
  }
}

export async function assignAllAreasToUser(householdId: string, userId: string): Promise<void> {
  const areas: HouseholdArea[] = ['finances', 'cleaning', 'organization', 'pantry'];
  const rows = areas.map((area) => ({
    household_id: householdId,
    area,
    user_id: userId,
  }));

  const { error } = await getSupabase().from('area_responsibilities').upsert(rows, {
    onConflict: 'household_id,area',
  });

  if (error) {
    throw new Error(error.message);
  }
}
