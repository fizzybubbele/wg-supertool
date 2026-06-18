const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials':
    'E-Mail oder Passwort falsch. Neu hier? Oben auf „Registrieren“ wechseln.',
  'User already registered': 'Diese E-Mail ist bereits registriert. Bitte anmelden.',
  'Email not confirmed': 'Bitte bestätige zuerst deine E-Mail-Adresse.',
  'Failed to fetch':
    'Supabase nicht erreichbar. Läuft Docker? Dann `npx supabase start` ausführen.',
  'Database error saving new user':
    'Konto konnte nicht gespeichert werden. Bitte `npx supabase db reset` ausführen.',
};

export function translateAuthError(message: string): string {
  return AUTH_ERROR_MESSAGES[message] ?? message;
}
