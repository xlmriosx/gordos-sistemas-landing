import { BadgeCheck, FolderCode, Landmark, Shield, Users } from 'lucide-react';

import { useCopy } from '../../copy';

/**
 * The hero: the badge, the monumental wordmark, the three mottoes, the calls
 * to action, the foundation slab and its four numbers.
 *
 * The slab is the marble plaque from the stitch folder, served from this
 * app's own `public/`: the page makes a point about not depending on third
 * parties, and a hotlinked image would make that point badly.
 */
const METRIC_ICONS = [FolderCode, Shield, Landmark, Users];
const METRIC_TONES = ['primary', 'tertiary', 'secondary', 'primary'] as const;

export function Hero() {
  const copy = useCopy();

  return (
    <section className="landing-hero" id="top">
      <div className="landing-hero__glow" aria-hidden="true" />

      <p className="landing-hero__badge landing-label-sm">
        <span className="landing-dot" aria-hidden="true" />
        {copy.hero.badge}
      </p>

      <h1 className="landing-hero__title landing-display-lg">{copy.hero.title}</h1>

      <div className="landing-hero__motto landing-headline-sm">
        {copy.hero.motto.map((motto, index) => (
          <span key={motto} className="landing-hero__motto-item">
            {index > 0 && (
              <span className="landing-hero__motto-separator" aria-hidden="true">
                ·
              </span>
            )}
            {motto}
          </span>
        ))}
      </div>

      <p className="landing-hero__subtitle landing-body-lg">{copy.hero.subtitle}</p>

      <div className="landing-hero__actions">
        <a className="landing-button landing-button--primary" href="#apps-section">
          {copy.hero.actions.apps}
        </a>
        <a className="landing-button landing-button--secondary" href="#manifiesto-section">
          {copy.hero.actions.manifesto}
        </a>
        <a
          className="landing-button landing-button--ghost"
          href="https://github.com/gordos-sistemas"
          target="_blank"
          rel="noreferrer noopener"
        >
          {copy.hero.actions.github}
        </a>
      </div>

      <div className="landing-slab">
        <div className="landing-slab__panel">
          <div className="landing-slab__image-wrap">
            <img
              className="landing-slab__image"
              src="/brand/gordos/placa-fundacional.png"
              alt={copy.hero.slab.imageAlt}
            />
            <div className="landing-slab__veil" aria-hidden="true" />
            <div className="landing-slab__caption">
              <div className="landing-slab__plaque">
                <p className="landing-slab__plaque-code landing-label-sm">{copy.hero.slab.code}</p>
                <p className="landing-slab__plaque-title landing-headline-sm">
                  {copy.hero.slab.title}
                </p>
              </div>
              <p className="landing-slab__hash landing-label-sm">
                <BadgeCheck size={14} aria-hidden="true" />
                {copy.hero.slab.hash}
              </p>
            </div>
          </div>

          <div className="landing-metrics">
            {copy.hero.metrics.map((metric, index) => {
              const Icon = METRIC_ICONS[index];
              const tone = METRIC_TONES[index];
              return (
                <div
                  key={metric.value}
                  className={`landing-metric${tone === 'primary' ? '' : ` landing-metric--${tone}`}`}
                >
                  <span className="landing-metric__icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <div className="landing-metric__value landing-headline-sm">{metric.value}</div>
                    <div className="landing-metric__label landing-label-sm">{metric.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
