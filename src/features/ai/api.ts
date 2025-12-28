import { api } from '@/lib/api-client';

export function explainWhyFocused(pebbleId: string) {
  return api<{ explanation: string }>('/api/ai/explain', {
    method: 'POST',
    body: { pebbleId },
  });
}
