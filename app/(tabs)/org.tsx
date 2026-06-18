import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FormInput } from '@/components/FormInput';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { radius, spacing, typography } from '@/constants/tokens';
import { useCalendarConnection } from '@/features/integrations/calendar/use-calendar-connection';
import {
  shareHouseholdInvite,
  shareOrgEvents,
} from '@/features/integrations/share-service';
import { useHouseholdInvites } from '@/features/integrations/use-invites';
import { useHouseholds } from '@/features/household/use-household';
import { useOrgEvents, type OrgEvent } from '@/features/organization/use-org-events';
import { useThemeColors } from '@/hooks/useThemeColors';

function formatDate(dateString: string) {
  const date = dateString.includes('T')
    ? new Date(dateString)
    : new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function formatSyncTime(value: string | null) {
  if (!value) return 'Noch nie';
  return new Date(value).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrganizationScreen() {
  const colors = useThemeColors();
  const { activeHousehold } = useHouseholds();
  const { events, isLoading, addEvent } = useOrgEvents();
  const { connection, connect, disconnect, syncNow } = useCalendarConnection();
  const { createInvite } = useHouseholdInvites();
  const [title, setTitle] = useState('');
  const [shareError, setShareError] = useState<string | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!title.trim()) return;
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    await addEvent.mutateAsync({ title: title.trim(), startsAt: today.toISOString() });
    setTitle('');
  };

  const handleShareEvents = async (viaWhatsApp: boolean) => {
    if (!activeHousehold) return;
    setShareError(null);
    try {
      await shareOrgEvents(activeHousehold.name, events, viaWhatsApp);
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Teilen fehlgeschlagen');
    }
  };

  const handleShareInvite = async (viaWhatsApp: boolean) => {
    if (!activeHousehold) return;
    setShareError(null);
    try {
      const token = await createInvite.mutateAsync();
      await shareHouseholdInvite(activeHousehold.name, token, viaWhatsApp);
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Einladung fehlgeschlagen');
    }
  };

  const handleConnectCalendar = async () => {
    setCalendarError(null);
    try {
      await connect.mutateAsync();
    } catch (error) {
      setCalendarError(error instanceof Error ? error.message : 'Verbindung fehlgeschlagen');
    }
  };

  const handleDisconnectCalendar = async () => {
    setCalendarError(null);
    try {
      await disconnect.mutateAsync();
    } catch (error) {
      setCalendarError(error instanceof Error ? error.message : 'Trennen fehlgeschlagen');
    }
  };

  const handleSyncCalendar = async () => {
    setCalendarError(null);
    try {
      await syncNow.mutateAsync();
    } catch (error) {
      setCalendarError(error instanceof Error ? error.message : 'Sync fehlgeschlagen');
    }
  };

  const listHeader = (
    <>
      <ScreenHeader area="organization" title="Organisation" subtitle="Termine und WG-Events" />

      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surfaceRaised }]}>
        <Text style={[styles.cardTitle, { color: colors.ink }]}>Google Kalender</Text>
        <Text style={[styles.cardMeta, { color: colors.inkMuted }]}>
          {connection
            ? `Verbunden · Letzter Sync: ${formatSyncTime(connection.lastSyncedAt)}`
            : 'Noch nicht verbunden — Zwei-Wege-Sync für Termine.'}
        </Text>
        {connection?.syncError ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{connection.syncError}</Text>
        ) : null}
        {calendarError ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{calendarError}</Text>
        ) : null}
        <View style={styles.buttonRow}>
          {connection ? (
            <>
              <Button
                label="Sync"
                variant="secondary"
                loading={syncNow.isPending}
                onPress={() => void handleSyncCalendar()}
              />
              <Button
                label="Trennen"
                variant="ghost"
                loading={disconnect.isPending}
                onPress={() => void handleDisconnectCalendar()}
              />
            </>
          ) : (
            <Button
              label="Mit Google verbinden"
              loading={connect.isPending}
              onPress={() => void handleConnectCalendar()}
            />
          )}
        </View>
      </View>

      <View style={styles.shareRow}>
        <Button
          label="Termine teilen"
          variant="secondary"
          onPress={() => void handleShareEvents(false)}
        />
        <Button
          label="WhatsApp"
          variant="secondary"
          onPress={() => void handleShareEvents(true)}
        />
        <Button
          label="Einladen"
          variant="secondary"
          loading={createInvite.isPending}
          onPress={() => void handleShareInvite(true)}
        />
      </View>
      {shareError ? <Text style={[styles.errorText, { color: colors.error }]}>{shareError}</Text> : null}

      <View style={styles.addRow}>
        <FormInput
          placeholder="Neuer Termin…"
          style={styles.addInput}
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={() => void handleAdd()}
        />
        <Button iconName="plus" onPress={() => void handleAdd()} />
      </View>
    </>
  );

  return (
    <Screen padded={false}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={isLoading ? [] : events}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.loader} />
          ) : (
            <EmptyState
              message="Noch keine Termine geplant."
              hint="Lege den nächsten WG-Abend oder Putztermin an."
            />
          )
        }
        renderItem={({ item }: { item: OrgEvent }) => (
          <View
            style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surfaceRaised }]}>
            <Text style={[styles.date, { color: colors.accent }]}>{formatDate(item.startsAt)}</Text>
            <Text style={[styles.title, { color: colors.ink }]}>{item.title}</Text>
            {item.description ? (
              <Text style={[styles.description, { color: colors.inkMuted }]}>{item.description}</Text>
            ) : null}
            {item.externalEventId ? (
              <Text style={[styles.syncBadge, { color: colors.inkSubtle }]}>↔ Google Kalender</Text>
            ) : null}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  addRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  addInput: {
    flex: 1,
    marginBottom: 0,
  },
  loader: {
    marginTop: spacing.lg,
  },
  card: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm + spacing.xs,
    padding: spacing.md,
  },
  cardTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
    fontSize: 17,
    marginBottom: spacing.xs,
  },
  cardMeta: {
    ...typography.body,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  shareRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  date: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.bodyMedium,
    fontWeight: '600',
    fontSize: 17,
  },
  description: {
    ...typography.body,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  syncBadge: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.body,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
});
