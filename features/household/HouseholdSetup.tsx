import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FormInput } from '@/components/FormInput';
import { useHouseholds } from '@/features/household/use-household';

type HouseholdSetupProps = {
  children: ReactNode;
};

export function HouseholdSetup({ children }: HouseholdSetupProps) {
  const { activeHousehold, isLoading, createHousehold, isCreating, createError } = useHouseholds();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
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
    <View style={styles.container}>
      <Text style={styles.title}>Willkommen!</Text>
      <Text style={styles.subtitle}>
        Lege deinen Haushalt an, um Finanzen, Putzplan, Organisation und Vorrat zu nutzen.
      </Text>

      {(error || createError) && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error ?? (createError instanceof Error ? createError.message : 'Unbekannter Fehler')}
          </Text>
        </View>
      )}

      <FormInput placeholder="z.B. WG Sonnenschein" value={name} onChangeText={setName} />
      <Pressable
        style={[styles.button, isCreating && styles.buttonDisabled]}
        disabled={isCreating}
        onPress={() => void handleCreate()}>
        {isCreating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Haushalt anlegen</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centered: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
  },
  errorText: {
    color: '#b91c1c',
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
