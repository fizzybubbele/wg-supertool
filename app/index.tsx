import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';

export default function Index() {
  const { session, isLoading, isConfigured } = useAuth();

  if (!isConfigured) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="mb-2 text-xl font-bold text-gray-900">Supabase nicht konfiguriert</Text>
        <Text className="text-center text-base text-gray-500">
          Kopiere .env.example nach .env.local, starte Docker und führe `supabase start` aus.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/finances" />;
  }

  return <Redirect href="/(auth)/login" />;
}
