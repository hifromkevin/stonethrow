import { useQuery } from '@tanstack/react-query';
import { Pebble } from '@/types';

const fetchPebbles = async (): Promise<Pebble[]> => {
  const res = await fetch('/api/pebbles');
  if (!res.ok) throw new Error('Failed to fetch pebbles');
  return res.json();
};

const usePebbles = () => {
  return useQuery({
    queryKey: ['pebbles'],
    queryFn: fetchPebbles,
  });
};

export default usePebbles;
