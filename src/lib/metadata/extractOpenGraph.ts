export function extractOpenGraph(html: string) {
  const get = (prop: string) => {
    const match = html.match(
      new RegExp(`<meta property="og:${prop}" content="(.*?)"`, 'i')
    );
    return match?.[1] ?? null;
  };

  return {
    title: get('title'),
    description: get('description'),
    siteName: get('site_name'),
  };
}
