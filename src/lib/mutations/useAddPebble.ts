'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AddPebbleFailure, AddPebbleSuccess } from '@/types/addPebble';

const postPebble = async (url: string) => {
  const res = await fetch('/api/pebbles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) throw new Error('Network error');

  return res.json() as Promise<AddPebbleSuccess | AddPebbleFailure>;
};

const useAddPebble = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postPebble,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pebbles'] });
    },
  });
};

export default useAddPebble;
