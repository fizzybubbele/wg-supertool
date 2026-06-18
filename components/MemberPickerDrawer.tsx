import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { PressableScale } from '@/components/PressableScale';
import { radius, spacing, typography } from '@/constants/tokens';
import type { HouseholdMember } from '@/features/responsibilities/responsibility-service';
import { useThemeColors } from '@/hooks/useThemeColors';

export function memberLabel(displayName: string | null, userId: string) {
  return displayName?.trim() || `Mitglied ${userId.slice(0, 6)}`;
}

type MemberPickerDrawerProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  members: HouseholdMember[];
  selectedUserId?: string | null;
  onAssign: (userId: string) => void | Promise<void>;
  onClear?: () => void | Promise<void>;
  isUpdating?: boolean;
};

export function MemberPickerDrawer({
  visible,
  onClose,
  title = 'Zuständigkeit wählen',
  subtitle,
  members,
  selectedUserId,
  onAssign,
  onClear,
  isUpdating = false,
}: MemberPickerDrawerProps) {
  const colors = useThemeColors();

  const handleAssign = async (userId: string) => {
    await onAssign(userId);
    onClose();
  };

  const handleClear = async () => {
    if (onClear) {
      await onClear();
      onClose();
    }
  };

  return (
    <Drawer visible={visible} onClose={onClose}>
      <Text style={[styles.sheetTitle, { color: colors.ink }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sheetSubtitle, { color: colors.inkMuted }]}>{subtitle}</Text>
      ) : null}

      {members.map((member) => (
        <PressableScale
          key={member.user_id}
          style={[
            styles.memberRow,
            { borderColor: colors.border },
            selectedUserId === member.user_id && {
              backgroundColor: colors.accentSoft,
              borderColor: colors.accent,
            },
          ]}
          disabled={isUpdating}
          onPress={() => void handleAssign(member.user_id)}>
          <Text style={[styles.memberName, { color: colors.ink }]}>
            {memberLabel(member.display_name, member.user_id)}
          </Text>
          {member.role === 'owner' ? (
            <Text style={[styles.ownerBadge, { color: colors.inkMuted }]}>Owner</Text>
          ) : null}
        </PressableScale>
      ))}

      {selectedUserId && onClear ? (
        <Button
          label="Zuweisung entfernen"
          variant="destructive"
          fullWidth
          disabled={isUpdating}
          onPress={() => void handleClear()}
        />
      ) : null}

      <Button label="Abbrechen" variant="ghost" fullWidth onPress={onClose} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  sheetTitle: {
    ...typography.title,
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  sheetSubtitle: {
    ...typography.body,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  memberRow: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm + 6,
    paddingVertical: spacing.sm + spacing.xs,
  },
  memberName: {
    ...typography.body,
  },
  ownerBadge: {
    ...typography.caption,
    fontWeight: '400',
  },
});
