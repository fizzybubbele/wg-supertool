import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Plus, iconSize } from '@/components/icons';
import { memberLabel, MemberPickerDrawer } from '@/components/MemberPickerDrawer';
import { PressableScale } from '@/components/PressableScale';
import { radius, spacing, typography } from '@/constants/tokens';
import {
  formatEuro,
  type ReceiptItemInput,
  type ReceiptWithItems,
} from '@/features/finances/receipt-service';
import type { HouseholdMember } from '@/features/responsibilities/responsibility-service';
import { useThemeColors } from '@/hooks/useThemeColors';

type ReceiptReviewModalProps = {
  receipt: ReceiptWithItems | null;
  visible: boolean;
  readOnly?: boolean;
  isSaving: boolean;
  members: HouseholdMember[];
  onClose: () => void;
  onConfirm: (
    items: ReceiptItemInput[],
    meta: { store_name: string | null; purchase_date: string | null; total_amount: number | null },
    shoppedBy: string,
  ) => Promise<void>;
};

export function ReceiptReviewModal({
  receipt,
  visible,
  readOnly = false,
  isSaving,
  members,
  onClose,
  onConfirm,
}: ReceiptReviewModalProps) {
  const colors = useThemeColors();
  const [storeName, setStoreName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [items, setItems] = useState<ReceiptItemInput[]>([]);
  const [shoppedBy, setShoppedBy] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (!receipt) return;
    setStoreName(receipt.store_name ?? '');
    setPurchaseDate(receipt.purchase_date ?? '');
    setTotalAmount(receipt.total_amount != null ? String(receipt.total_amount) : '');
    setShoppedBy(receipt.shopped_by);
    setItems(
      receipt.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    );
  }, [receipt]);

  if (!receipt) return null;

  const updateItem = (index: number, patch: Partial<ReceiptItemInput>) => {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      { name: '', quantity: 1, unit_price: null, total_price: null },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleConfirm = async () => {
    if (!shoppedBy) return;
    const parsedTotal = totalAmount.trim() ? Number(totalAmount.replace(',', '.')) : null;
    await onConfirm(items.filter((item) => item.name.trim()), {
      store_name: storeName.trim() || null,
      purchase_date: purchaseDate.trim() || null,
      total_amount: parsedTotal != null && !Number.isNaN(parsedTotal) ? parsedTotal : null,
    }, shoppedBy);
  };

  const selectedShopper = members.find((member) => member.user_id === shoppedBy) ?? null;

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.ink }]}>
          {readOnly ? 'Kassenzettel' : 'Kassenzettel prüfen'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
          {readOnly ? 'Bestätigter Beleg' : 'Artikel bearbeiten und bestätigen'}
        </Text>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <FormInput placeholder="Geschäft" value={storeName} onChangeText={setStoreName} editable={!readOnly} />
          <FormInput
            placeholder="Datum (YYYY-MM-DD)"
            value={purchaseDate}
            onChangeText={setPurchaseDate}
            editable={!readOnly}
          />
          <FormInput
            placeholder="Gesamtbetrag"
            value={totalAmount}
            onChangeText={setTotalAmount}
            keyboardType="decimal-pad"
            editable={!readOnly}
          />

          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Wer war einkaufen?</Text>
          {readOnly ? (
            <Text style={[styles.shopperValue, { color: colors.inkMuted }]}>
              {selectedShopper
                ? memberLabel(selectedShopper.display_name, selectedShopper.user_id)
                : 'Nicht zugeordnet'}
            </Text>
          ) : (
            <Button
              label={
                selectedShopper
                  ? memberLabel(selectedShopper.display_name, selectedShopper.user_id)
                  : 'Person wählen'
              }
              variant="secondary"
              fullWidth
              onPress={() => setPickerVisible(true)}
            />
          )}

          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Positionen</Text>
          {items.map((item, index) => (
            <View
              key={item.id ?? `new-${index}`}
              style={[styles.itemCard, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
              <FormInput
                placeholder="Artikel"
                style={styles.itemInput}
                value={item.name}
                onChangeText={(value) => updateItem(index, { name: value })}
                editable={!readOnly}
              />
              <View style={styles.itemRow}>
                <FormInput
                  placeholder="Menge"
                  style={styles.smallInput}
                  value={String(item.quantity)}
                  keyboardType="decimal-pad"
                  editable={!readOnly}
                  onChangeText={(value) =>
                    updateItem(index, { quantity: Number(value.replace(',', '.')) || 0 })
                  }
                />
                <FormInput
                  placeholder="Preis"
                  style={styles.smallInput}
                  value={item.total_price != null ? String(item.total_price) : ''}
                  keyboardType="decimal-pad"
                  editable={!readOnly}
                  onChangeText={(value) =>
                    updateItem(index, {
                      total_price: value.trim() ? Number(value.replace(',', '.')) : null,
                    })
                  }
                />
              </View>
              {!readOnly ? (
                <PressableScale onPress={() => removeItem(index)}>
                  <Text style={[styles.remove, { color: colors.error }]}>Position entfernen</Text>
                </PressableScale>
              ) : null}
            </View>
          ))}

          {!readOnly ? (
            <PressableScale style={styles.addItemButton} onPress={addItem}>
              <View style={styles.addItemRow}>
                <Plus color={colors.accent} size={iconSize.buttonInline} strokeWidth={1.75} />
                <Text style={[styles.addItemText, { color: colors.accent }]}>Position hinzufügen</Text>
              </View>
            </PressableScale>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.surfaceRaised, borderTopColor: colors.border }]}>
          <Text style={[styles.totalPreview, { color: colors.ink }, typography.tabular]}>
            Summe: {formatEuro(Number(totalAmount.replace(',', '.')) || null)}
          </Text>
          <View style={styles.footerButtons}>
            <Button
              label={readOnly ? 'Schließen' : 'Abbrechen'}
              variant="secondary"
              disabled={isSaving}
              onPress={onClose}
              style={styles.footerButton}
            />
            {!readOnly ? (
              <Button
                label="Bestätigen"
                loading={isSaving}
                disabled={isSaving || !shoppedBy}
                onPress={() => void handleConfirm()}
                style={styles.footerButton}
              />
            ) : null}
          </View>
        </View>
      </View>

      <MemberPickerDrawer
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        title="Wer war einkaufen?"
        members={members}
        selectedUserId={shoppedBy}
        onAssign={async (userId) => {
          setShoppedBy(userId);
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
  },
  title: {
    ...typography.title,
    paddingHorizontal: spacing.md,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  shopperValue: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  itemCard: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm + spacing.xs,
    padding: spacing.sm + spacing.xs,
  },
  itemInput: {
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  smallInput: {
    flex: 1,
    marginBottom: spacing.sm,
  },
  remove: {
    fontSize: 14,
  },
  addItemButton: {
    paddingVertical: spacing.sm + spacing.xs,
  },
  addItemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  addItemText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    fontSize: 15,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  totalPreview: {
    ...typography.bodyMedium,
    fontWeight: '600',
    marginBottom: spacing.sm + spacing.xs,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.sm + spacing.xs,
  },
  footerButton: {
    flex: 1,
  },
});
