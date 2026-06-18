import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AreaResponsible } from '@/components/AreaResponsible';
import { AreaDot } from '@/components/icons';
import { MemberActivityCard } from '@/components/MemberActivityCard';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { radius, spacing, typography } from '@/constants/tokens';
import { computeFairnessScores } from '@/features/members/member-activity-service';
import { useMemberActivity } from '@/features/members/use-member-activity';
import { HOUSEHOLD_AREAS, AREA_LABELS } from '@/features/responsibilities/areas';
import { useAreaResponsibilities } from '@/features/responsibilities/use-area-responsibilities';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function ResponsibilitiesScreen() {
  const colors = useThemeColors();
  const { isLoading } = useAreaResponsibilities();
  const { summaries, isLoading: activityLoading } = useMemberActivity();
  const fairnessScores = computeFairnessScores(summaries);
  const maxFairnessScore = Math.max(...fairnessScores.values(), 1);

  return (
    <Screen>
      <ScreenHeader
        area="organization"
        title="Zuständigkeiten"
        subtitle="Zuständigkeiten & wer was erledigt hat"
        showResponsible={false}
      />

      {isLoading ? (
        <Text style={[styles.loading, { color: colors.inkMuted }]}>Lade Zuständigkeiten…</Text>
      ) : (
        HOUSEHOLD_AREAS.map((area) => (
          <View
            key={area}
            style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surfaceRaised }]}>
            <View style={styles.cardHeader}>
              <AreaDot area={area} />
              <Text style={[styles.areaTitle, { color: colors.ink }]}>{AREA_LABELS[area]}</Text>
            </View>
            <AreaResponsible area={area} />
          </View>
        ))
      )}

      <SectionTitle title="Mitglieder-Übersicht" style={styles.sectionGap} />

      {activityLoading ? (
        <Text style={[styles.loading, { color: colors.inkMuted }]}>Lade Aktivitäten…</Text>
      ) : summaries.length === 0 ? (
        <Text style={[styles.loading, { color: colors.inkMuted }]}>Noch keine Mitglieder.</Text>
      ) : (
        <>
          <View
            style={[
              styles.fairnessHint,
              { borderColor: colors.border, backgroundColor: colors.surfaceRaised },
            ]}>
            <Text style={[styles.fairnessHintText, { color: colors.inkMuted }]}>
              Fairness-Check: Balken vergleicht Einkäufe, Listen-Artikel und Putzaufgaben diesen
              Monat relativ zum Haushalts-Durchschnitt.
            </Text>
          </View>
          <ScrollView scrollEnabled={false}>
            {summaries.map((summary) => (
              <MemberActivityCard
                key={summary.user_id}
                summary={summary}
                fairnessScore={fairnessScores.get(summary.user_id) ?? 0}
                maxFairnessScore={maxFairnessScore}
              />
            ))}
          </ScrollView>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    ...typography.body,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  card: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm + spacing.xs,
    padding: spacing.md,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  areaTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  sectionGap: {
    marginTop: spacing.lg,
  },
  fairnessHint: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
    padding: spacing.sm + spacing.xs,
  },
  fairnessHintText: {
    ...typography.caption,
    fontWeight: '400',
  },
});
