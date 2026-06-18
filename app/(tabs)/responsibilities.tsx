import { StyleSheet, Text, View } from 'react-native';

import { AreaResponsible } from '@/components/AreaResponsible';
import { ScreenHeader } from '@/components/ScreenHeader';
import { HOUSEHOLD_AREAS, AREA_LABELS } from '@/features/responsibilities/areas';
import { useAreaResponsibilities } from '@/features/responsibilities/use-area-responsibilities';

export default function ResponsibilitiesScreen() {
  const { isLoading } = useAreaResponsibilities();

  return (
    <View style={styles.container}>
      <ScreenHeader
        area="organization"
        title="Zuständigkeiten"
        subtitle="Wer kümmert sich um welchen Bereich?"
        showResponsible={false}
      />

      {isLoading ? (
        <Text style={styles.loading}>Lade Zuständigkeiten…</Text>
      ) : (
        HOUSEHOLD_AREAS.map((area) => (
          <View key={area} style={styles.card}>
            <Text style={styles.areaTitle}>{AREA_LABELS[area]}</Text>
            <AreaResponsible area={area} />
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 16,
  },
  loading: {
    color: '#6b7280',
    marginTop: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  areaTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
});
