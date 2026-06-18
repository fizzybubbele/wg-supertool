import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { fetchProfiles } from '@/features/responsibilities/responsibility-service';
import { getSupabase } from '@/lib/supabase';

function randomId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export type ReceiptStatus = 'pending' | 'parsed' | 'confirmed' | 'failed';

export type Receipt = {
  id: string;
  household_id: string;
  storage_path: string;
  store_name: string | null;
  purchase_date: string | null;
  total_amount: number | null;
  currency: string;
  status: ReceiptStatus;
  error_message: string | null;
  shopped_by: string | null;
  shopper_name: string | null;
  created_at: string;
  confirmed_at: string | null;
};

export type ReceiptItem = {
  id: string;
  receipt_id: string;
  name: string;
  quantity: number;
  unit_price: number | null;
  total_price: number | null;
  sort_order: number;
};

export type ReceiptWithItems = Receipt & {
  items: ReceiptItem[];
};

function extensionFromUri(uri: string) {
  const match = uri.match(/\.(\w+)(?:\?|$)/);
  const ext = match?.[1]?.toLowerCase();
  if (ext === 'png') return 'png';
  if (ext === 'webp') return 'webp';
  return 'jpg';
}

function mimeFromExtension(ext: string) {
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  return response.arrayBuffer();
}

export async function fetchReceipts(householdId: string): Promise<Receipt[]> {
  const { data, error } = await getSupabase()
    .from('receipts')
    .select(
      'id, household_id, storage_path, store_name, purchase_date, total_amount, currency, status, error_message, shopped_by, created_at, confirmed_at',
    )
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const shopperIds = rows
    .map((row) => row.shopped_by as string | null)
    .filter((id): id is string => Boolean(id));
  const profiles = await fetchProfiles(shopperIds);

  return rows.map((row) => ({
    ...(row as Omit<Receipt, 'shopper_name'>),
    shopper_name: row.shopped_by ? (profiles.get(row.shopped_by as string) ?? null) : null,
  }));
}

export async function fetchReceiptWithItems(receiptId: string): Promise<ReceiptWithItems> {
  const { data: receipt, error: receiptError } = await getSupabase()
    .from('receipts')
    .select(
      'id, household_id, storage_path, store_name, purchase_date, total_amount, currency, status, error_message, shopped_by, created_at, confirmed_at',
    )
    .eq('id', receiptId)
    .single();

  if (receiptError || !receipt) {
    throw new Error(receiptError?.message ?? 'Kassenzettel nicht gefunden');
  }

  const shopperProfiles = receipt.shopped_by
    ? await fetchProfiles([receipt.shopped_by as string])
    : new Map<string, string | null>();

  const { data: items, error: itemsError } = await getSupabase()
    .from('receipt_items')
    .select('id, receipt_id, name, quantity, unit_price, total_price, sort_order')
    .eq('receipt_id', receiptId)
    .order('sort_order', { ascending: true });

  if (itemsError) throw new Error(itemsError.message);

  return {
    ...(receipt as Omit<Receipt, 'shopper_name'>),
    shopper_name: receipt.shopped_by
      ? (shopperProfiles.get(receipt.shopped_by as string) ?? null)
      : null,
    items: (items ?? []) as ReceiptItem[],
  };
}

export async function pickReceiptImage() {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Kein Zugriff auf Fotos. Bitte Berechtigung in den Einstellungen erlauben.');
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0];
}

export async function uploadAndParseReceipt(householdId: string): Promise<ReceiptWithItems> {
  const asset = await pickReceiptImage();
  if (!asset) {
    throw new Error('CANCELLED');
  }

  const {
    data: { user },
  } = await getSupabase().auth.getUser();

  if (!user) {
    throw new Error('Nicht angemeldet');
  }

  const ext = extensionFromUri(asset.uri);
  const fileId = randomId();
  const storagePath = `${householdId}/${fileId}.${ext}`;
  const arrayBuffer = await uriToArrayBuffer(asset.uri);

  const { error: uploadError } = await getSupabase()
    .storage
    .from('receipts')
    .upload(storagePath, arrayBuffer, {
      contentType: mimeFromExtension(ext),
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: receipt, error: insertError } = await getSupabase()
    .from('receipts')
    .insert({
      household_id: householdId,
      uploaded_by: user.id,
      storage_path: storagePath,
      status: 'pending',
    })
    .select(
      'id, household_id, storage_path, store_name, purchase_date, total_amount, currency, status, error_message, created_at, confirmed_at',
    )
    .single();

  if (insertError || !receipt) {
    throw new Error(insertError?.message ?? 'Kassenzettel konnte nicht gespeichert werden');
  }

  const { data: parseResult, error: parseError } = await getSupabase().functions.invoke('parse-receipt', {
    body: { receipt_id: receipt.id },
  });

  if (parseError) {
    await getSupabase()
      .from('receipts')
      .update({ status: 'failed', error_message: parseError.message })
      .eq('id', receipt.id);
    throw new Error(parseError.message);
  }

  if (parseResult?.error) {
    throw new Error(String(parseResult.error));
  }

  return fetchReceiptWithItems(receipt.id as string);
}

export type ReceiptItemInput = {
  id?: string;
  name: string;
  quantity: number;
  unit_price: number | null;
  total_price: number | null;
};

export async function confirmReceipt(
  receiptId: string,
  householdId: string,
  items: ReceiptItemInput[],
  meta: { store_name: string | null; purchase_date: string | null; total_amount: number | null },
  shoppedBy: string,
): Promise<void> {
  const keptIds = new Set(items.map((item) => item.id).filter(Boolean) as string[]);
  const { data: existingItems, error: existingError } = await getSupabase()
    .from('receipt_items')
    .select('id')
    .eq('receipt_id', receiptId);

  if (existingError) throw new Error(existingError.message);

  const toDelete = (existingItems ?? [])
    .map((item) => item.id as string)
    .filter((id) => !keptIds.has(id));

  if (toDelete.length > 0) {
    const { error: deleteError } = await getSupabase()
      .from('receipt_items')
      .delete()
      .in('id', toDelete);
    if (deleteError) throw new Error(deleteError.message);
  }

  for (const [index, item] of items.entries()) {
    if (item.id) {
      const { error } = await getSupabase()
        .from('receipt_items')
        .update({
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          sort_order: index,
        })
        .eq('id', item.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await getSupabase().from('receipt_items').insert({
        receipt_id: receiptId,
        household_id: householdId,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        sort_order: index,
      });
      if (error) throw new Error(error.message);
    }
  }

  const { error } = await getSupabase()
    .from('receipts')
    .update({
      store_name: meta.store_name,
      purchase_date: meta.purchase_date,
      total_amount: meta.total_amount,
      shopped_by: shoppedBy,
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', receiptId);

  if (error) throw new Error(error.message);
}

export async function deleteReceiptItem(itemId: string): Promise<void> {
  const { error } = await getSupabase().from('receipt_items').delete().eq('id', itemId);
  if (error) throw new Error(error.message);
}

export function formatEuro(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(amount)) return '–';
  return `${amount.toFixed(2)} €`;
}

export function receiptStatusLabel(status: ReceiptStatus) {
  switch (status) {
    case 'pending':
      return 'Wird verarbeitet…';
    case 'parsed':
      return 'Zur Bestätigung';
    case 'confirmed':
      return 'Bestätigt';
    case 'failed':
      return 'Fehler';
    default:
      return status;
  }
}
