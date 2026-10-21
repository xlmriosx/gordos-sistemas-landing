import { describe, expect, it } from 'vitest';
import enUi from '../i18n/locales/en/ui.json';
import esUi from '../i18n/locales/es/ui.json';

const NAMESPACES: Record<string, [en: object, es: object]> = {
  ui: [enUi, esUi],
};

/** Flattens nested keys to dotted paths, e.g. `{ a: { b: 1 } }` -> `["a.b"]`. */
function keyPaths(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, val]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return val !== null && typeof val === 'object' && !Array.isArray(val)
      ? keyPaths(val, path)
      : [path];
  });
}

describe('i18n EN/ES key parity', () => {
  for (const [namespace, [enJson, esJson]] of Object.entries(NAMESPACES)) {
    it(`${namespace}.json has the same keys in both locales`, () => {
      const enKeys = new Set(keyPaths(enJson));
      const esKeys = new Set(keyPaths(esJson));

      const missingInEs = [...enKeys].filter((k) => !esKeys.has(k));
      const missingInEn = [...esKeys].filter((k) => !enKeys.has(k));

      expect(missingInEs, `keys missing in es/${namespace}.json`).toEqual([]);
      expect(missingInEn, `keys missing in en/${namespace}.json`).toEqual([]);
    });
  }
});
