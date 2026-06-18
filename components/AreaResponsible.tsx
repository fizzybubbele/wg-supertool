import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { memberLabel, MemberPickerDrawer } from '@/components/MemberPickerDrawer';
import { PressableScale } from '@/components/PressableScale';
import { radius, spacing, typography } from '@/constants/tokens';
import { useHouseholds } from '@/features/household/use-household';
import type { HouseholdArea } from '@/features/responsibilities/areas';
import { useAreaResponsibilities } from '@/features/responsibilities/use-area-responsibilities';
import { useThemeColors } from '@/hooks/useThemeColors';

type AreaResponsibleProps = {
  area: HouseholdArea;
};

export function AreaResponsible({ area }: AreaResponsibleProps) {
  const colors = useThemeColors();
  const { activeHousehold } = useHouseholds();
  const { members, getResponsibleForArea, assignResponsible, clearResponsible, isUpdating } =
    useAreaResponsibilities();
  const [isOpen, setIsOpen] = useState(false);

  const responsible = getResponsibleForArea(area);

  if (!activeHousehold) {
    return null;
  }

  return (
    <>
      <PressableScale
        style={[
          styles.chip,
          { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
        ]}
        disabled={isUpdating}
        onPress={() => setIsOpen(true)}>
        <Text style={[styles.chipLabel, { color: colors.inkMuted }]}>Zuständig:</Text>
        <Text style={[styles.chipValue, { color: colors.ink }]}>
          {responsible
            ? memberLabel(responsible.display_name, responsible.user_id)
            : 'Nicht zugewiesen'}
        </Text>
        <Text style={[styles.chipEdit, { color: colors.accent }]}> ändern</Text>
      </PressableScale>

      <MemberPickerDrawer
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        subtitle={activeHousehold.name}
        members={members}
        selectedUserId={responsible?.user_id}
        isUpdating={isUpdating}
        onAssign={(userId) => assignResponsible({ area, userId })}
        onClear={() => clearResponsible(area)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm + spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.sm,
  },
  chipLabel: {
    ...typography.caption,
  },
  chipValue: {
    ...typography.caption,
    fontWeight: '600',
  },
  chipEdit: {
    ...typography.caption,
    fontWeight: '400',
  },
});
