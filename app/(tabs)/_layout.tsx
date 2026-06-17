import { SymbolView } from 'expo-symbols';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';

export default function TabLayout() {
  const { session, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        headerRight: () => (
          <Pressable className="mr-4" onPress={() => void signOut()}>
            <Text className="text-sm text-blue-600">Abmelden</Text>
          </Pressable>
        ),
      }}>
      <Tabs.Screen
        name="finances"
        options={{
          title: 'Finanzen',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'eurosign.circle', android: 'paid', web: 'paid' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cleaning"
        options={{
          title: 'Putzplan',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'sparkles', android: 'cleaning_services', web: 'cleaning_services' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="org"
        options={{
          title: 'Organisation',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'calendar', android: 'event', web: 'event' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Vorrat',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'refrigerator', android: 'kitchen', web: 'kitchen' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
