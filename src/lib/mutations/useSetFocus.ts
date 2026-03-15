import { useMutation, useQueryClient } from '@tanstack/react-query';

type SetFocusResponse = {
  ok: boolean;
  data?: any;
  error?: string;
  rejection_reason?: string;
  alternatives?: string[];
};

const useSetFocus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (statement: string): Promise<SetFocusResponse> => {
      const res = await fetch('/api/focus', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statement }),
      });

      return res.json();
    },
    onSuccess: (data) => {
      if (data.ok && data.data) {
        // Update the cache with the ranked results from the focus API
        // instead of invalidating (which causes expensive refetches)
        queryClient.setQueryData(
          ['pebbles', 'ranked', data.data.focus?.id],
          data.data
        );
        queryClient.invalidateQueries({ queryKey: ['focus'] });
      }
    },
  });
};

export default useSetFocus;
