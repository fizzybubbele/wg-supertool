import * as WebBrowser from 'expo-web-browser';

import { getSupabase } from '@/lib/supabase';

export type CalendarConnection = {
  id: string;
  provider: string;
  calendarId: string;
  watchActive: boolean;
  lastSyncedAt: string | null;
  syncError: string | null;
};

async function invokeCalendarFunction<T>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await getSupabase().functions.invoke(functionName, { body });
  if (error) {
    throw new Error(error.message);
  }
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    throw new Error(String(data.error));
  }
  return data as T;
}

export async function fetchCalendarConnection(householdId: string): Promise<CalendarConnection | null> {
  const { data, error } = await getSupabase()
    .from('calendar_connections_public')
    .select('id, provider, calendar_id, watch_active, last_synced_at, sync_error')
    .eq('household_id', householdId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id as string,
    provider: data.provider as string,
    calendarId: data.calendar_id as string,
    watchActive: data.watch_active as boolean,
    lastSyncedAt: data.last_synced_at as string | null,
    syncError: data.sync_error as string | null,
  };
}

export async function connectGoogleCalendar(householdId: string): Promise<void> {
  const { auth_url } = await invokeCalendarFunction<{ auth_url: string }>('calendar-oauth', {
    action: 'authorize_url',
    household_id: householdId,
  });

  const result = await WebBrowser.openAuthSessionAsync(auth_url, 'wg-supertool://calendar-oauth');

  if (result.type !== 'success') {
    throw new Error('Google-Kalender-Verbindung abgebrochen');
  }
}

export async function disconnectGoogleCalendar(householdId: string): Promise<void> {
  await invokeCalendarFunction('calendar-oauth', {
    action: 'disconnect',
    household_id: householdId,
  });
}

export async function syncOrgEventToCalendar(
  eventId: string,
  action: 'upsert' | 'delete',
): Promise<void> {
  await invokeCalendarFunction('calendar-sync-outbound', { event_id: eventId, action });
}

export async function syncCalendarInbound(householdId: string): Promise<void> {
  await invokeCalendarFunction('calendar-webhook', {
    action: 'sync_now',
    household_id: householdId,
  });
}
