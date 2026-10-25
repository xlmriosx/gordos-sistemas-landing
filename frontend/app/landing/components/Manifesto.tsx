import { useCopy } from '../../copy';

/**
 * The manifesto, in the terminal the design puts it in.
 *
 * Each point keeps the phrase the design emphasises and the colour it
 * emphasises it in — gold for the refuge of free code, plain ink for the
 * refusal to ask permission, amber for the three maxims.
 */
export function Manifesto() {
  const copy = useCopy();

  return (
    <section className="landing-section landing-manifesto" id="manifiesto-section">
      <div className="landing-container">
        <header className="landing-manifesto__header">
          <div>
            <p className="landing-manifesto__eyebrow landing-label-sm">{copy.manifesto.eyebrow}</p>
            <h2 className="landing-headline-lg">{copy.manifesto.title}</h2>
          </div>
          <p className="landing-manifesto__version landing-label-sm">
            <span className="landing-dot" aria-hidden="true" />
            {copy.manifesto.version}
          </p>
        </header>

        <div className="landing-terminal">
          <div className="landing-terminal__bar">
            <div className="landing-terminal__lights">
              <span className="landing-terminal__light landing-terminal__light--error" />
              <span className="landing-terminal__light landing-terminal__light--tertiary" />
              <span className="landing-terminal__light landing-terminal__light--primary" />
              <span className="landing-terminal__session landing-label-sm">
                {copy.manifesto.session}
              </span>
            </div>
            <span className="landing-terminal__security">{copy.manifesto.security}</span>
          </div>

          <div className="landing-terminal__body landing-label-md">
            <p className="landing-terminal__prompt">
              <span className="landing-terminal__prompt-mark" aria-hidden="true">
                $
              </span>
              {copy.manifesto.command}
            </p>

            <div className="landing-terminal__points">
              <p className="landing-terminal__title">{copy.manifesto.heading}</p>

              {copy.manifesto.points.map((point, index) => (
                <p key={index}>
                  {point.before}
                  {point.highlight && (
                    <span className={`landing-terminal__strong landing-terminal__strong--${point.tone}`}>
                      {point.highlight}
                    </span>
                  )}
                  {point.after}
                </p>
              ))}

              <p className="landing-terminal__seal">{copy.manifesto.seal}</p>
            </div>

            <p className="landing-terminal__prompt">
              <span className="landing-terminal__prompt-mark" aria-hidden="true">
                $
              </span>
              <span className="landing-terminal__cursor">_</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
