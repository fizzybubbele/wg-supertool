const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase env vars. Copy .env.example to .env.local and run `supabase start`.',
    );
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  };
}

export function hasSupabaseConfig(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
