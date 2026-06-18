import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FormInput } from '@/components/FormInput';
import { X, iconSize } from '@/components/icons';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { spacing, typography } from '@/constants/tokens';
import { usePantry } from '@/features/pantry/use-pantry';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function PantryScreen() {
  const colors = useThemeColors();
  const { items, isLoading, addItem, deleteItem } = usePantry();
  const [newItem, setNewItem] = useState('');

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await addItem.mutateAsync(newItem.trim());
    setNewItem('');
  };

  return (
    <Screen>
      <ScreenHeader area="pantry" title="Vorrat" subtitle="Was ist gerade im Haus?" />

      <View style={styles.addRow}>
        <FormInput
          placeholder="Neuer Vorrat…"
          style={styles.addInput}
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={() => void handleAdd()}
        />
        <Button iconName="plus" onPress={() => void handleAdd()} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyState message="Der Vorrat ist leer." hint="Trage ein, was gerade im Haus ist." />
          }
          renderItem={({ item }) => (
            <View style={[styles.row, { borderBottomColor: colors.borderSubtle }]}>
              <View style={styles.rowMain}>
                <Text style={[styles.rowText, { color: colors.ink }]}>{item.name}</Text>
                <Text style={[styles.quantity, { color: colors.inkMuted }, typography.tabular]}>
                  {item.quantity} {item.unit}
                </Text>
              </View>
              <PressableScale
                style={styles.deleteHit}
                onPress={() => void deleteItem.mutateAsync(item.id)}>
                <X size={iconSize.rowAction} color={colors.error} strokeWidth={1.75} />
              </PressableScale>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  addRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  addInput: {
    flex: 1,
    marginBottom: 0,
  },
  loader: {
    marginTop: spacing.lg,
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingVertical: spacing.sm + spacing.xs,
  },
  rowMain: {
    flex: 1,
  },
  rowText: {
    ...typography.bodyMedium,
  },
  quantity: {
    ...typography.body,
    fontSize: 14,
    marginTop: 2,
  },
  deleteHit: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
});
