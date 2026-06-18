import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Screen } from '@/components/Screen';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function CalendarOAuthScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { success } = useLocalSearchParams<{ success?: string }>();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)/org');
    }, 300);
    return () => clearTimeout(timer);
  }, [router]);

  if (success === '0') {
    return <Redirect href="/(tabs)/org" />;
  }

  return (
    <Screen style={styles.centered}>
      <ActivityIndicator size="large" color={colors.accent} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
