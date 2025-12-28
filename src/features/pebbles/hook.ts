import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPebbles, updatePebbleFocus } from './api';

export function usePebbles(params?: Parameters<typeof getPebbles>[0]) {
  return useQuery({
    queryKey: ['pebbles', params],
    queryFn: () => getPebbles(params),
  });
}

export function useTogglePebbleFocus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, focused }: { id: string; focused: boolean }) =>
      updatePebbleFocus(id, focused),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pebbles'] });
    },
  });
}
