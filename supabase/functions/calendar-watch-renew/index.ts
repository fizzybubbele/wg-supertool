import {
  getGoogleConfig,
  getServiceClient,
  jsonResponse,
  refreshGoogleAccessToken,
  setupGoogleWatch,
} from '../_shared/google-calendar.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!getGoogleConfig()) {
    return jsonResponse({ success: true, skipped: true });
  }

  try {
    const service = getServiceClient();
    const threshold = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: connections, error } = await service
      .from('calendar_connections')
      .select('*')
      .or(`watch_expires_at.is.null,watch_expires_at.lt.${threshold}`);

    if (error) {
      throw new Error(error.message);
    }

    let renewed = 0;

    for (const connection of connections ?? []) {
      const accessToken = await refreshGoogleAccessToken(connection.refresh_token);
      const watch = await setupGoogleWatch(accessToken, connection.calendar_id, connection.id);

      await service
        .from('calendar_connections')
        .update({
          watch_channel_id: watch.channelId,
          watch_resource_id: watch.resourceId,
          watch_expires_at: new Date(Number(watch.expiration)).toISOString(),
        })
        .eq('id', connection.id);

      renewed += 1;
    }

    return jsonResponse({ success: true, renewed });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' }, 500);
  }
});
