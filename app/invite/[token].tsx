import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { spacing, typography } from '@/constants/tokens';
import { useAuth } from '@/features/auth/AuthProvider';
import { acceptHouseholdInvite, getInvitePreview } from '@/features/integrations/invite-service';
import { useAppStore } from '@/features/app/app-store';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function InviteScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, isLoading: authLoading } = useAuth();
  const { token } = useLocalSearchParams<{ token: string }>();
  const setActiveHouseholdId = useAppStore((state) => state.setActiveHouseholdId);

  const [householdName, setHouseholdName] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Einladungslink ungültig');
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const preview = await getInvitePreview(token);
        if (!preview) {
          setError('Einladung nicht gefunden');
          return;
        }
        setHouseholdName(preview.householdName);
        setIsValid(preview.isValid);
        if (!preview.isValid) {
          setError('Diese Einladung ist abgelaufen oder wurde bereits verwendet.');
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Einladung konnte nicht geladen werden');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (authLoading || loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </Screen>
    );
  }

  if (!session) {
    return <Redirect href={`/(auth)/login?redirect=/invite/${token}`} />;
  }

  const handleJoin = async () => {
    if (!token) return;
    setJoining(true);
    setError(null);
    try {
      const householdId = await acceptHouseholdInvite(token);
      setActiveHouseholdId(householdId);
      void queryClient.invalidateQueries({ queryKey: ['households'] });
      router.replace('/(tabs)/org');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Beitritt fehlgeschlagen');
    } finally {
      setJoining(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <Text style={[styles.title, { color: colors.ink }]}>Haushalt beitreten</Text>
      {householdName ? (
        <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
          Du wurdest eingeladen, <Text style={{ fontWeight: '600' }}>{householdName}</Text> beizutreten.
        </Text>
      ) : null}

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: colors.errorSoft, borderColor: colors.border }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : null}

      {isValid ? (
        <Button
          label="Haushalt beitreten"
          fullWidth
          loading={joining}
          disabled={joining}
          onPress={() => void handleJoin()}
        />
      ) : (
        <Button label="Zur App" variant="secondary" fullWidth onPress={() => router.replace('/(tabs)/org')} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.display,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  errorBox: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
    padding: spacing.sm + spacing.xs,
  },
  errorText: {
    textAlign: 'center',
  },
});
