import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { spacing, typography } from '@/constants/tokens';
import { useAuth } from '@/features/auth/AuthProvider';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function Index() {
  const colors = useThemeColors();
  const { session, isLoading, isConfigured } = useAuth();

  if (!isConfigured) {
    return (
      <Screen style={styles.centered}>
        <Text style={[styles.title, { color: colors.ink }]}>Supabase nicht konfiguriert</Text>
        <Text style={[styles.body, { color: colors.inkMuted }]}>
          Kopiere .env.example nach .env.local, starte Docker und führe `supabase start` aus.
        </Text>
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </Screen>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/finances" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    textAlign: 'center',
  },
});
