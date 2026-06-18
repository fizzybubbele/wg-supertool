import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useHouseholds } from '@/features/household/use-household';
import type { HouseholdArea } from '@/features/responsibilities/areas';
import { useAreaResponsibilities } from '@/features/responsibilities/use-area-responsibilities';

type AreaResponsibleProps = {
  area: HouseholdArea;
};

function memberLabel(displayName: string | null, userId: string) {
  return displayName?.trim() || `Mitglied ${userId.slice(0, 6)}`;
}

export function AreaResponsible({ area }: AreaResponsibleProps) {
  const { activeHousehold } = useHouseholds();
  const { members, getResponsibleForArea, assignResponsible, clearResponsible, isUpdating } =
    useAreaResponsibilities();
  const [isOpen, setIsOpen] = useState(false);

  const responsible = getResponsibleForArea(area);

  if (!activeHousehold) {
    return null;
  }

  const handleAssign = async (userId: string) => {
    await assignResponsible({ area, userId });
    setIsOpen(false);
  };

  const handleClear = async () => {
    await clearResponsible(area);
    setIsOpen(false);
  };

  return (
    <>
      <Pressable
        style={styles.chip}
        disabled={isUpdating}
        onPress={() => setIsOpen(true)}>
        <Text style={styles.chipLabel}>Zuständig:</Text>
        <Text style={styles.chipValue}>
          {responsible
            ? memberLabel(responsible.display_name, responsible.user_id)
            : 'Nicht zugewiesen'}
        </Text>
        <Text style={styles.chipEdit}> ändern</Text>
      </Pressable>

      <Modal animationType="fade" transparent visible={isOpen} onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>Zuständigkeit wählen</Text>
            <Text style={styles.sheetSubtitle}>{activeHousehold.name}</Text>

            {members.map((member) => (
              <Pressable
                key={member.user_id}
                style={[
                  styles.memberRow,
                  responsible?.user_id === member.user_id && styles.memberRowActive,
                ]}
                onPress={() => void handleAssign(member.user_id)}>
                <Text style={styles.memberName}>{memberLabel(member.display_name, member.user_id)}</Text>
                {member.role === 'owner' ? <Text style={styles.ownerBadge}>Owner</Text> : null}
              </Pressable>
            ))}

            {responsible ? (
              <Pressable style={styles.clearButton} onPress={() => void handleClear()}>
                <Text style={styles.clearButtonText}>Zuweisung entfernen</Text>
              </Pressable>
            ) : null}

            <Pressable style={styles.cancelButton} onPress={() => setIsOpen(false)}>
              <Text style={styles.cancelButtonText}>Abbrechen</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipLabel: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '600',
  },
  chipValue: {
    color: '#1e3a8a',
    fontSize: 13,
    fontWeight: '700',
  },
  chipEdit: {
    color: '#2563eb',
    fontSize: 13,
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  sheetTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sheetSubtitle: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 16,
  },
  memberRow: {
    alignItems: 'center',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  memberRowActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  memberName: {
    color: '#111827',
    fontSize: 16,
  },
  ownerBadge: {
    color: '#6b7280',
    fontSize: 12,
  },
  clearButton: {
    marginTop: 8,
    paddingVertical: 12,
  },
  clearButtonText: {
    color: '#dc2626',
    fontSize: 15,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 4,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
  },
});
