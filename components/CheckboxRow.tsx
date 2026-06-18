import { StyleSheet, Text, View } from 'react-native';

import { Check, X, iconSize } from '@/components/icons';
import { PressableScale } from '@/components/PressableScale';
import { radius, spacing, typography } from '@/constants/tokens';
import { useThemeColors } from '@/hooks/useThemeColors';

type CheckboxRowProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  onDelete?: () => void;
  assigneeLabel?: string | null;
  onAssignPress?: () => void;
};

export function CheckboxRow({
  label,
  checked,
  onToggle,
  onDelete,
  assigneeLabel,
  onAssignPress,
}: CheckboxRowProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.row, { borderBottomColor: colors.borderSubtle }]}>
      <PressableScale style={styles.rowMain} onPress={onToggle}>
        <View
          style={[
            styles.checkbox,
            { borderColor: colors.border },
            checked && { backgroundColor: colors.ink, borderColor: colors.ink },
          ]}>
          {checked ? (
            <Check
              size={iconSize.checkbox}
              color={colors.surfaceRaised}
              strokeWidth={2.25}
            />
          ) : null}
        </View>
        <Text
          style={[
            styles.label,
            { color: colors.ink },
            checked && { color: colors.inkSubtle, textDecorationLine: 'line-through' },
          ]}>
          {label}
        </Text>
      </PressableScale>
      {onAssignPress ? (
        <PressableScale
          style={[
            styles.assigneeChip,
            { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
          ]}
          onPress={onAssignPress}>
          <Text
            style={[
              styles.assigneeText,
              { color: assigneeLabel ? colors.ink : colors.inkMuted },
            ]}
            numberOfLines={1}>
            {assigneeLabel ?? 'Nicht zugewiesen'}
          </Text>
        </PressableScale>
      ) : null}
      {onDelete ? (
        <PressableScale style={styles.deleteHit} onPress={onDelete}>
          <X size={iconSize.rowAction} color={colors.error} strokeWidth={1.75} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm + spacing.xs,
  },
  rowMain: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm + spacing.xs,
    minWidth: 0,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: radius.sm - 2,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  label: {
    ...typography.body,
    flex: 1,
    lineHeight: 22,
  },
  assigneeChip: {
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 120,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  assigneeText: {
    ...typography.caption,
    fontWeight: '500',
  },
  deleteHit: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
});
