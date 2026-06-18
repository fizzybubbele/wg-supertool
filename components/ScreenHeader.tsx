import { StyleSheet, Text, View } from 'react-native';

import { AreaResponsible } from '@/components/AreaResponsible';
import { AreaDot } from '@/components/icons';
import { spacing, typography } from '@/constants/tokens';
import { useHouseholds } from '@/features/household/use-household';
import type { HouseholdArea } from '@/features/responsibilities/areas';
import { AREA_LABELS } from '@/features/responsibilities/areas';
import { useThemeColors } from '@/hooks/useThemeColors';

type ScreenHeaderProps = {
  area: HouseholdArea;
  title: string;
  subtitle?: string;
  showResponsible?: boolean;
};

export function ScreenHeader({ area, title, subtitle, showResponsible = true }: ScreenHeaderProps) {
  const colors = useThemeColors();
  const { activeHousehold } = useHouseholds();

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <AreaDot area={area} />
        <Text style={[styles.areaLabel, { color: colors.inkMuted }]}>{AREA_LABELS[area]}</Text>
      </View>
      {activeHousehold ? (
        <Text style={[styles.household, { color: colors.inkSubtle }]}>{activeHousehold.name}</Text>
      ) : null}
      <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.inkMuted }]}>{subtitle}</Text> : null}
      {showResponsible ? <AreaResponsible area={area} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
    minHeight: 16,
  },
  household: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  areaLabel: {
    ...typography.label,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.xs,
  },
});
