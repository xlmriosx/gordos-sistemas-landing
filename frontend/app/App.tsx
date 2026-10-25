import './app.css';
import { Landing } from './landing/Landing';

/**
 * The app IS the landing.
 *
 * The zero state this file used to render is gone: there is a real screen
 * now, and a page that says "your app is still empty" next to it would be
 * saying it about the Gordos Sistemas landing.
 *
 * The landing brings its own brand — its own tokens, its own type scale, its
 * own components — because it is a different brand from the kit in `../src/`.
 * That is a product decision, not a kit change: `../src/` stays the generic
 * design system it was promoted as, and the product theme lives in
 * `landing/`. See `landing/landing.css`.
 *
 * It reads nothing: whether the two halves talk is checked with `curl`
 * (backend/README.md), not by printing a status code at whoever opens the app.
 *
 * `ThemeToggle` and `LanguageToggle` exist in `../src/components/` and are
 * deliberately NOT mounted here. The landing has its own language switch,
 * built on the kit's `useLanguage`, because the kit's chrome is a different
 * brand on the same page.
 *
 * The dev-only annotation bars are not mounted here either. They live in
 * `DevToolbar.tsx`, they are the developer's tooling and not the page, and a
 * product screen with a session bar drawn across it is not the screen anyone
 * meant to ship. Mounting that component again is one line, and the module is
 * still here on purpose: it is the only place in `app/` allowed to import
 * from `../../tools/` (see `../../tools/AGENTS.md`).
 */
export function App() {
  return <Landing />;
}
