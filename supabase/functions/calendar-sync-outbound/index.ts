import {
  getGoogleConfig,
  getServiceClient,
  googleEventToOrgPatch,
  jsonResponse,
  orgEventToGoogleEvent,
  refreshGoogleAccessToken,
} from '../_shared/google-calendar.ts';

async function getUserFromAuthHeader(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const userClient = (await import('https://esm.sh/@supabase/supabase-js@2.49.1')).createClient(
    supabaseUrl,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data } = await userClient.auth.getUser();
  return data.user;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    if (!getGoogleConfig()) {
      return jsonResponse({ success: true, skipped: true, reason: 'google_not_configured' });
    }

    const body = await req.json();
    const eventId = body.event_id as string;
    const action = body.action as 'upsert' | 'delete';

    const service = getServiceClient();
    const { data: event, error: eventError } = await service
      .from('org_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return jsonResponse({ error: 'Termin nicht gefunden' }, 404);
    }

    const { data: connection, error: connectionError } = await service
      .from('calendar_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('household_id', event.household_id)
      .eq('provider', 'google')
      .maybeSingle();

    if (connectionError || !connection) {
      return jsonResponse({ success: true, skipped: true, reason: 'no_connection' });
    }

    const accessToken = await refreshGoogleAccessToken(connection.refresh_token);
    const calendarId = encodeURIComponent(connection.calendar_id);

    if (action === 'delete') {
      if (event.external_event_id) {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(event.external_event_id)}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        if (!response.ok && response.status !== 404 && response.status !== 410) {
          throw new Error(await response.text());
        }
      }

      await service
        .from('calendar_connections')
        .update({ last_synced_at: new Date().toISOString(), sync_error: null })
        .eq('id', connection.id);

      return jsonResponse({ success: true });
    }

    const googleEvent = orgEventToGoogleEvent(event);
    const isUpdate = Boolean(event.external_event_id);
    const endpoint = isUpdate
      ? `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(event.external_event_id)}`
      : `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

    const response = await fetch(endpoint, {
      method: isUpdate ? 'PUT' : 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleEvent),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const saved = await response.json();

    await service
      .from('org_events')
      .update({
        external_provider: 'google',
        external_calendar_id: connection.calendar_id,
        external_event_id: saved.id,
        sync_source: 'app',
        synced_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    await service
      .from('calendar_connections')
      .update({ last_synced_at: new Date().toISOString(), sync_error: null })
      .eq('id', connection.id);

    return jsonResponse({ success: true, external_event_id: saved.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return jsonResponse({ error: message }, 500);
  }
});
