import type { defaultNS, enResources } from './resources';

/**
 * Makes every `t()` key checkable. `CustomTypeOptions` lives on the i18next
 * core (react-i18next only re-exports it), so that is the module to augment.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof enResources;
    returnNull: false;
  }
}
