import { AREA_LABELS, type HouseholdArea } from '@/features/responsibilities/areas';
import {
  fetchHouseholdMembers,
  fetchProfiles,
  type HouseholdMember,
} from '@/features/responsibilities/responsibility-service';
import { getSupabase } from '@/lib/supabase';

export type MemberActivityStats = {
  receiptsAllTime: number;
  receiptSpendAllTime: number;
  receiptsThisMonth: number;
  receiptSpendThisMonth: number;
  listItemsAllTime: number;
  listItemsThisMonth: number;
  cleaningDoneAllTime: number;
  cleaningDoneThisMonth: number;
  cleaningOpenAssigned: number;
};

export type MemberActivitySummary = HouseholdMember & {
  areas: HouseholdArea[];
  stats: MemberActivityStats;
};

type ReceiptRow = {
  shopped_by: string | null;
  total_amount: number | null;
  status: string;
  purchase_date: string | null;
  confirmed_at: string | null;
};

type CompletionRow = {
  completed_by: string | null;
  completed_at: string;
};

type CleaningRow = {
  assigned_to: string | null;
  completed_by: string | null;
  completed_at: string | null;
  done: boolean;
};

type AreaRow = {
  area: HouseholdArea;
  user_id: string;
};

function monthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function isInCurrentMonth(isoDate: string | null): boolean {
  if (!isoDate) return false;
  return monthKey(new Date(isoDate)) === monthKey(new Date());
}

function receiptActivityDate(receipt: ReceiptRow): string | null {
  if (receipt.purchase_date) return receipt.purchase_date;
  if (receipt.confirmed_at) return receipt.confirmed_at;
  return null;
}

function emptyStats(): MemberActivityStats {
  return {
    receiptsAllTime: 0,
    receiptSpendAllTime: 0,
    receiptsThisMonth: 0,
    receiptSpendThisMonth: 0,
    listItemsAllTime: 0,
    listItemsThisMonth: 0,
    cleaningDoneAllTime: 0,
    cleaningDoneThisMonth: 0,
    cleaningOpenAssigned: 0,
  };
}

export async function fetchMemberActivitySummaries(
  householdId: string,
): Promise<MemberActivitySummary[]> {
  const supabase = getSupabase();

  const [members, receiptsResult, completionsResult, cleaningResult, areasResult] =
    await Promise.all([
      fetchHouseholdMembers(householdId),
      supabase
        .from('receipts')
        .select('shopped_by, total_amount, status, purchase_date, confirmed_at')
        .eq('household_id', householdId)
        .eq('status', 'confirmed'),
      supabase
        .from('shopping_list_completions')
        .select('completed_by, completed_at')
        .eq('household_id', householdId),
      supabase
        .from('cleaning_tasks')
        .select('assigned_to, completed_by, completed_at, done')
        .eq('household_id', householdId),
      supabase.from('area_responsibilities').select('area, user_id').eq('household_id', householdId),
    ]);

  if (receiptsResult.error) throw new Error(receiptsResult.error.message);
  if (completionsResult.error) throw new Error(completionsResult.error.message);
  if (cleaningResult.error) throw new Error(cleaningResult.error.message);
  if (areasResult.error) throw new Error(areasResult.error.message);

  const receipts = (receiptsResult.data ?? []) as ReceiptRow[];
  const completions = (completionsResult.data ?? []) as CompletionRow[];
  const cleaningTasks = (cleaningResult.data ?? []) as CleaningRow[];
  const areas = (areasResult.data ?? []) as AreaRow[];

  const statsByUser = new Map<string, MemberActivityStats>();
  for (const member of members) {
    statsByUser.set(member.user_id, emptyStats());
  }

  for (const receipt of receipts) {
    if (!receipt.shopped_by) continue;
    const stats = statsByUser.get(receipt.shopped_by);
    if (!stats) continue;

    stats.receiptsAllTime += 1;
    if (receipt.total_amount != null) {
      stats.receiptSpendAllTime += receipt.total_amount;
    }

    const activityDate = receiptActivityDate(receipt);
    if (isInCurrentMonth(activityDate)) {
      stats.receiptsThisMonth += 1;
      if (receipt.total_amount != null) {
        stats.receiptSpendThisMonth += receipt.total_amount;
      }
    }
  }

  for (const completion of completions) {
    if (!completion.completed_by) continue;
    const stats = statsByUser.get(completion.completed_by);
    if (!stats) continue;

    stats.listItemsAllTime += 1;
    if (isInCurrentMonth(completion.completed_at)) {
      stats.listItemsThisMonth += 1;
    }
  }

  for (const task of cleaningTasks) {
    if (task.completed_by) {
      const stats = statsByUser.get(task.completed_by);
      if (stats) {
        stats.cleaningDoneAllTime += 1;
        if (isInCurrentMonth(task.completed_at)) {
          stats.cleaningDoneThisMonth += 1;
        }
      }
    }

    if (task.assigned_to && !task.done) {
      const stats = statsByUser.get(task.assigned_to);
      if (stats) {
        stats.cleaningOpenAssigned += 1;
      }
    }
  }

  const areasByUser = new Map<string, HouseholdArea[]>();
  for (const row of areas) {
    const current = areasByUser.get(row.user_id) ?? [];
    current.push(row.area);
    areasByUser.set(row.user_id, current);
  }

  return members.map((member) => ({
    ...member,
    areas: areasByUser.get(member.user_id) ?? [],
    stats: statsByUser.get(member.user_id) ?? emptyStats(),
  }));
}

export function formatMemberStatsLine(stats: MemberActivityStats): string {
  const parts = [
    `${stats.receiptsAllTime} Einkäufe`,
    `${stats.receiptSpendAllTime.toFixed(0)} €`,
    `${stats.listItemsAllTime} Listen-Artikel`,
    `${stats.cleaningDoneAllTime} Putzaufgaben`,
  ];
  return parts.join(' · ');
}

export function formatAreaChips(areas: HouseholdArea[]): string {
  if (areas.length === 0) return 'Keine Bereichs-Zuständigkeit';
  return areas.map((area) => AREA_LABELS[area]).join(', ');
}

export function computeFairnessScores(
  summaries: MemberActivitySummary[],
): Map<string, number> {
  const scores = new Map<string, number>();
  if (summaries.length === 0) return scores;

  const totals = summaries.reduce(
    (acc, member) => {
      acc.receipts += member.stats.receiptsThisMonth;
      acc.list += member.stats.listItemsThisMonth;
      acc.cleaning += member.stats.cleaningDoneThisMonth;
      return acc;
    },
    { receipts: 0, list: 0, cleaning: 0 },
  );

  const avgReceipts = totals.receipts / summaries.length;
  const avgList = totals.list / summaries.length;
  const avgCleaning = totals.cleaning / summaries.length;

  for (const member of summaries) {
    const receiptScore = avgReceipts > 0 ? member.stats.receiptsThisMonth / avgReceipts : 1;
    const listScore = avgList > 0 ? member.stats.listItemsThisMonth / avgList : 1;
    const cleaningScore = avgCleaning > 0 ? member.stats.cleaningDoneThisMonth / avgCleaning : 1;
    const average = (receiptScore + listScore + cleaningScore) / 3;
    scores.set(member.user_id, Math.round(average * 100));
  }

  return scores;
}

export async function resolveShopperNames(
  shopperIds: (string | null)[],
): Promise<Map<string, string | null>> {
  const ids = shopperIds.filter((id): id is string => Boolean(id));
  return fetchProfiles(ids);
}
