import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FormInput } from '@/components/FormInput';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useShoppingList } from '@/features/finances/use-shopping-list';

export default function FinancesScreen() {
  const { items, isLoading, addItem, toggleItem, deleteItem } = useShoppingList();
  const [newItem, setNewItem] = useState('');

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await addItem.mutateAsync(newItem.trim());
    setNewItem('');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        area="finances"
        title="Einkaufsliste"
        subtitle="Gemeinsame Liste für den nächsten Einkauf"
      />

      <View style={styles.addRow}>
        <FormInput
          placeholder="Neuer Artikel…"
          style={styles.addInput}
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={() => void handleAdd()}
        />
        <Pressable style={styles.addButton} onPress={() => void handleAdd()}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#2563eb" style={styles.loader} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.empty}>Noch keine Einträge – füge etwas hinzu.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Pressable
                style={styles.rowMain}
                onPress={() => void toggleItem.mutateAsync({ id: item.id, checked: !item.checked })}>
                <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                  {item.checked ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <Text style={[styles.rowText, item.checked && styles.rowTextDone]}>{item.name}</Text>
              </Pressable>
              <Pressable onPress={() => void deleteItem.mutateAsync(item.id)}>
                <Text style={styles.delete}>✕</Text>
              </Pressable>
            </View>
          )}
        />
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
  addRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  addInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  loader: {
    marginTop: 24,
  },
  empty: {
    color: '#9ca3af',
    marginTop: 24,
    textAlign: 'center',
  },
  row: {
    alignItems: 'center',
    borderBottomColor: '#f3f4f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  rowMain: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#d1d5db',
    borderRadius: 6,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  rowText: {
    color: '#111827',
    fontSize: 16,
  },
  rowTextDone: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  delete: {
    color: '#ef4444',
    fontSize: 18,
    paddingHorizontal: 8,
  },
});
