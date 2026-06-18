import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '@/constants/tokens';
import { AREA_LABELS } from '@/features/responsibilities/areas';
import type { MemberActivitySummary } from '@/features/members/member-activity-service';
import { formatMemberStatsLine } from '@/features/members/member-activity-service';
import { memberLabel } from '@/components/MemberPickerDrawer';
import { useThemeColors } from '@/hooks/useThemeColors';

type MemberActivityCardProps = {
  summary: MemberActivitySummary;
  fairnessScore: number;
  maxFairnessScore: number;
};

export function MemberActivityCard({
  summary,
  fairnessScore,
  maxFairnessScore,
}: MemberActivityCardProps) {
  const colors = useThemeColors();
  const barWidth = maxFairnessScore > 0 ? Math.max(8, (fairnessScore / maxFairnessScore) * 100) : 0;

  return (
    <View
      style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surfaceRaised }]}>
      <View style={styles.header}>
        <Text style={[styles.name, { color: colors.ink }]}>
          {memberLabel(summary.display_name, summary.user_id)}
        </Text>
        {summary.role === 'owner' ? (
          <Text style={[styles.badge, { color: colors.inkMuted }]}>Owner</Text>
        ) : null}
      </View>

      <Text style={[styles.stats, { color: colors.inkMuted }]}>{formatMemberStatsLine(summary.stats)}</Text>

      <Text style={[styles.monthStats, { color: colors.inkSubtle }]}>
        Diesen Monat: {summary.stats.receiptsThisMonth} Einkäufe ·{' '}
        {summary.stats.receiptSpendThisMonth.toFixed(0)} € · {summary.stats.listItemsThisMonth}{' '}
        Listen · {summary.stats.cleaningDoneThisMonth} Putz
        {summary.stats.cleaningOpenAssigned > 0
          ? ` · ${summary.stats.cleaningOpenAssigned} offen`
          : ''}
      </Text>

      {summary.areas.length > 0 ? (
        <View style={styles.chips}>
          {summary.areas.map((area) => (
            <View
              key={area}
              style={[styles.chip, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
              <Text style={[styles.chipText, { color: colors.accent }]}>{AREA_LABELS[area]}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.noAreas, { color: colors.inkSubtle }]}>Keine Bereichs-Zuständigkeit</Text>
      )}

      <View style={styles.fairnessRow}>
        <Text style={[styles.fairnessLabel, { color: colors.inkMuted }]}>Aktivität (Monat)</Text>
        <View style={[styles.fairnessTrack, { backgroundColor: colors.borderSubtle }]}>
          <View
            style={[
              styles.fairnessFill,
              { backgroundColor: colors.accent, width: `${barWidth}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm + spacing.xs,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  badge: {
    ...typography.caption,
    fontWeight: '400',
  },
  stats: {
    ...typography.body,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  monthStats: {
    ...typography.caption,
    fontWeight: '400',
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  chip: {
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
  },
  noAreas: {
    ...typography.caption,
    fontWeight: '400',
    marginBottom: spacing.sm,
  },
  fairnessRow: {
    gap: spacing.xs,
  },
  fairnessLabel: {
    ...typography.caption,
    fontWeight: '400',
  },
  fairnessTrack: {
    borderRadius: radius.sm,
    height: 6,
    overflow: 'hidden',
  },
  fairnessFill: {
    borderRadius: radius.sm,
    height: 6,
  },
});
