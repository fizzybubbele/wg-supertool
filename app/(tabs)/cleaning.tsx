import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { CheckboxRow } from '@/components/CheckboxRow';
import { EmptyState } from '@/components/EmptyState';
import { FormInput } from '@/components/FormInput';
import { memberLabel, MemberPickerDrawer } from '@/components/MemberPickerDrawer';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { spacing } from '@/constants/tokens';
import { useCleaningTasks } from '@/features/cleaning/use-cleaning-tasks';
import { useAreaResponsibilities } from '@/features/responsibilities/use-area-responsibilities';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function CleaningScreen() {
  const colors = useThemeColors();
  const { tasks, isLoading, toggleTask, assignTask, clearAssignee, addTask, deleteTask } =
    useCleaningTasks();
  const { members } = useAreaResponsibilities();
  const [newTask, setNewTask] = useState('');
  const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null);

  const assigningTask = tasks.find((task) => task.id === assigningTaskId) ?? null;

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    await addTask.mutateAsync(newTask.trim());
    setNewTask('');
  };

  const isUpdating =
    assignTask.isPending || clearAssignee.isPending || addTask.isPending || deleteTask.isPending;

  return (
    <Screen>
      <ScreenHeader area="cleaning" title="Putzplan" subtitle="Wer macht was?" />

      <View style={styles.addRow}>
        <FormInput
          value={newTask}
          onChangeText={setNewTask}
          placeholder="Neue Aufgabe"
          returnKeyType="done"
          onSubmitEditing={() => void handleAdd()}
          style={styles.addInput}
        />
        <Button label="Hinzufügen" onPress={() => void handleAdd()} disabled={!newTask.trim()} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyState
              message="Noch keine Putzaufgaben."
              hint="Lege oben die erste Aufgabe an und weise sie einer Person zu."
            />
          }
          renderItem={({ item }) => (
            <CheckboxRow
              label={item.title}
              checked={item.done}
              assigneeLabel={
                item.assigned_to
                  ? memberLabel(item.assignee_name, item.assigned_to)
                  : null
              }
              onAssignPress={() => setAssigningTaskId(item.id)}
              onToggle={() => void toggleTask.mutateAsync({ id: item.id, done: !item.done })}
              onDelete={() => void deleteTask.mutateAsync(item.id)}
            />
          )}
        />
      )}

      <MemberPickerDrawer
        visible={assigningTaskId !== null}
        onClose={() => setAssigningTaskId(null)}
        title="Aufgabe zuweisen"
        subtitle={assigningTask?.title}
        members={members}
        selectedUserId={assigningTask?.assigned_to}
        isUpdating={isUpdating}
        onAssign={(userId) => assignTask.mutateAsync({ id: assigningTaskId!, userId })}
        onClear={
          assigningTask?.assigned_to
            ? () => clearAssignee.mutateAsync(assigningTaskId!)
            : undefined
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  addRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  addInput: {
    flex: 1,
    marginBottom: 0,
  },
  loader: {
    marginTop: spacing.lg,
  },
});
