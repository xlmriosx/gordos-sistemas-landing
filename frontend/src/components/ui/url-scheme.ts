const DEFAULT_SCHEME = 'https://' as const;

/** Schemes we accept when pasting or normalizing a full URL. */
const KNOWN_SCHEMES = ['https://', 'http://'] as const;

export type UrlScheme = (typeof KNOWN_SCHEMES)[number];

/** Strip a leading http(s) scheme so the editable part is host + path. */
export function stripUrlScheme(value: string): string {
  const trimmed = value.trim();
  for (const scheme of KNOWN_SCHEMES) {
    if (trimmed.toLowerCase().startsWith(scheme)) {
      return trimmed.slice(scheme.length);
    }
  }
  return trimmed;
}

/** Join scheme + host/path into a full URL. Empty host → empty string. */
export function joinUrlScheme(hostPath: string, scheme: UrlScheme = DEFAULT_SCHEME): string {
  const stripped = stripUrlScheme(hostPath);
  if (!stripped) return '';
  return `${scheme}${stripped}`;
}

/**
 * Loose http(s) URL check for form validation — rejects missing host and
 * obvious typos; does not fetch or resolve DNS.
 */
export function isValidHttpUrl(value: string): boolean {
  const full = value.trim();
  if (!/^https?:\/\/\S+$/i.test(full)) return false;
  try {
    const url = new URL(full);
    return Boolean(url.hostname);
  } catch {
    return false;
  }
}

export { DEFAULT_SCHEME };
