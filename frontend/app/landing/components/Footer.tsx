import { useCopy } from '../../copy';

/**
 * The footer: the creed, the three columns, the legal notice.
 *
 * The third column has no link: it carries the legal notice instead, which is
 * where the design puts it.
 */
export function Footer() {
  const copy = useCopy();

  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        <div className="landing-footer__creed">
          <p className="landing-footer__motto landing-headline-sm">{copy.footer.motto}</p>
          <p className="landing-footer__gloss landing-label-sm">{copy.footer.gloss}</p>
        </div>

        <div className="landing-footer__columns">
          {copy.footer.columns.map((column) => (
            <div key={column.heading} className="landing-footer__column">
              <span className="landing-footer__heading landing-label-md">{column.heading}</span>
              <p className="landing-body-md">{column.body}</p>

              {column.link ? (
                <div className="landing-footer__links">
                  <a
                    className="landing-footer__link landing-label-sm"
                    href={column.href}
                    target={column.href.startsWith('http') ? '_blank' : undefined}
                    rel={column.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                  >
                    {column.link}
                  </a>
                </div>
              ) : (
                <p className="landing-footer__legal landing-label-sm">{copy.footer.legal}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
