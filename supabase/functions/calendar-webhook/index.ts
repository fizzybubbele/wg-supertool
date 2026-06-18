import {
  getServiceClient,
  googleEventToOrgPatch,
  jsonResponse,
  refreshGoogleAccessToken,
  setupGoogleWatch,
} from '../_shared/google-calendar.ts';

async function syncConnection(connectionId: string) {
  const service = getServiceClient();
  const { data: connection, error } = await service
    .from('calendar_connections')
    .select('*')
    .eq('id', connectionId)
    .single();

  if (error || !connection) {
    throw new Error(error?.message ?? 'Verbindung nicht gefunden');
  }

  const accessToken = await refreshGoogleAccessToken(connection.refresh_token);
  const calendarId = encodeURIComponent(connection.calendar_id);

  const listUrl = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
  );
  listUrl.searchParams.set('singleEvents', 'true');
  listUrl.searchParams.set('showDeleted', 'true');
  listUrl.searchParams.set('timeMin', new Date(Date.now() - 90 * 86400000).toISOString());

  const response = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = await response.json();
  const items = (payload.items ?? []) as Array<Record<string, unknown>>;

  for (const item of items) {
    const externalId = item.id as string;
    const patch = googleEventToOrgPatch(item as never);

    const { data: existing } = await service
      .from('org_events')
      .select('id, updated_at')
      .eq('household_id', connection.household_id)
      .eq('external_event_id', externalId)
      .maybeSingle();

    if (existing) {
      if (patch.deleted_at) {
        await service.from('org_events').update({ deleted_at: patch.deleted_at }).eq('id', existing.id);
        continue;
      }

      await service
        .from('org_events')
        .update(patch)
        .eq('id', existing.id);
      continue;
    }

    if (patch.deleted_at) {
      continue;
    }

    await service.from('org_events').insert({
      household_id: connection.household_id,
      ...patch,
    });
  }

  await service
    .from('calendar_connections')
    .update({
      last_synced_at: new Date().toISOString(),
      sync_error: null,
    })
    .eq('id', connection.id);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const service = getServiceClient();

    if (req.method === 'POST') {
      const channelToken = req.headers.get('X-Goog-Channel-Token');
      const resourceState = req.headers.get('X-Goog-Resource-State');

      if (channelToken) {
        if (resourceState === 'sync') {
          return jsonResponse({ success: true });
        }
        await syncConnection(channelToken);
        return jsonResponse({ success: true });
      }

      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      const body = await req.json();
      if (body.action === 'sync_now') {
        const householdId = body.household_id as string;
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const userClient = (await import('https://esm.sh/@supabase/supabase-js@2.49.1')).createClient(
          supabaseUrl,
          Deno.env.get('SUPABASE_ANON_KEY')!,
          { global: { headers: { Authorization: authHeader } } },
        );
        const { data: authData } = await userClient.auth.getUser();
        if (!authData.user) {
          return jsonResponse({ error: 'Unauthorized' }, 401);
        }

        const { data: connection } = await service
          .from('calendar_connections')
          .select('id')
          .eq('household_id', householdId)
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (!connection) {
          return jsonResponse({ success: true, skipped: true });
        }

        await syncConnection(connection.id);
        return jsonResponse({ success: true });
      }
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' }, 500);
  }
});
