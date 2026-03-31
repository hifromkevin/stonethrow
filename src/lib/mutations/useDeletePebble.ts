import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Pebble } from '@/types';
import type { RankedPebblesResponse } from '@/types/scoring';

const useDeletePebble = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pebbles/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete pebble');
      }
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['pebbles'] });

      const previousFlat = queryClient.getQueryData<Pebble[]>(['pebbles']);
      const rankedQueries = queryClient.getQueriesData<RankedPebblesResponse>({
        queryKey: ['pebbles', 'ranked'],
      });

      // Optimistically remove from flat list
      if (previousFlat) {
        queryClient.setQueryData<Pebble[]>(
          ['pebbles'],
          previousFlat.filter((p) => p.id !== id)
        );
      }

      // Optimistically remove from all ranked caches
      for (const [queryKey, data] of rankedQueries) {
        if (!data) continue;
        queryClient.setQueryData<RankedPebblesResponse>(queryKey, {
          ...data,
          primary: data.primary?.pebble.id === id ? null : data.primary,
          focused: data.focused.filter((r) => r.pebble.id !== id),
          collection: data.collection.filter((r) => r.pebble.id !== id),
          other: data.other.filter((r) => r.pebble.id !== id),
        });
      }

      return { previousFlat, rankedQueries };
    },
    onError: (_err, _id, context) => {
      if (context?.previousFlat) {
        queryClient.setQueryData(['pebbles'], context.previousFlat);
      }
      for (const [queryKey, data] of context?.rankedQueries ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pebbles'] });
    },
  });
};

export default useDeletePebble;
