export async function deletePebble(id: string) {
  const res = await fetch(`/api/pebbles/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? 'Failed to delete pebble');
  }

  return true;
}
