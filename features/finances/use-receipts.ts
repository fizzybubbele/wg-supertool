import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useHouseholds } from '@/features/household/use-household';
import {
  confirmReceipt,
  fetchReceiptWithItems,
  fetchReceipts,
  uploadAndParseReceipt,
  type ReceiptItemInput,
} from '@/features/finances/receipt-service';

export function useReceipts() {
  const queryClient = useQueryClient();
  const { activeHousehold } = useHouseholds();
  const householdId = activeHousehold?.id;

  const receiptsQuery = useQuery({
    queryKey: ['receipts', householdId],
    queryFn: () => fetchReceipts(householdId!),
    enabled: Boolean(householdId),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['receipts', householdId] });

  const invalidateStats = () => {
    void queryClient.invalidateQueries({ queryKey: ['purchase-stats', householdId] });
    void queryClient.invalidateQueries({ queryKey: ['member-activity', householdId] });
  };

  const uploadMutation = useMutation({
    mutationFn: () => uploadAndParseReceipt(householdId!),
    onSuccess: invalidate,
  });

  const confirmMutation = useMutation({
    mutationFn: ({
      receiptId,
      items,
      meta,
      shoppedBy,
    }: {
      receiptId: string;
      items: ReceiptItemInput[];
      meta: { store_name: string | null; purchase_date: string | null; total_amount: number | null };
      shoppedBy: string;
    }) => confirmReceipt(receiptId, householdId!, items, meta, shoppedBy),
    onSuccess: () => {
      invalidate();
      invalidateStats();
    },
  });

  const loadReceiptMutation = useMutation({
    mutationFn: (receiptId: string) => fetchReceiptWithItems(receiptId),
  });

  return {
    receipts: receiptsQuery.data ?? [],
    isLoading: receiptsQuery.isLoading,
    uploadReceipt: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    confirmReceipt: confirmMutation.mutateAsync,
    isConfirming: confirmMutation.isPending,
    loadReceipt: loadReceiptMutation.mutateAsync,
    isLoadingReceipt: loadReceiptMutation.isPending,
  };
}
