import { getServiceClient, jsonResponse } from '../_shared/google-calendar.ts';

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

async function sendExpoPush(messages: ExpoPushMessage[]) {
  if (messages.length === 0) {
    return;
  }

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const service = getServiceClient();
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const { data: events, error: eventsError } = await service
      .from('org_events')
      .select('id, title, starts_at, household_id')
      .is('deleted_at', null)
      .gte('starts_at', in24h.toISOString())
      .lt('starts_at', in25h.toISOString());

    if (eventsError) {
      throw new Error(eventsError.message);
    }

    const messages: ExpoPushMessage[] = [];

    for (const event of events ?? []) {
      const { data: members } = await service
        .from('household_members')
        .select('user_id')
        .eq('household_id', event.household_id);

      for (const member of members ?? []) {
        const { data: alreadySent } = await service
          .from('event_reminder_log')
          .select('id')
          .eq('org_event_id', event.id)
          .eq('user_id', member.user_id)
          .maybeSingle();

        if (alreadySent) {
          continue;
        }

        const { data: tokens } = await service
          .from('push_tokens')
          .select('expo_push_token')
          .eq('user_id', member.user_id);

        for (const tokenRow of tokens ?? []) {
          messages.push({
            to: tokenRow.expo_push_token,
            title: 'Termin morgen',
            body: event.title,
            data: { org_event_id: event.id },
          });
        }

        await service.from('event_reminder_log').insert({
          org_event_id: event.id,
          user_id: member.user_id,
        });
      }
    }

    await sendExpoPush(messages);
    return jsonResponse({ success: true, sent: messages.length });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' }, 500);
  }
});
