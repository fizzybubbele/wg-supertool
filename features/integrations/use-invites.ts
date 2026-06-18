import { useMutation } from '@tanstack/react-query';

import { acceptHouseholdInvite, createHouseholdInvite } from '@/features/integrations/invite-service';
import { useHouseholds } from '@/features/household/use-household';

export function useHouseholdInvites() {
  const { activeHousehold } = useHouseholds();

  const createInvite = useMutation({
    mutationFn: async () => {
      if (!activeHousehold) {
        throw new Error('Kein aktiver Haushalt');
      }
      return createHouseholdInvite(activeHousehold.id);
    },
  });

  const acceptInvite = useMutation({
    mutationFn: acceptHouseholdInvite,
  });

  return { createInvite, acceptInvite };
}
