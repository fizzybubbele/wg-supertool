import { StyleSheet, Text, View } from 'react-native';

import { Inbox, iconSize } from '@/components/icons';
import { spacing, typography } from '@/constants/tokens';
import { useThemeColors } from '@/hooks/useThemeColors';

type EmptyStateProps = {
  message: string;
  hint?: string;
};

export function EmptyState({ message, hint }: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <Inbox size={iconSize.empty} color={colors.inkSubtle} strokeWidth={1.5} />
      <Text style={[styles.message, { color: colors.inkSubtle }]}>{message}</Text>
      {hint ? <Text style={[styles.hint, { color: colors.inkMuted }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
  },
  hint: {
    ...typography.caption,
    fontWeight: '400',
    textAlign: 'center',
  },
});
