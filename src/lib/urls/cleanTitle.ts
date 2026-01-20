import he from 'he';

const cleanTitle = (raw: string | null | undefined): string | null => {
  if (!raw) return '';

  return he
    .decode(raw)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\u200B/g, '')
    .trim();
};

export default cleanTitle;
