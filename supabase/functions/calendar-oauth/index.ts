import {
  corsHeaders,
  getGoogleConfig,
  getServiceClient,
  jsonResponse,
  setupGoogleWatch,
} from '../_shared/google-calendar.ts';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'].join(' ');

function encodeState(payload: Record<string, string>) {
  return btoa(JSON.stringify(payload));
}

function decodeState(state: string) {
  return JSON.parse(atob(state)) as Record<string, string>;
}

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
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);

  if (req.method === 'GET' && url.pathname.endsWith('/callback')) {
    return handleOAuthCallback(url);
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await req.json();
    const action = body.action as string;
    const householdId = body.household_id as string | undefined;

    if (action === 'authorize_url') {
      if (!householdId) {
        return jsonResponse({ error: 'household_id fehlt' }, 400);
      }

      const config = getGoogleConfig();
      if (!config) {
        return jsonResponse(
          {
            error:
              'Google OAuth nicht konfiguriert. Setze GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET und GOOGLE_REDIRECT_URI.',
          },
          503,
        );
      }

      const state = encodeState({ user_id: user.id, household_id: householdId });
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', config.clientId);
      authUrl.searchParams.set('redirect_uri', config.redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', SCOPES);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', state);

      return jsonResponse({ auth_url: authUrl.toString() });
    }

    if (action === 'disconnect') {
      if (!householdId) {
        return jsonResponse({ error: 'household_id fehlt' }, 400);
      }

      const service = getServiceClient();
      await service
        .from('calendar_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('household_id', householdId)
        .eq('provider', 'google');

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: 'Unbekannte Aktion' }, 400);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' }, 500);
  }
});

async function handleOAuthCallback(url: URL) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  if (oauthError || !code || !state) {
    return Response.redirect('wg-supertool://calendar-oauth?success=0', 302);
  }

  try {
    const config = getGoogleConfig();
    if (!config) {
      return Response.redirect('wg-supertool://calendar-oauth?success=0', 302);
    }

    const { user_id, household_id } = decodeState(state);

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(await tokenResponse.text());
    }

    const tokens = await tokenResponse.json();
    const refreshToken = tokens.refresh_token as string | undefined;
    if (!refreshToken) {
      throw new Error('Kein refresh_token von Google erhalten');
    }

    const service = getServiceClient();
    const { data: connection, error } = await service
      .from('calendar_connections')
      .upsert(
        {
          user_id,
          household_id,
          provider: 'google',
          calendar_id: 'primary',
          refresh_token: refreshToken,
          sync_error: null,
        },
        { onConflict: 'user_id,household_id,provider' },
      )
      .select('id, calendar_id, refresh_token')
      .single();

    if (error || !connection) {
      throw new Error(error?.message ?? 'Verbindung konnte nicht gespeichert werden');
    }

    const accessToken = tokens.access_token as string;
    const watch = await setupGoogleWatch(accessToken, connection.calendar_id, connection.id);

    await service
      .from('calendar_connections')
      .update({
        watch_channel_id: watch.channelId,
        watch_resource_id: watch.resourceId,
        watch_expires_at: new Date(Number(watch.expiration)).toISOString(),
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', connection.id);

    return Response.redirect('wg-supertool://calendar-oauth?success=1', 302);
  } catch {
    return Response.redirect('wg-supertool://calendar-oauth?success=0', 302);
  }
}
