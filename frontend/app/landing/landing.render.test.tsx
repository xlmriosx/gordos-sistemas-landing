/**
 * The landing draws the design: its wordmark, its three mottoes, its nine
 * apps, its manifesto, its call to the community and its footer.
 *
 * The design's own copy is Spanish, so these assertions run in Spanish: the
 * page has to speak the language the design speaks, not the kit's default.
 */
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import i18n from '../../src/i18n';
import { App } from '../App';
import { AppProviders } from '../AppProviders';

async function renderInSpanish() {
  await act(() => i18n.changeLanguage('es'));
  return render(
    <AppProviders>
      <App />
    </AppProviders>,
  );
}

afterEach(async () => {
  await act(() => i18n.changeLanguage('en'));
  vi.restoreAllMocks();
});

describe('the Gordos Sistemas landing', () => {
  it('opens with the wordmark and the three mottoes', async () => {
    const { container } = await renderInSpanish();

    const hero = container.querySelector('.landing-hero');
    expect(hero).not.toBeNull();

    const inHero = within(hero as HTMLElement);
    expect(inHero.getByRole('heading', { level: 1, name: 'Gordos Sistemas' })).toBeTruthy();
    expect(inHero.getByText('HONESTE VIVERE')).toBeTruthy();
    expect(inHero.getByText('ALTERUM NON LAEDERE')).toBeTruthy();
    expect(inHero.getByText('SUUM CUIQUE TRIBUERE')).toBeTruthy();
  });

  it('states the three moral pillars', async () => {
    await renderInSpanish();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Pilares Morales & Doctrina Digital' }),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'HONESTE VIVERE' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'ALTERUM NON LAEDERE' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'SUUM CUIQUE TRIBUERE' })).toBeTruthy();
  });

  it('lists the nine apps, each with its stack and its own seal', async () => {
    const { container } = await renderInSpanish();

    const arsenal = container.querySelector('.landing-apps');
    expect(arsenal).not.toBeNull();

    const inArsenal = within(arsenal as HTMLElement);
    expect(inArsenal.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
      'Municipios Argentinos',
      'DatosHoy Universidades',
      'Rutas Argentinas',
      'Mendoza Transparente',
      'Viento en Contra',
      'Bacheame',
      'RIGI.ar',
      'Preciazos',
      'SeInunda.ar',
    ]);
    expect(inArsenal.getByText('TypeScript · Mapbox')).toBeTruthy();
    expect(inArsenal.getByText('[ Radar Fiscal ]')).toBeTruthy();
  });

  it('shows the manifesto and the call to the community', async () => {
    await renderInSpanish();

    expect(screen.getByRole('heading', { level: 2, name: 'El Manifiesto Digital' })).toBeTruthy();
    expect(screen.getByText(/MANIFIESTO DE LOS GORDOS SISTEMAS/)).toBeTruthy();
    expect(screen.getByText('>> ¡VIVA LA LIBERTAD, CARAJO! <<')).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Sumate a las Fuerzas del Ciberespacio' }),
    ).toBeTruthy();
  });

  it('closes with the creed and the legal notice', async () => {
    await renderInSpanish();

    expect(
      screen.getByText('Honeste vivere · Alterum non laedere · Suum cuique tribuere'),
    ).toBeTruthy();
    expect(
      screen.getByText('© 2026 GORDOS SISTEMAS. LIBERTAD DIGITAL IRRESTRICTA.'),
    ).toBeTruthy();
  });

  it('marks the nav option the visitor selects', async () => {
    await renderInSpanish();

    const home = screen.getByRole('link', { name: 'INICIO' });
    const apps = screen.getByRole('link', { name: 'APLICACIONES & HERRAMIENTAS' });

    // The page opens on the hero, so the first option is the marked one.
    expect(home.getAttribute('aria-current')).toBe('page');
    expect(apps.getAttribute('aria-current')).toBeNull();

    await userEvent.click(apps);

    // The mark moves to the selected option and stays there: the visitor
    // chose it, so it is the one the nav names.
    expect(apps.getAttribute('aria-current')).toBe('page');
    expect(home.getAttribute('aria-current')).toBeNull();
  });

  it('moves the mark to the section the visitor scrolls into', async () => {
    await renderInSpanish();

    // jsdom has no layout engine, so the sections are given the boxes a real
    // page gives them: one of them holds the reading line, the others are
    // above it or still below it.
    const line = window.innerHeight * 0.4;
    const boxes: Record<string, { top: number; bottom: number }> = {
      top: { top: -line - 200, bottom: -200 },
      'pilares-section': { top: -200, bottom: line - 100 },
      'apps-section': { top: line - 100, bottom: line + 400 },
      'manifiesto-section': { top: line + 400, bottom: line + 900 },
    };

    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      const box = boxes[this.id];
      return {
        top: box?.top ?? 0,
        bottom: box?.bottom ?? 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    });

    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(screen.getByRole('link', { name: 'APLICACIONES & HERRAMIENTAS' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(screen.getByRole('link', { name: 'INICIO' }).getAttribute('aria-current')).toBeNull();
  });

  it('speaks English when the toggle says so', async () => {
    await renderInSpanish();

    await userEvent.click(screen.getByRole('button', { name: 'Inglés' }));

    expect(
      screen.getByRole('heading', { level: 2, name: 'Moral Pillars & Digital Doctrine' }),
    ).toBeTruthy();
    expect(
      screen.getByText('© 2026 GORDOS SISTEMAS. UNRESTRICTED DIGITAL FREEDOM.'),
    ).toBeTruthy();
  });
});
