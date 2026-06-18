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
import { useOrgEvents } from '@/features/organization/use-org-events';

function formatDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

export default function OrganizationScreen() {
  const { events, isLoading, addEvent } = useOrgEvents();
  const [title, setTitle] = useState('');

  const handleAdd = async () => {
    if (!title.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    await addEvent.mutateAsync({ title: title.trim(), eventDate: today });
    setTitle('');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader area="organization" title="Organisation" subtitle="Termine und WG-Events" />

      <View style={styles.addRow}>
        <FormInput
          placeholder="Neuer Termin…"
          style={styles.addInput}
          value={title}
          onChangeText={setTitle}
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
          data={events}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.empty}>Noch keine Termine geplant.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.date}>{formatDate(item.event_date)}</Text>
              <Text style={styles.title}>{item.title}</Text>
              {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
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
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  date: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '600',
  },
  description: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
});
