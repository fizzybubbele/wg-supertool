import { fetchReceipts, type Receipt } from '@/features/finances/receipt-service';
import { getSupabase } from '@/lib/supabase';

export type MonthlySpend = {
  month: string;
  label: string;
  total: number;
  receiptCount: number;
};

export type TopProductSource = 'receipt' | 'list';

export type TopProduct = {
  name: string;
  count: number;
  totalSpent: number | null;
  sources: TopProductSource[];
};

export type PurchaseStats = {
  monthlySpend: MonthlySpend[];
  topProducts: TopProduct[];
  recentReceipts: Receipt[];
  listCompletionsThisMonth: number;
  hasReceiptData: boolean;
  hasListData: boolean;
};

type ReceiptItemRow = {
  name: string;
  total_price: number | null;
  receipts:
    | { status: string; purchase_date: string | null; confirmed_at: string | null }
    | { status: string; purchase_date: string | null; confirmed_at: string | null }[]
    | null;
};

type CompletionRow = {
  name: string;
  completed_at: string;
};

function receiptFromItem(item: ReceiptItemRow) {
  if (!item.receipts) return null;
  return Array.isArray(item.receipts) ? item.receipts[0] ?? null : item.receipts;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function monthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

function receiptMonthKey(receipt: Receipt): string | null {
  if (receipt.purchase_date) {
    return receipt.purchase_date.slice(0, 7);
  }
  if (receipt.confirmed_at) {
    return monthKey(new Date(receipt.confirmed_at));
  }
  return null;
}

function buildMonthlySpend(receipts: Receipt[], months: number): MonthlySpend[] {
  const confirmed = receipts.filter((receipt) => receipt.status === 'confirmed');
  const totals = new Map<string, { total: number; receiptCount: number }>();

  for (const receipt of confirmed) {
    const key = receiptMonthKey(receipt);
    if (!key || receipt.total_amount == null) continue;

    const current = totals.get(key) ?? { total: 0, receiptCount: 0 };
    current.total += receipt.total_amount;
    current.receiptCount += 1;
    totals.set(key, current);
  }

  const result: MonthlySpend[] = [];
  const now = new Date();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = monthKey(date);
    const entry = totals.get(key) ?? { total: 0, receiptCount: 0 };
    result.push({
      month: key,
      label: monthLabel(key),
      total: entry.total,
      receiptCount: entry.receiptCount,
    });
  }

  return result;
}

function buildTopProducts(
  receiptItems: ReceiptItemRow[],
  completions: CompletionRow[],
  limit: number,
): TopProduct[] {
  const grouped = new Map<
    string,
    {
      displayName: string;
      count: number;
      totalSpent: number;
      hasReceiptSpend: boolean;
      sources: Set<TopProductSource>;
    }
  >();

  for (const item of receiptItems) {
    if (receiptFromItem(item)?.status !== 'confirmed') continue;

    const key = normalizeName(item.name);
    if (!key) continue;

    const current = grouped.get(key) ?? {
      displayName: item.name.trim(),
      count: 0,
      totalSpent: 0,
      hasReceiptSpend: false,
      sources: new Set<TopProductSource>(),
    };

    current.count += 1;
    current.sources.add('receipt');
    if (item.total_price != null) {
      current.totalSpent += item.total_price;
      current.hasReceiptSpend = true;
    }
    grouped.set(key, current);
  }

  for (const completion of completions) {
    const key = normalizeName(completion.name);
    if (!key) continue;

    const current = grouped.get(key) ?? {
      displayName: completion.name.trim(),
      count: 0,
      totalSpent: 0,
      hasReceiptSpend: false,
      sources: new Set<TopProductSource>(),
    };

    current.count += 1;
    current.sources.add('list');
    grouped.set(key, current);
  }

  return [...grouped.values()]
    .sort((a, b) => b.count - a.count || a.displayName.localeCompare(b.displayName, 'de'))
    .slice(0, limit)
    .map((entry) => ({
      name: entry.displayName,
      count: entry.count,
      totalSpent: entry.hasReceiptSpend ? entry.totalSpent : null,
      sources: [...entry.sources],
    }));
}

function countCompletionsThisMonth(completions: CompletionRow[]): number {
  const now = new Date();
  const currentKey = monthKey(now);

  return completions.filter((completion) => monthKey(new Date(completion.completed_at)) === currentKey)
    .length;
}

export async function fetchPurchaseStats(householdId: string): Promise<PurchaseStats> {
  const supabase = getSupabase();

  const [receipts, receiptItemsResult, completionsResult] = await Promise.all([
    fetchReceipts(householdId),
    supabase
      .from('receipt_items')
      .select('name, total_price, receipts!inner(status, purchase_date, confirmed_at)')
      .eq('household_id', householdId),
    supabase
      .from('shopping_list_completions')
      .select('name, completed_at')
      .eq('household_id', householdId)
      .order('completed_at', { ascending: false }),
  ]);

  if (receiptItemsResult.error) throw new Error(receiptItemsResult.error.message);
  if (completionsResult.error) throw new Error(completionsResult.error.message);

  const receiptItems = receiptItemsResult.data ?? [];
  const completions = (completionsResult.data ?? []) as CompletionRow[];

  const confirmedReceipts = receipts.filter((receipt) => receipt.status === 'confirmed');

  return {
    monthlySpend: buildMonthlySpend(receipts, 2),
    topProducts: buildTopProducts(receiptItems as ReceiptItemRow[], completions, 10),
    recentReceipts: confirmedReceipts.slice(0, 5),
    listCompletionsThisMonth: countCompletionsThisMonth(completions),
    hasReceiptData: confirmedReceipts.length > 0,
    hasListData: completions.length > 0,
  };
}

export function sourceLabel(sources: TopProductSource[]): string {
  const hasReceipt = sources.includes('receipt');
  const hasList = sources.includes('list');

  if (hasReceipt && hasList) return 'Beides';
  if (hasReceipt) return 'Kassenzettel';
  return 'Liste';
}
