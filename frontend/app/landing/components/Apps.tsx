import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

import { useCopy } from '../../copy';
import { CATEGORIES, appsInCategory, type Category } from '../data';

/**
 * The arsenal: the nine apps the collective ships, and the filter over them.
 *
 * The filter is real filtering, not a decoration: it decides which cards are
 * in the DOM. `data.ts` holds the mapping from a category to its apps, and
 * that mapping is what the filter test pins.
 */
export function Apps() {
  const copy = useCopy();
  const [category, setCategory] = useState<Category>('all');

  return (
    <section className="landing-section landing-apps" id="apps-section">
      <div className="landing-container">
        <header className="landing-apps__header">
          <div>
            <p className="landing-section__eyebrow landing-label-sm">{copy.apps.eyebrow}</p>
            <h2 className="landing-headline-xl">{copy.apps.title}</h2>
            <p className="landing-apps__lead landing-body-md">{copy.apps.lead}</p>
          </div>

          <div className="landing-apps__filters" role="group" aria-label={copy.apps.filterLabel}>
            {CATEGORIES.map((option) => (
              <button
                key={option}
                type="button"
                className="landing-filter"
                aria-pressed={category === option}
                onClick={() => setCategory(option)}
              >
                {copy.apps.filters[option]}
              </button>
            ))}
          </div>
        </header>

        <div className="landing-apps__grid">
          {appsInCategory(category).map((app) => {
            const words = copy.apps.apps[app.id];
            const Icon = app.icon;

            return (
              <article
                key={app.id}
                className={`landing-app${app.accent === 'primary' ? '' : ` landing-app--${app.accent}`}`}
              >
                <div className="landing-app__head">
                  <div className="landing-app__row">
                    <span className="landing-app__icon">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span className="landing-app__stack">{app.stack}</span>
                  </div>

                  <div>
                    <h3 className="landing-app__title landing-headline-sm">{words.title}</h3>
                    <p className="landing-app__description landing-body-md">{words.description}</p>
                  </div>

                  <div className="landing-app__tags">
                    {words.tags.map((tag, index) => (
                      <span
                        key={tag}
                        className={`landing-app__tag${index === 0 ? ' landing-app__tag--accent' : ''}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="landing-app__footer">
                  <a
                    className="landing-app__open landing-label-sm"
                    href={app.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {copy.apps.open}
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                  <span className="landing-app__seal">{words.seal}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
