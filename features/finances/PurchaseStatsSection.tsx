import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { SectionTitle } from '@/components/SectionTitle';
import { radius, spacing, typography } from '@/constants/tokens';
import { formatEuro } from '@/features/finances/receipt-service';
import { sourceLabel } from '@/features/finances/purchase-stats-service';
import { usePurchaseStats } from '@/features/finances/use-purchase-stats';
import { useThemeColors } from '@/hooks/useThemeColors';

export function PurchaseStatsSection() {
  const colors = useThemeColors();
  const { stats, isLoading } = usePurchaseStats();

  if (isLoading) {
    return (
      <>
        <SectionTitle title="Kaufstatistik" style={styles.sectionGap} />
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </>
    );
  }

  if (!stats?.hasReceiptData && !stats?.hasListData) {
    return (
      <>
        <SectionTitle title="Kaufstatistik" style={styles.sectionGap} />
        <EmptyState
          message="Noch keine Einkaufsdaten."
          hint="Scanne Kassenzettel oder schließe abgehakte Listeneinträge mit „Einkauf erledigt“ ab."
        />
      </>
    );
  }

  const currentMonth = stats.monthlySpend.at(-1);
  const previousMonth = stats.monthlySpend.at(-2);
  const topProducts = stats.topProducts.slice(0, 5);

  return (
    <>
      <SectionTitle title="Kaufstatistik" style={styles.sectionGap} />

      {stats.hasReceiptData && currentMonth ? (
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surfaceRaised }]}>
          <Text style={[styles.cardLabel, { color: colors.inkMuted }]}>Dieser Monat</Text>
          <Text style={[styles.cardAmount, { color: colors.ink }, typography.tabular]}>
            {formatEuro(currentMonth.total)}
          </Text>
          <Text style={[styles.cardMeta, { color: colors.inkSubtle }]}>
            {currentMonth.receiptCount}{' '}
            {currentMonth.receiptCount === 1 ? 'Kassenzettel' : 'Kassenzettel'}
            {previousMonth ? ` · Vormonat ${formatEuro(previousMonth.total)}` : null}
          </Text>
        </View>
      ) : (
        <Text style={[styles.hint, { color: colors.inkSubtle }]}>
          Mehr Kassenzettel scannen für genauere Ausgaben.
        </Text>
      )}

      {stats.listCompletionsThisMonth > 0 ? (
        <Text style={[styles.hint, { color: colors.inkMuted }]}>
          {stats.listCompletionsThisMonth}{' '}
          {stats.listCompletionsThisMonth === 1 ? 'Artikel' : 'Artikel'} diesen Monat über die
          Einkaufsliste erfasst.
        </Text>
      ) : null}

      {topProducts.length > 0 ? (
        <View style={styles.topList}>
          <Text style={[styles.topTitle, { color: colors.ink }]}>Top-Artikel</Text>
          {topProducts.map((product) => (
            <View
              key={product.name}
              style={[styles.topRow, { borderColor: colors.border, backgroundColor: colors.surfaceRaised }]}>
              <View style={styles.topRowMain}>
                <Text style={[styles.topName, { color: colors.ink }]} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={[styles.topMeta, { color: colors.inkMuted }]}>
                  {product.count}×
                  {product.totalSpent != null ? ` · ${formatEuro(product.totalSpent)}` : null}
                </Text>
              </View>
              <Text style={[styles.sourceBadge, { color: colors.accent }]}>
                {sourceLabel(product.sources)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {!stats.hasReceiptData && stats.hasListData ? (
        <Text style={[styles.hint, { color: colors.inkSubtle }]}>
          Mehr Kassenzettel scannen für genauere Ausgaben.
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  sectionGap: {
    marginTop: spacing.lg,
  },
  loader: {
    marginTop: spacing.sm,
  },
  card: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
    padding: spacing.sm + 6,
  },
  cardLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  cardAmount: {
    ...typography.section,
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  cardMeta: {
    ...typography.body,
    fontSize: 14,
  },
  hint: {
    ...typography.caption,
    fontWeight: '400',
    marginBottom: spacing.sm,
  },
  topList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  topTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  topRow: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm + 6,
    paddingVertical: spacing.sm,
  },
  topRowMain: {
    flex: 1,
    minWidth: 0,
  },
  topName: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  topMeta: {
    ...typography.caption,
    marginTop: 2,
  },
  sourceBadge: {
    ...typography.caption,
    fontWeight: '600',
  },
});
