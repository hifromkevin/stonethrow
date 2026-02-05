import { useQuery } from '@tanstack/react-query';
import type { FocusStatement } from '@/types/scoring';

type FocusResponse = {
  ok: boolean;
  data: FocusStatement | null;
};

const useFocus = () => {
  return useQuery({
    queryKey: ['focus'],
    queryFn: async (): Promise<FocusStatement | null> => {
      const res = await fetch('/api/focus');
      if (!res.ok) return null;
      const json: FocusResponse = await res.json();
      return json.data;
    },
  });
};

export default useFocus;
