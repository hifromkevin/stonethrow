const extractDomain = (url: string): string => {
  try {
    const { hostname } = new URL(url);

    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};
export default extractDomain;
