const canonicalizeUrl = (raw: string) => {
  const url = new URL(raw);

  const bannedParams = [/^utm_/, 'ref', 'fbclid', 'gclid', 'mc_cid', 'mc_eid'];

  for (const key of [...url.searchParams.keys()]) {
    if (
      bannedParams.some((p) => (p instanceof RegExp ? p.test(key) : p === key))
    )
      url.searchParams.delete(key);
  }

  url.hash = '';

  return url.toString();
};
export default canonicalizeUrl;
