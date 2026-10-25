/**
 * The app draws something on its first render.
 *
 * `build` and `lint` both pass on an app that throws while rendering, and a
 * throw during render leaves `#root` empty: a blank page that compiled clean.
 * This is the check that sees it. It renders the same tree `main.tsx` does,
 * through `AppProviders`, so it keeps meaning the same thing after a generated
 * app rewrites `App.tsx`.
 */
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import i18n from '../src/i18n';
import { Tip } from '../src/components/ui/tooltip';
import { App } from './App';
import { AppProviders } from './AppProviders';

describe('the app on its first render', () => {
  it('draws something instead of leaving the root empty', () => {
    const { container } = render(
      <AppProviders>
        <App />
      </AppProviders>,
    );
    expect(container.childElementCount).toBeGreaterThan(0);
  });

  it('is the landing now, with no empty state left behind', () => {
    const { container } = render(
      <AppProviders>
        <App />
      </AppProviders>,
    );
    expect(container.querySelector('.landing')).not.toBeNull();
    expect(screen.queryByText('Your app is still empty')).toBeNull();
  });

  it('mounts no dev chrome: the page shows no session bar and no pointer toolbar', async () => {
    // Warm the dev-only chunks before rendering: the bars arrive through
    // React.lazy, so a bar that was going to mount has to have mounted before
    // it is denied — otherwise this assertion would pass for the wrong reason.
    await import('../../tools/session-bar/SessionBar');
    await import('../../tools/pointer-toolbar/Toolbar');

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(document.documentElement.hasAttribute('data-app-session-bar')).toBe(false);
    expect(document.documentElement.hasAttribute('data-app-pointer-toolbar')).toBe(false);
    expect(document.body.querySelector('#app-session-bar')).toBeNull();
    expect(document.body.querySelector('#app-pointer-toolbar')).toBeNull();
  });

  it('reads nothing and shows no status code or JSON', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { container } = render(
      <AppProviders>
        <App />
      </AppProviders>,
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(container.textContent).not.toMatch(/\/api\/|\b[45]\d\d\b|null|[{}]/);
    fetchSpy.mockRestore();
  });

  it('speaks Spanish when the page is in Spanish', async () => {
    await act(() => i18n.changeLanguage('es'));
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'Pilares Morales & Doctrina Digital' }),
    ).toBeTruthy();
    await act(() => i18n.changeLanguage('en'));
  });
});

describe('AppProviders', () => {
  it('carries what a Tip needs', () => {
    expect(() =>
      render(
        <AppProviders>
          <Tip label="Ayuda">
            <button type="button">?</button>
          </Tip>
        </AppProviders>,
      ),
    ).not.toThrow();
  });

  it('is what stands between a Tip and a blank page', () => {
    // The guard for the guard: if this stopped throwing, the test above would
    // pass whether or not AppProviders did its job.
    const silence = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <Tip label="Ayuda">
          <button type="button">?</button>
        </Tip>,
      ),
    ).toThrow(/TooltipProvider/);
    silence.mockRestore();
  });
});
