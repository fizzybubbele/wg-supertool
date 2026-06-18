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
import { usePantry } from '@/features/pantry/use-pantry';

export default function PantryScreen() {
  const { items, isLoading, addItem, deleteItem } = usePantry();
  const [newItem, setNewItem] = useState('');

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await addItem.mutateAsync(newItem.trim());
    setNewItem('');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader area="pantry" title="Vorrat" subtitle="Was ist gerade im Haus?" />

      <View style={styles.addRow}>
        <FormInput
          placeholder="Neuer Vorrat…"
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
            <Text style={styles.empty}>Noch nichts im Vorrat eingetragen.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.rowText}>{item.name}</Text>
                <Text style={styles.quantity}>
                  {item.quantity} {item.unit}
                </Text>
              </View>
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
    flex: 1,
  },
  rowText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '500',
  },
  quantity: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 2,
  },
  delete: {
    color: '#ef4444',
    fontSize: 18,
    paddingHorizontal: 8,
  },
});
