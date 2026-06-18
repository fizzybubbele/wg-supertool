import { useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Screen } from '@/components/Screen';
import { spacing, typography } from '@/constants/tokens';
import { useHouseholds } from '@/features/household/use-household';
import { useThemeColors } from '@/hooks/useThemeColors';

type HouseholdSetupProps = {
  children: ReactNode;
};

export function HouseholdSetup({ children }: HouseholdSetupProps) {
  const colors = useThemeColors();
  const { activeHousehold, isLoading, createHousehold, isCreating, createError } = useHouseholds();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </Screen>
    );
  }

  if (activeHousehold) {
    return <>{children}</>;
  }

  const handleCreate = async () => {
    setError(null);

    if (!name.trim()) {
      setError('Bitte einen Namen für deine WG eingeben.');
      return;
    }

    try {
      await createHousehold(name.trim());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Haushalt konnte nicht erstellt werden.');
    }
  };

  return (
    <Screen style={styles.container}>
      <Text style={[styles.title, { color: colors.ink }]}>Willkommen!</Text>
      <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
        Lege deinen Haushalt an, um Finanzen, Putzplan, Organisation und Vorrat zu nutzen.
      </Text>

      {(error || createError) && (
        <View style={[styles.errorBox, { backgroundColor: colors.errorSoft, borderColor: colors.border }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error ?? (createError instanceof Error ? createError.message : 'Unbekannter Fehler')}
          </Text>
        </View>
      )}

      <FormInput placeholder="z.B. WG Sonnenschein" value={name} onChangeText={setName} />
      <Button
        label="Haushalt anlegen"
        fullWidth
        loading={isCreating}
        disabled={isCreating}
        onPress={() => void handleCreate()}
      />
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
