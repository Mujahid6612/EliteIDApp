/**
 * Adds timestamp parameter (ts) to a URL
 * Handles URLs with or without existing query parameters
 */
export const addTimestampParam = (url: string): string => {
  if (!url) return url;
  
  const ts = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}ts=${ts}`;
};

