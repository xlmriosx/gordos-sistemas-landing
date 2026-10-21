import type { enResources } from './resources';
import { esResources } from './resources';

/** Widen the JSON literal value types so only the key *shape* is compared. */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

/**
 * Compile-time EN/ES parity guard: a key present in `en` but missing from `es`
 * is a type error here. Type-only, so it is erased from the bundle.
 *
 * It does not catch *extra* keys in `es` — those are harmless dead weight, and
 * flagging them would fight the fallback behaviour i18next already provides.
 */
const esParity: Widen<typeof enResources> = esResources;
void esParity;
