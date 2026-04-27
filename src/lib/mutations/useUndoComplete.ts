import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Pebble } from '@/types';

const useUndoComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pebbles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_complete: false, completed_at: null }),
      });
      if (!res.ok) throw new Error('Failed to undo complete');
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['pebbles'] });

      const previousCompleted = queryClient.getQueryData<Pebble[]>([
        'pebbles',
        'completed',
      ]);
      const previousFlat = queryClient.getQueryData<Pebble[]>(['pebbles']);

      // Optimistically remove from completed list
      if (previousCompleted) {
        queryClient.setQueryData<Pebble[]>(
          ['pebbles', 'completed'],
          previousCompleted.filter((p) => p.id !== id)
        );
      }

      // Optimistically add back to active flat list (prepend)
      const restored = previousCompleted?.find((p) => p.id === id);
      if (restored && previousFlat) {
        queryClient.setQueryData<Pebble[]>(
          ['pebbles'],
          [{ ...restored, is_complete: false, completed_at: undefined }, ...previousFlat]
        );
      }

      return { previousCompleted, previousFlat };
    },
    onError: (_err, _id, context) => {
      if (context?.previousCompleted) {
        queryClient.setQueryData(['pebbles', 'completed'], context.previousCompleted);
      }
      if (context?.previousFlat) {
        queryClient.setQueryData(['pebbles'], context.previousFlat);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pebbles'] });
      queryClient.invalidateQueries({ queryKey: ['pebbles', 'completed'] });
    },
  });
};

export default useUndoComplete;
