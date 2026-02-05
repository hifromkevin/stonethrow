export type HtmlMetadata = {
  title: string | null;
  image: string | null;
  imageSource?: 'og' | 'twitter' | 'youtube' | 'dom';
  description: string | null;
  html: string;
  rawText: string;
  paywalled: boolean;
};
