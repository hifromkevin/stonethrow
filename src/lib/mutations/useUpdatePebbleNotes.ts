import { useMutation, useQueryClient } from '@tanstack/react-query';

const useUpdatePebbleNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const res = await fetch(`/api/pebbles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Failed to update notes');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pebbles', 'completed'] });
    },
  });
};

export default useUpdatePebbleNotes;
