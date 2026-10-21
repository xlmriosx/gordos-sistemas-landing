import { GitMerge, Gavel, MessagesSquare, Terminal, Zap } from 'lucide-react';

import { useCopy } from '../../copy';

/**
 * The call to the community: contribute, talk, fund.
 *
 * The third card is marked as coming soon because it is: donating needs a
 * wallet that does not exist yet, and a link that pretends otherwise is a
 * broken promise.
 */
const ITEM_ICONS = [GitMerge, MessagesSquare, Zap];
const ITEM_TONES = ['primary', 'secondary', 'tertiary'] as const;

export function Community() {
  const copy = useCopy();

  return (
    <section className="landing-section landing-community" id="comunidad-section">
      <div className="landing-community__veil" aria-hidden="true" />

      <div className="landing-container landing-community__inner">
        <span className="landing-community__mark">
          <Terminal size={30} aria-hidden="true" />
        </span>

        <h2 className="landing-community__title landing-headline-xl">{copy.community.title}</h2>

        <div className="landing-community__grid">
          {copy.community.items.map((item, index) => {
            const Icon = ITEM_ICONS[index];
            const tone = ITEM_TONES[index];

            return (
              <a
                key={item.title}
                id={item.soon ? 'donar-proximamente' : undefined}
                className={`landing-community__card landing-community__card--${tone}`}
                href={item.href}
              >
                {item.soon && <span className="landing-community__soon">{item.soon}</span>}
                <Icon size={24} aria-hidden="true" />
                <span className="landing-community__label landing-label-md">{item.title}</span>
                <span className="landing-community__hint landing-label-sm">{item.hint}</span>
              </a>
            );
          })}
        </div>

        <p className="landing-community__seal landing-label-sm">
          <Gavel size={14} aria-hidden="true" />
          {copy.community.seal}
        </p>
      </div>
    </section>
  );
}
