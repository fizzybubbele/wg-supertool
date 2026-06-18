import { Link, Stack } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { spacing, typography } from '@/constants/tokens';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function NotFoundScreen() {
  const colors = useThemeColors();

  return (
    <>
      <Stack.Screen options={{ title: 'Nicht gefunden' }} />
      <Screen style={styles.container}>
        <Text style={[styles.title, { color: colors.ink }]}>Diese Seite existiert nicht.</Text>
        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.accent }]}>Zur Startseite</Text>
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.title,
    fontSize: 20,
  },
  link: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  linkText: {
    ...typography.body,
    fontSize: 14,
  },
});
