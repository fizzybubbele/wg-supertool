import { StyleSheet, View, type ViewProps } from 'react-native';

import { spacing } from '@/constants/tokens';
import { useThemeColors } from '@/hooks/useThemeColors';

type ScreenProps = ViewProps & {
  padded?: boolean;
};

export function Screen({ children, style, padded = true, ...props }: ScreenProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[styles.base, { backgroundColor: colors.surface }, padded && styles.padded, style]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  padded: {
    padding: spacing.md,
  },
});
