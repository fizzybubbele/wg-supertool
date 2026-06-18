import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { useCleaningTasks } from '@/features/cleaning/use-cleaning-tasks';

export default function CleaningScreen() {
  const { tasks, isLoading, toggleTask } = useCleaningTasks();

  return (
    <View style={styles.container}>
      <ScreenHeader area="cleaning" title="Putzplan" subtitle="Aufgaben für diese Woche" />

      {isLoading ? (
        <ActivityIndicator color="#2563eb" style={styles.loader} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.empty}>Noch keine Putzaufgaben angelegt.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => void toggleTask.mutateAsync({ id: item.id, done: !item.done })}>
              <View style={[styles.checkbox, item.done && styles.checkboxChecked]}>
                {item.done ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={[styles.rowText, item.done && styles.rowTextDone]}>{item.title}</Text>
            </Pressable>
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
    gap: 12,
    paddingVertical: 14,
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
});
