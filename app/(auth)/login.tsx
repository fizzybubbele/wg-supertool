import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FormInput } from '@/components/FormInput';
import { useAuth } from '@/features/auth/AuthProvider';

const MIN_PASSWORD_LENGTH = 6;

export default function LoginScreen() {
  const { session, isLoading, isConfigured, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null,
  );

  if (!isConfigured) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Supabase nicht konfiguriert.{'\n\n'}
          1. .env.local anlegen{'\n'}
          2. npx supabase start{'\n'}
          3. npm start neu starten
        </Text>
      </View>
    );
  }

  if (!isLoading && session) {
    return <Redirect href="/(tabs)/finances" />;
  }

  const handleSubmit = async () => {
    setFeedback(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setFeedback({ type: 'error', message: 'Bitte E-Mail und Passwort eingeben.' });
      return;
    }

    if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      setFeedback({
        type: 'error',
        message: `Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen haben.`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const action = mode === 'signIn' ? signIn : signUp;
      const { error, session: nextSession } = await action(trimmedEmail, trimmedPassword);

      if (error) {
        setFeedback({ type: 'error', message: error.message });
        return;
      }

      if (nextSession) {
        setFeedback({ type: 'success', message: 'Erfolgreich angemeldet.' });
        return;
      }

      if (mode === 'signUp') {
        setFeedback({
          type: 'success',
          message: 'Konto erstellt. Du kannst dich jetzt anmelden.',
        });
        setMode('signIn');
      }
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : 'Verbindung zu Supabase fehlgeschlagen. Läuft Docker und `npx supabase start`?';
      setFeedback({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setFeedback(null);
    setMode((current) => (current === 'signIn' ? 'signUp' : 'signIn'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WG-SuperTool</Text>
      <Text style={styles.subtitle}>
        {mode === 'signIn' ? 'Bei deinem Haushalt anmelden' : 'Neues Konto erstellen'}
      </Text>

      {feedback ? (
        <View
          style={[
            styles.feedbackBox,
            feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess,
          ]}>
          <Text
            style={[
              styles.feedbackText,
              feedback.type === 'error' ? styles.feedbackTextError : styles.feedbackTextSuccess,
            ]}>
            {feedback.message}
          </Text>
        </View>
      ) : null}

      <FormInput
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="E-Mail"
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
        {...(Platform.OS === 'web'
          ? { autoCorrect: false, inputMode: 'email' as const, spellCheck: false }
          : {})}
      />

      <FormInput
        autoCapitalize="none"
        autoComplete={mode === 'signUp' ? 'new-password' : 'password'}
        placeholder="Passwort"
        secureTextEntry
        textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
        value={password}
        onChangeText={setPassword}
        {...(Platform.OS === 'web' ? { autoCorrect: false, spellCheck: false } : {})}
      />

      {mode === 'signUp' ? (
        <Text style={styles.hint}>Mindestens {MIN_PASSWORD_LENGTH} Zeichen</Text>
      ) : null}

      <Pressable
        style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
        disabled={isSubmitting}
        onPress={() => void handleSubmit()}>
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>
            {mode === 'signIn' ? 'Anmelden' : 'Registrieren'}
          </Text>
        )}
      </Pressable>

      <Pressable style={styles.linkButton} onPress={switchMode}>
        <Text style={styles.linkText}>
          {mode === 'signIn'
            ? 'Noch kein Konto? Registrieren'
            : 'Bereits registriert? Anmelden'}
        </Text>
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
    paddingHorizontal: 24,
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
    marginBottom: 24,
    textAlign: 'center',
  },
  hint: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 16,
    marginTop: -8,
  },
  feedbackBox: {
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  feedbackError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 14,
    textAlign: 'center',
  },
  feedbackTextError: {
    color: '#b91c1c',
  },
  feedbackTextSuccess: {
    color: '#15803d',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkText: {
    color: '#2563eb',
    fontSize: 16,
    textAlign: 'center',
  },
});
