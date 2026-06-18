import { SymbolView } from 'expo-symbols';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';
import { HouseholdSetup } from '@/features/household/HouseholdSetup';

export default function TabLayout() {
  const { session, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <HouseholdSetup>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#2563eb',
          headerRight: () => (
            <Pressable style={styles.signOut} onPress={() => void signOut()}>
              <Text style={styles.signOutText}>Abmelden</Text>
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
          name="responsibilities"
          options={{
            title: 'Zuständig',
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{ ios: 'person.2', android: 'group', web: 'group' }}
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
    </HouseholdSetup>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  signOut: {
    marginRight: 16,
  },
  signOutText: {
    color: '#2563eb',
    fontSize: 14,
  },
});
