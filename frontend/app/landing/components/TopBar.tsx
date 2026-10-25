import { useEffect, useState } from 'react';
import { ShieldCheck, Terminal } from 'lucide-react';

import { useLanguage, type Language } from '../../../src/i18n';
import { useCopy } from '../../copy';

/**
 * The sections the nav points at, in the order the page stacks them.
 *
 * One list, so the links and the mark can never disagree about which
 * sections exist or in which order they come.
 */
const NAV_ITEMS = [
  { section: 'top', label: 'home' },
  { section: 'pilares-section', label: 'pillars' },
  { section: 'apps-section', label: 'apps' },
  { section: 'manifiesto-section', label: 'manifesto' },
] as const;

/**
 * The section the visitor is reading, when the page can say.
 *
 * The reading line sits 40% down the viewport: above it the visitor is still
 * in the section they entered, below it they are already in the next one. A
 * section with no box cannot be the one in view, so a page without layout
 * leaves the mark where the visitor put it instead of guessing.
 */
function sectionInView(): string | null {
  const line = window.innerHeight * 0.4;

  for (const item of NAV_ITEMS) {
    const section = document.getElementById(item.section);
    if (!section) continue;

    const { top, bottom } = section.getBoundingClientRect();
    if (top === 0 && bottom === 0) continue;
    if (top <= line && bottom > line) return item.section;
  }

  return null;
}

/**
 * The top bar: the wordmark, the nav, the call to the cause, the language
 * switch.
 *
 * The switch is the kit's own `useLanguage`, not a second state of its own:
 * the landing and the kit must never disagree about which language the app is
 * in. The landing only dresses it — the kit's chrome would be a different
 * brand on the same page.
 *
 * The nav marks the option the visitor is on: the one they select stays
 * marked, and the mark follows the section they scroll into, so the bar never
 * names a section they left behind.
 */
export function TopBar() {
  const copy = useCopy();
  const [language, setLanguage] = useLanguage();
  const [marked, setMarked] = useState<string>(NAV_ITEMS[0].section);

  const links = NAV_ITEMS.map((item) => ({
    section: item.section,
    href: `#${item.section}`,
    label: copy.topbar.nav[item.label],
  }));

  useEffect(() => {
    const mark = () => {
      const inView = sectionInView();
      if (inView) setMarked(inView);
    };

    mark();
    window.addEventListener('scroll', mark, { passive: true });
    window.addEventListener('resize', mark);
    return () => {
      window.removeEventListener('scroll', mark);
      window.removeEventListener('resize', mark);
    };
  }, []);

  function choose(next: Language) {
    setLanguage(next);
  }

  return (
    <header className="landing-topbar">
      <a className="landing-topbar__brand" href="#top">
        <span className="landing-topbar__mark">
          <Terminal size={22} aria-hidden="true" />
        </span>
        <span className="landing-topbar__names">
          <span className="landing-topbar__name landing-headline-sm">{copy.topbar.name}</span>
          <span className="landing-topbar__tagline landing-label-sm">
            <span className="landing-dot" aria-hidden="true" />
            {copy.topbar.tagline}
          </span>
        </span>
      </a>

      <nav className="landing-topbar__nav" aria-label={copy.topbar.navLabel}>
        {links.map((link) => (
          <a
            key={link.section}
            className="landing-topbar__link landing-label-md"
            href={link.href}
            aria-current={marked === link.section ? 'page' : undefined}
            onClick={() => setMarked(link.section)}
          >
            {link.label}
          </a>
        ))}
        <a
          className="landing-topbar__link landing-label-md"
          href="https://github.com/gordos-sistemas"
          target="_blank"
          rel="noreferrer noopener"
        >
          {copy.topbar.nav.github}
        </a>
      </nav>

      <div className="landing-topbar__actions">
        <a className="landing-topbar__cta landing-label-md" href="#comunidad-section">
          <ShieldCheck size={14} aria-hidden="true" />
          {copy.topbar.cta}
        </a>

        <div className="landing-lang" role="group" aria-label={copy.topbar.language.label}>
          <button
            type="button"
            className="landing-lang__option"
            aria-label={copy.topbar.language.english}
            aria-pressed={language === 'en'}
            onClick={() => choose('en')}
          >
            EN
          </button>
          <button
            type="button"
            className="landing-lang__option"
            aria-label={copy.topbar.language.spanish}
            aria-pressed={language === 'es'}
            onClick={() => choose('es')}
          >
            ES
          </button>
        </div>

        <img className="landing-topbar__seal" src="/brand/gordos/lion.png" alt="" />
      </div>
    </header>
  );
}
