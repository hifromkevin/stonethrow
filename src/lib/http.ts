const http = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) throw new Error(`HTTP error ${res.status}`);

  const contentType = res.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error('Expected JSON response');
  }

  return res.json();
};

export default http;
