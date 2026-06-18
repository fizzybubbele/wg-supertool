import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { spacing, typography } from '@/constants/tokens';
import { translateAuthError } from '@/features/auth/auth-errors';
import { useAuth } from '@/features/auth/AuthProvider';
import { useThemeColors } from '@/hooks/useThemeColors';

const MIN_PASSWORD_LENGTH = 6;
const DEMO_EMAIL = 'demo@wg-supertool.de';
const DEMO_PASSWORD = 'test123456';

export default function LoginScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { session, isLoading, isConfigured, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null,
  );

  if (!isConfigured) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.surface }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Supabase nicht konfiguriert.{'\n\n'}
          1. .env.local anlegen{'\n'}
          2. npx supabase start{'\n'}
          3. npm start neu starten
        </Text>
      </View>
    );
  }

  if (!isLoading && session) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.ink }]}>Bereits angemeldet</Text>
        <Text style={[styles.subtitle, { color: colors.inkMuted }]}>{session.user.email}</Text>
        <Text style={[styles.hint, { color: colors.inkSubtle }]}>
          Du bist schon eingeloggt. Melde dich ab, um ein anderes Konto zu nutzen oder dich neu zu
          registrieren.
        </Text>
        <Button label="Zur App" fullWidth onPress={() => router.replace('/(tabs)/finances')} />
        <Button label="Abmelden" variant="ghost" fullWidth onPress={() => void signOut()} />
      </View>
    );
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
        setFeedback({ type: 'error', message: translateAuthError(error.message) });
        return;
      }

      if (nextSession) {
        router.replace('/(tabs)/finances');
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
          ? translateAuthError(cause.message)
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
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.ink }]}>WG-SuperTool</Text>
      <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
        {mode === 'signIn' ? 'Bei deinem Haushalt anmelden' : 'Neues Konto erstellen'}
      </Text>

      {feedback ? (
        <View
          style={[
            styles.feedbackBox,
            feedback.type === 'error'
              ? { backgroundColor: colors.errorSoft, borderColor: '#FECACA' }
              : { backgroundColor: colors.successSoft, borderColor: '#BBF7D0' },
          ]}>
          <Text
            style={[
              styles.feedbackText,
              { color: feedback.type === 'error' ? colors.error : colors.success },
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
        enterKeyHint="done"
        placeholder="Passwort"
        returnKeyType="done"
        secureTextEntry
        textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={() => void handleSubmit()}
        {...(Platform.OS === 'web' ? { autoCorrect: false, spellCheck: false } : {})}
      />

      {mode === 'signUp' ? (
        <Text style={[styles.hint, { color: colors.inkSubtle }]}>
          Mindestens {MIN_PASSWORD_LENGTH} Zeichen
        </Text>
      ) : null}

      <Button
        label={mode === 'signIn' ? 'Anmelden' : 'Registrieren'}
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
        onPress={() => void handleSubmit()}
      />

      <Button
        label={mode === 'signIn' ? 'Noch kein Konto? Registrieren' : 'Bereits registriert? Anmelden'}
        variant="ghost"
        fullWidth
        onPress={switchMode}
      />

      {__DEV__ ? (
        <Button
          label={`Demo-Login: ${DEMO_EMAIL}`}
          variant="secondary"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={() => {
            setFeedback(null);
            setMode('signIn');
            setEmail(DEMO_EMAIL);
            setPassword(DEMO_PASSWORD);
            void (async () => {
              setIsSubmitting(true);
              try {
                const { error, session: nextSession } = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
                if (error) {
                  setFeedback({ type: 'error', message: translateAuthError(error.message) });
                  return;
                }
                if (nextSession) {
                  router.replace('/(tabs)/finances');
                }
              } catch (cause) {
                const message =
                  cause instanceof Error
                    ? translateAuthError(cause.message)
                    : 'Verbindung zu Supabase fehlgeschlagen. Läuft Docker und `npx supabase start`?';
                setFeedback({ type: 'error', message });
              } finally {
                setIsSubmitting(false);
              }
            })();
          }}
          style={styles.demoButton}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.display,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  hint: {
    ...typography.body,
    fontSize: 14,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
    textAlign: 'center',
  },
  feedbackBox: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
  },
  feedbackText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  demoButton: {
    marginTop: spacing.lg,
  },
});
