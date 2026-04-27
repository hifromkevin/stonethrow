import { useQuery } from '@tanstack/react-query';
import { Pebble } from '@/types';

const fetchCompletedPebbles = async (): Promise<Pebble[]> => {
  const res = await fetch('/api/pebbles?view=done');
  if (!res.ok) throw new Error('Failed to fetch completed pebbles');
  return res.json();
};

const useCompletedPebbles = () => {
  return useQuery({
    queryKey: ['pebbles', 'completed'],
    queryFn: fetchCompletedPebbles,
  });
};

export default useCompletedPebbles;
