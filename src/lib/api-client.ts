import { ApiError, RequestOptions } from '@/types/api';

function buildUrl(url: string, params?: RequestOptions['params']) {
  if (!params) return url;

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      search.append(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `${url}?${query}` : url;
}

export async function api<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, params } = options;

  const res = await fetch(buildUrl(url, params), {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const message =
      (await res.json().catch(() => null))?.message ?? res.statusText;

    throw {
      message,
      status: res.status,
    } satisfies ApiError;
  }

  return res.json();
}
