import { useMutation, useQueryClient } from '@tanstack/react-query';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pebbles'] });
    },
  });
};

export default useDeletePebble;
