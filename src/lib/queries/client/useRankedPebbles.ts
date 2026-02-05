import { useQuery } from '@tanstack/react-query';
import type { RankedPebblesResponse } from '@/types/scoring';

const fetchRankedPebbles = async (
  focusId?: string
): Promise<RankedPebblesResponse> => {
  const params = new URLSearchParams({ ranked: 'true' });
  if (focusId) params.set('focus_id', focusId);

  const res = await fetch(`/api/pebbles?${params}`);
  if (!res.ok) throw new Error('Failed to fetch ranked pebbles');
  return res.json();
};

const useRankedPebbles = (focusId?: string) => {
  return useQuery({
    queryKey: ['pebbles', 'ranked', focusId],
    queryFn: () => fetchRankedPebbles(focusId),
    enabled: !!focusId,
    refetchInterval: (query) => {
      // Poll every 3s while waiting for focus scores to be computed
      const data = query.state.data;
      if (data?.primary?.focus_score) return false;
      return 3000;
    },
  });
};

export default useRankedPebbles;
