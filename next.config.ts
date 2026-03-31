import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['voyageai'],
  // cheerio is ESM-only ("type": "module") and must be kept external so Next.js
  // doesn't try to bundle it — bundling ESM packages into the CJS server bundle
  // fails silently and causes extractRawText to throw, making extractHtmlMetadata
  // return null (empty title, image, description, raw_text on every pebble).
  serverExternalPackages: ['cheerio'],
};

export default nextConfig;
