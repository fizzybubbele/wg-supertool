const APP_SCHEME = 'wg-supertool';
const APP_NAME = 'WG-SuperTool';

export function buildInviteUrl(token: string): string {
  const webBase = process.env.EXPO_PUBLIC_APP_URL;
  if (webBase) {
    return `${webBase.replace(/\/$/, '')}/invite/${token}`;
  }
  return `${APP_SCHEME}://invite/${token}`;
}

export function buildOAuthRedirectUrl(): string {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL fehlt');
  }
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/calendar-oauth/callback`;
}

export function getAppName(): string {
  return APP_NAME;
}
