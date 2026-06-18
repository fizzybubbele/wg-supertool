import { getSupabase } from '@/lib/supabase';

export type InvitePreview = {
  householdId: string;
  householdName: string;
  expiresAt: string;
  isValid: boolean;
};

export async function createHouseholdInvite(householdId: string): Promise<string> {
  const { data, error } = await getSupabase().rpc('create_household_invite', {
    p_household_id: householdId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

export async function getInvitePreview(token: string): Promise<InvitePreview | null> {
  const { data, error } = await getSupabase().rpc('get_household_invite_preview', {
    p_token: token,
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = (data as Array<Record<string, unknown>> | null)?.[0];
  if (!row) {
    return null;
  }

  return {
    householdId: row.household_id as string,
    householdName: row.household_name as string,
    expiresAt: row.expires_at as string,
    isValid: row.is_valid as boolean,
  };
}

export async function acceptHouseholdInvite(token: string): Promise<string> {
  const { data, error } = await getSupabase().rpc('accept_household_invite', {
    p_token: token,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}
