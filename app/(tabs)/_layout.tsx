import { TabIcon } from '@/components/icons/TabIcon';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { spacing } from '@/constants/tokens';
import { useAuth } from '@/features/auth/AuthProvider';
import { HouseholdSetup } from '@/features/household/HouseholdSetup';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function TabLayout() {
  const colors = useThemeColors();
  const { session, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </Screen>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <HouseholdSetup>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.inkSubtle,
          tabBarStyle: [styles.tabBar, { backgroundColor: colors.surfaceRaised, borderTopColor: colors.border }],
          headerStyle: { backgroundColor: colors.surfaceRaised },
          headerTitleStyle: { color: colors.ink, fontWeight: '600' },
          headerTintColor: colors.ink,
          animation: 'none',
          headerRight: () => (
            <Button label="Abmelden" variant="ghost" onPress={() => void signOut()} style={styles.signOut} />
          ),
        }}>
        <Tabs.Screen
          name="finances"
          options={{
            title: 'Finanzen',
            tabBarIcon: ({ color }) => <TabIcon name="coin" color={color} />,
          }}
        />
        <Tabs.Screen
          name="cleaning"
          options={{
            title: 'Putzplan',
            tabBarIcon: ({ color }) => <TabIcon name="sparkle" color={color} />,
          }}
        />
        <Tabs.Screen
          name="org"
          options={{
            title: 'Organisation',
            tabBarIcon: ({ color }) => <TabIcon name="calendar" color={color} />,
          }}
        />
        <Tabs.Screen
          name="responsibilities"
          options={{
            title: 'Zuständig',
            tabBarIcon: ({ color }) => <TabIcon name="users" color={color} />,
          }}
        />
        <Tabs.Screen
          name="pantry"
          options={{
            title: 'Vorrat',
            tabBarIcon: ({ color }) => <TabIcon name="package" color={color} />,
          }}
        />
      </Tabs>
    </HouseholdSetup>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  signOut: {
    marginRight: spacing.md,
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
