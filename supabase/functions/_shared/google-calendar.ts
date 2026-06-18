import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function getServiceClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, serviceRoleKey);
}

export function getGoogleConfig() {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');

  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }

  return { clientId, clientSecret, redirectUri };
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<string> {
  const config = getGoogleConfig();
  if (!config) {
    throw new Error('Google OAuth ist nicht konfiguriert');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = await response.json();
  return payload.access_token as string;
}

export type GoogleCalendarEvent = {
  id?: string;
  summary?: string;
  description?: string;
  start?: { date?: string; dateTime?: string; timeZone?: string };
  end?: { date?: string; dateTime?: string; timeZone?: string };
  updated?: string;
  status?: string;
};

export function orgEventToGoogleEvent(event: {
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
}): GoogleCalendarEvent {
  const startDate = event.starts_at.slice(0, 10);
  if (event.all_day) {
    const endDate = event.ends_at?.slice(0, 10) ?? startDate;
    return {
      summary: event.title,
      description: event.description ?? undefined,
      start: { date: startDate },
      end: { date: endDate },
    };
  }

  return {
    summary: event.title,
    description: event.description ?? undefined,
    start: { dateTime: event.starts_at, timeZone: 'Europe/Berlin' },
    end: { dateTime: event.ends_at ?? event.starts_at, timeZone: 'Europe/Berlin' },
  };
}

export function googleEventToOrgPatch(event: GoogleCalendarEvent) {
  const allDay = Boolean(event.start?.date);
  const startsAt = event.start?.dateTime ?? `${event.start?.date}T12:00:00.000Z`;
  const endsAt = event.end?.dateTime ?? (event.end?.date ? `${event.end.date}T12:00:00.000Z` : null);

  return {
    title: event.summary ?? 'Termin',
    description: event.description ?? null,
    event_date: startsAt.slice(0, 10),
    starts_at: startsAt,
    ends_at: endsAt,
    all_day: allDay,
    external_provider: 'google',
    external_event_id: event.id ?? null,
    sync_source: 'google',
    synced_at: new Date().toISOString(),
    deleted_at: event.status === 'cancelled' ? new Date().toISOString() : null,
  };
}

export async function setupGoogleWatch(
  accessToken: string,
  calendarId: string,
  connectionId: string,
): Promise<{ channelId: string; resourceId: string; expiration: string }> {
  const channelId = crypto.randomUUID();
  const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/calendar-webhook`;

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/watch`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: channelId,
        type: 'web_hook',
        address: webhookUrl,
        token: connectionId,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = await response.json();
  return {
    channelId: payload.id as string,
    resourceId: payload.resourceId as string,
    expiration: payload.expiration as string,
  };
}
