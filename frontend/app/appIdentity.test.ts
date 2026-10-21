/**
 * The four states `app-identity.json` can be in, and the one that used to be
 * dangerous.
 *
 * Absent and malformed already failed loudly — the build broke and somebody
 * read the error. The state worth a test suite is the third one: a well-formed
 * file missing a key built clean and rendered `undefined` on screen, which is
 * the failure whoever runs the app discovers instead of the build.
 *
 * There used to be a fifth test here, an anti-drift guard comparing
 * `PLACEHOLDER` with a shipped `app-identity.json`. This repo ships no such
 * file, so there is nothing left to drift from: the placeholder lives only in
 * `appIdentity.ts`.
 *
 * `resolveIdentity` takes its input as text so these can be exercised without
 * moving a real file around underneath a real build. That the build itself
 * survives an absent file is a property of `import.meta.glob`, verified by
 * running `npm run build` against the three states by hand — a unit test cannot
 * see a build error.
 */
import { describe, expect, it, vi } from 'vitest';

import { PLACEHOLDER, resolveIdentity } from './appIdentity';

/** Silences the warning and lets a test assert that one was emitted. */
function withWarn() {
  return vi.fn<(message: string) => void>();
}

describe('resolveIdentity', () => {
  it('falls back whole when the file is not there', () => {
    const warn = withWarn();
    expect(resolveIdentity(undefined, warn)).toEqual(PLACEHOLDER);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('was not found');
  });

  it('falls back whole when the file is not valid JSON', () => {
    const warn = withWarn();
    expect(resolveIdentity('{ this is not json', warn)).toEqual(PLACEHOLDER);
    expect(warn).toHaveBeenCalledOnce();
  });

  it('falls back whole when the file is valid JSON but not an object', () => {
    const warn = withWarn();
    for (const raw of ['null', '"a string"', '[]', '42']) {
      expect(resolveIdentity(raw, warn)).toEqual(PLACEHOLDER);
    }
  });

  it('never returns undefined for an empty object — the state that used to reach the screen', () => {
    const warn = withWarn();
    const identity = resolveIdentity('{}', warn);

    expect(identity).toEqual(PLACEHOLDER);
    expect(identity.displayName).toBeTypeOf('string');
    expect(identity.slug).toBeTypeOf('string');
    expect(warn.mock.calls[0][0]).toContain('displayName, slug');
  });

  it('keeps the good key when only the other one is missing', () => {
    const warn = withWarn();

    expect(resolveIdentity('{"displayName": "Renovaciones"}', warn)).toEqual({
      displayName: 'Renovaciones',
      slug: PLACEHOLDER.slug,
    });

    expect(resolveIdentity('{"slug": "renovaciones"}', warn)).toEqual({
      displayName: PLACEHOLDER.displayName,
      slug: 'renovaciones',
    });
  });

  it('treats an empty or whitespace-only value as missing, and trims the rest', () => {
    const warn = withWarn();

    expect(resolveIdentity('{"displayName": "  ", "slug": "ok"}', warn).displayName).toBe(
      PLACEHOLDER.displayName,
    );
    expect(resolveIdentity('{"displayName": "  Renovaciones  ", "slug": "ok"}', warn)).toEqual({
      displayName: 'Renovaciones',
      slug: 'ok',
    });
  });

  it('treats a non-string value as missing rather than rendering it', () => {
    const warn = withWarn();
    expect(resolveIdentity('{"displayName": 42, "slug": {"a": 1}}', warn)).toEqual(PLACEHOLDER);
  });

  it('says nothing when the file is fine', () => {
    const warn = withWarn();
    expect(resolveIdentity('{"displayName": "Renovaciones", "slug": "renovaciones"}', warn)).toEqual(
      { displayName: 'Renovaciones', slug: 'renovaciones' },
    );
    expect(warn).not.toHaveBeenCalled();
  });
});
