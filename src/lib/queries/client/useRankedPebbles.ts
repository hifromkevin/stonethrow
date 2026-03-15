import { useQuery } from '@tanstack/react-query';
import type { RankedPebblesResponse } from '@/types/scoring';

const fetchRankedPebbles = async (
  focusId?: string,
  isPollingForUpdates = false
): Promise<RankedPebblesResponse> => {
  const params = new URLSearchParams({ ranked: 'true' });
  if (focusId) params.set('focus_id', focusId);
  if (isPollingForUpdates) params.set('poll_updates', 'true');

  const res = await fetch(`/api/pebbles?${params}`);
  if (!res.ok) throw new Error('Failed to fetch ranked pebbles');
  return res.json();
};

const useRankedPebbles = (focusId?: string) => {
  return useQuery({
    queryKey: ['pebbles', 'ranked', focusId],
    queryFn: ({ meta }) => {
      // Check if this is a background refetch (polling for updates)
      const isPollingForUpdates = meta?.isPolling === true;
      return fetchRankedPebbles(focusId, isPollingForUpdates);
    },
    enabled: !!focusId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data?.scoringStatus?.isScoring) return false;

      // Stop polling once all top results have Haiku enrichment
      const topResults = [
        data.primary,
        ...(data.focused?.slice(0, 7) ?? []),
      ].filter((r): r is NonNullable<typeof r> => r != null);

      if (topResults.length > 0 && topResults.every((r) => r.focus_score != null)) {
        return false;
      }

      return 10000; // Poll every 10 seconds
    },
    staleTime: 30000, // Consider data fresh for 30s
  });
};

export default useRankedPebbles;
