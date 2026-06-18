import { StyleSheet, Text, View } from 'react-native';

import { AreaResponsible } from '@/components/AreaResponsible';
import { useHouseholds } from '@/features/household/use-household';
import type { HouseholdArea } from '@/features/responsibilities/areas';
import { AREA_LABELS } from '@/features/responsibilities/areas';

type ScreenHeaderProps = {
  area: HouseholdArea;
  title: string;
  subtitle?: string;
  showResponsible?: boolean;
};

export function ScreenHeader({ area, title, subtitle, showResponsible = true }: ScreenHeaderProps) {
  const { activeHousehold } = useHouseholds();

  return (
    <View style={styles.container}>
      {activeHousehold ? <Text style={styles.household}>{activeHousehold.name}</Text> : null}
      <Text style={styles.areaLabel}>{AREA_LABELS[area]}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {showResponsible ? <AreaResponsible area={area} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  household: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  areaLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 15,
    marginTop: 4,
  },
});
