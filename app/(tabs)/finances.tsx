import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { CheckboxRow } from '@/components/CheckboxRow';
import { EmptyState } from '@/components/EmptyState';
import { FormInput } from '@/components/FormInput';
import { MemberPickerDrawer } from '@/components/MemberPickerDrawer';
import { PressableScale } from '@/components/PressableScale';
import { ReceiptReviewModal } from '@/components/ReceiptReviewModal';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { radius, spacing, typography } from '@/constants/tokens';
import {
  formatEuro,
  receiptStatusLabel,
  type ReceiptWithItems,
} from '@/features/finances/receipt-service';
import { PurchaseStatsSection } from '@/features/finances/PurchaseStatsSection';
import { useReceipts } from '@/features/finances/use-receipts';
import { useShoppingList } from '@/features/finances/use-shopping-list';
import { shareShoppingList } from '@/features/integrations/share-service';
import { useHouseholds } from '@/features/household/use-household';
import { useAreaResponsibilities } from '@/features/responsibilities/use-area-responsibilities';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function FinancesScreen() {
  const colors = useThemeColors();
  const { activeHousehold } = useHouseholds();
  const { members } = useAreaResponsibilities();
  const { items, checkedCount, isLoading, addItem, toggleItem, deleteItem, completeCheckedItems } =
    useShoppingList();
  const {
    receipts,
    isLoading: receiptsLoading,
    uploadReceipt,
    isUploading,
    confirmReceipt,
    isConfirming,
    loadReceipt,
  } = useReceipts();

  const [newItem, setNewItem] = useState('');
  const [reviewReceipt, setReviewReceipt] = useState<ReceiptWithItems | null>(null);
  const [reviewReadOnly, setReviewReadOnly] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shopperPickerVisible, setShopperPickerVisible] = useState(false);

  const handleShareList = async (viaWhatsApp: boolean) => {
    if (!activeHousehold) return;
    setShareError(null);
    try {
      await shareShoppingList(activeHousehold.name, items, viaWhatsApp);
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Teilen fehlgeschlagen');
    }
  };

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await addItem.mutateAsync(newItem.trim());
    setNewItem('');
  };

  const handleUpload = async () => {
    setUploadError(null);
    try {
      const parsed = await uploadReceipt();
      setReviewReadOnly(false);
      setReviewReceipt(parsed);
    } catch (error) {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return;
      }
      const message = error instanceof Error ? error.message : 'Upload fehlgeschlagen';
      setUploadError(message);
    }
  };

  const handleOpenReceipt = async (receiptId: string) => {
    try {
      const receipt = await loadReceipt(receiptId);
      if (receipt.status === 'failed') {
        setUploadError(receipt.error_message ?? 'Verarbeitung fehlgeschlagen');
        return;
      }
      if (receipt.status === 'parsed' || receipt.status === 'confirmed') {
        setReviewReadOnly(receipt.status === 'confirmed');
        setReviewReceipt(receipt);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Konnte nicht laden');
    }
  };

  const handleConfirm = async (
    itemsToSave: Parameters<typeof confirmReceipt>[0]['items'],
    meta: Parameters<typeof confirmReceipt>[0]['meta'],
    shoppedBy: string,
  ) => {
    if (!reviewReceipt) return;
    await confirmReceipt({
      receiptId: reviewReceipt.id,
      items: itemsToSave,
      meta,
      shoppedBy,
    });
    setReviewReceipt(null);
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader
          area="finances"
          title="Finanzen"
          subtitle="Kassenzettel scannen und Einkaufsliste pflegen"
        />

        <SectionTitle title="Kassenzettel" />
        <Button
          label="Kassenzettel hochladen"
          iconName="receipt"
          fullWidth
          loading={isUploading}
          disabled={isUploading}
          onPress={() => void handleUpload()}
        />
        {uploadError ? <Text style={[styles.errorText, { color: colors.error }]}>{uploadError}</Text> : null}
        <Text style={[styles.hint, { color: colors.inkSubtle }]}>
          Lokal ohne OPENAI_API_KEY werden Demo-Positionen erkannt. Für echte OCR: supabase secrets set
          OPENAI_API_KEY=sk-…
        </Text>

        {receiptsLoading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : (
          receipts.map((receipt) => (
            <PressableScale
              key={receipt.id}
              style={[styles.receiptCard, { borderColor: colors.border, backgroundColor: colors.surfaceRaised }]}
              onPress={() => void handleOpenReceipt(receipt.id)}>
              <View style={styles.receiptHeader}>
                <Text style={[styles.receiptStore, { color: colors.ink }]}>{receipt.store_name ?? 'Kassenzettel'}</Text>
                <Text
                  style={[
                    styles.receiptStatus,
                    { color: colors.accent },
                    receipt.status === 'failed' && { color: colors.error },
                    receipt.status === 'confirmed' && { color: colors.success },
                  ]}>
                  {receiptStatusLabel(receipt.status)}
                </Text>
              </View>
              <Text style={[styles.receiptMeta, { color: colors.inkMuted }, typography.tabular]}>
                {receipt.purchase_date ?? 'Datum unbekannt'} · {formatEuro(receipt.total_amount)}
                {receipt.shopper_name ? ` · ${receipt.shopper_name}` : ''}
              </Text>
            </PressableScale>
          ))
        )}

        <PurchaseStatsSection />

        <SectionTitle title="Einkaufsliste" style={styles.sectionGap} />
        <View style={styles.shareRow}>
          <Button
            label="Liste teilen"
            variant="secondary"
            onPress={() => void handleShareList(false)}
          />
          <Button
            label="WhatsApp"
            variant="secondary"
            onPress={() => void handleShareList(true)}
          />
        </View>
        {shareError ? <Text style={[styles.errorText, { color: colors.error }]}>{shareError}</Text> : null}
        <View style={styles.addRow}>
          <FormInput
            placeholder="Neuer Artikel…"
            style={styles.addInput}
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={() => void handleAdd()}
          />
          <Button iconName="plus" onPress={() => void handleAdd()} />
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : items.length === 0 ? (
          <EmptyState
            message="Noch nichts auf der Liste."
            hint="Tippe einen Artikel ein und füge ihn hinzu."
          />
        ) : (
          items.map((item) => (
            <CheckboxRow
              key={item.id}
              label={item.name}
              checked={item.checked}
              onToggle={() => void toggleItem.mutateAsync({ id: item.id, checked: !item.checked })}
              onDelete={() => void deleteItem.mutateAsync(item.id)}
            />
          ))
        )}

        {checkedCount > 0 ? (
          <>
            <Button
              label="Einkauf erledigt"
              variant="secondary"
              fullWidth
              loading={completeCheckedItems.isPending}
              disabled={completeCheckedItems.isPending}
              onPress={() => setShopperPickerVisible(true)}
              style={styles.completeButton}
            />
            <Text style={[styles.hint, { color: colors.inkSubtle }]}>
              Abgehakte Artikel werden für die Statistik gespeichert und von der Liste entfernt.
            </Text>
          </>
        ) : null}
      </ScrollView>

      <ReceiptReviewModal
        receipt={reviewReceipt}
        visible={Boolean(reviewReceipt)}
        readOnly={reviewReadOnly}
        isSaving={isConfirming}
        members={members}
        onClose={() => setReviewReceipt(null)}
        onConfirm={handleConfirm}
      />

      <MemberPickerDrawer
        visible={shopperPickerVisible}
        onClose={() => setShopperPickerVisible(false)}
        title="Wer war einkaufen?"
        subtitle={`${checkedCount} abgehakte Artikel`}
        members={members}
        isUpdating={completeCheckedItems.isPending}
        onAssign={async (userId) => {
          await completeCheckedItems.mutateAsync(userId);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionGap: {
    marginTop: spacing.lg,
  },
  hint: {
    ...typography.caption,
    fontWeight: '400',
    marginBottom: spacing.sm + spacing.xs,
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.body,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  receiptCard: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
    padding: spacing.sm + 6,
  },
  receiptHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  receiptStore: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  receiptStatus: {
    ...typography.caption,
  },
  receiptMeta: {
    ...typography.body,
    fontSize: 14,
  },
  addRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  addInput: {
    flex: 1,
    marginBottom: 0,
  },
  shareRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  loader: {
    marginTop: spacing.md,
  },
  completeButton: {
    marginTop: spacing.sm,
  },
});
