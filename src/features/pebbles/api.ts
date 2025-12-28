import { api } from '@/lib/api-client';
import { Pebble } from '@/types';

export function getPebbles(params?: {
  filter?: 'focused' | 'unfocused';
  sort?: 'priority' | 'createdAt';
}) {
  return api<Pebble[]>('/api/pebbles', { params });
}

export function updatePebbleFocus(id: string, focused: boolean) {
  return api<Pebble>(`/api/pebbles/${id}`, {
    method: 'PATCH',
    body: { focused },
  });
}
