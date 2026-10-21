import { Bitcoin, CheckCircle2, Eye, Lock } from 'lucide-react';

import { useCopy } from '../../copy';

/**
 * The three moral pillars: the Roman law the collective builds on, and the
 * two lines each pillar defends.
 *
 * The pillars keep the design's order and their own wording. The second
 * pillar lists two points, not three: the design leaves one slot empty, and
 * filling it would be inventing a rule the collective did not publish.
 */
const PILLAR_ICONS = [Eye, Lock, Bitcoin];
const PILLAR_TONES = ['primary', 'secondary', 'tertiary'] as const;

export function Pillars() {
  const copy = useCopy();

  return (
    <section className="landing-section landing-pillars" id="pilares-section">
      <div className="landing-container">
        <header className="landing-section__header">
          <p className="landing-section__eyebrow landing-label-sm">{copy.pillars.eyebrow}</p>
          <h2 className="landing-headline-xl">{copy.pillars.title}</h2>
          <p className="landing-section__lead landing-body-md">{copy.pillars.lead}</p>
        </header>

        <div className="landing-pillars__grid">
          {copy.pillars.items.map((pillar, index) => {
            const Icon = PILLAR_ICONS[index];
            const tone = PILLAR_TONES[index];

            return (
              <article
                key={pillar.title}
                className={`landing-pillar${tone === 'primary' ? '' : ` landing-pillar--${tone}`}`}
              >
                <div>
                  <div className="landing-pillar__head landing-label-sm">
                    <span>{pillar.marker}</span>
                    <Icon size={28} aria-hidden="true" />
                  </div>
                  <h3 className="landing-pillar__title landing-headline-lg">{pillar.title}</h3>
                  <p className="landing-pillar__subtitle landing-label-sm">{pillar.subtitle}</p>
                  <p className="landing-pillar__body landing-body-md">{pillar.body}</p>
                </div>

                <ul className="landing-pillar__list">
                  {pillar.points.map((point) => (
                    <li key={point} className="landing-pillar__item landing-label-sm">
                      <CheckCircle2 size={14} aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
