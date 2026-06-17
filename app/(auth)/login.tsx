import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';

export default function LoginScreen() {
  const { session, isLoading, isConfigured, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');

  if (!isConfigured) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-base text-gray-500">
          Supabase ist noch nicht konfiguriert. Siehe README für Setup-Schritte.
        </Text>
      </View>
    );
  }

  if (!isLoading && session) {
    return <Redirect href="/(tabs)/finances" />;
  }

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Fehler', 'Bitte E-Mail und Passwort eingeben.');
      return;
    }

    setIsSubmitting(true);

    const action = mode === 'signIn' ? signIn : signUp;
    const { error } = await action(email.trim(), password);

    setIsSubmitting(false);

    if (error) {
      Alert.alert('Fehler', error.message);
    } else if (mode === 'signUp') {
      Alert.alert('Konto erstellt', 'Du kannst dich jetzt anmelden.');
      setMode('signIn');
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-2 text-center text-3xl font-bold text-gray-900">WG-SuperTool</Text>
      <Text className="mb-8 text-center text-base text-gray-500">
        {mode === 'signIn' ? 'Bei deinem Haushalt anmelden' : 'Neues Konto erstellen'}
      </Text>

      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        className="mb-4 rounded-xl border border-gray-200 px-4 py-3 text-base"
        keyboardType="email-address"
        placeholder="E-Mail"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        autoCapitalize="none"
        autoComplete="password"
        className="mb-6 rounded-xl border border-gray-200 px-4 py-3 text-base"
        placeholder="Passwort"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        className="mb-4 items-center rounded-xl bg-blue-600 py-4"
        disabled={isSubmitting}
        onPress={() => void handleSubmit()}>
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-base font-semibold text-white">
            {mode === 'signIn' ? 'Anmelden' : 'Registrieren'}
          </Text>
        )}
      </Pressable>

      <Pressable onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}>
        <Text className="text-center text-base text-blue-600">
          {mode === 'signIn'
            ? 'Noch kein Konto? Registrieren'
            : 'Bereits registriert? Anmelden'}
        </Text>
      </Pressable>
    </View>
  );
}
