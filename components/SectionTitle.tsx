import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { spacing, typography } from '@/constants/tokens';
import { useThemeColors } from '@/hooks/useThemeColors';

type SectionTitleProps = {
  title: string;
  style?: StyleProp<TextStyle>;
};

export function SectionTitle({ title, style }: SectionTitleProps) {
  const colors = useThemeColors();

  return <Text style={[styles.title, { color: colors.ink }, style]}>{title}</Text>;
}

const styles = StyleSheet.create({
  title: {
    ...typography.section,
    marginBottom: spacing.sm + spacing.xs,
  },
});
