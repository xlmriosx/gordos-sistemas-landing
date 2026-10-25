/**
 * The filter over the arsenal is real: it shows one category's apps and hides
 * the rest, and it can put them all back.
 *
 * The mapping is the one the design asks for, and the test pins it: a category
 * that quietly shows the wrong apps is worse than no filter at all.
 */
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

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
});

function visibleAppTitles(): string[] {
  const arsenal = document.querySelector('.landing-apps');
  return within(arsenal as HTMLElement)
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent ?? '');
}

describe('the filter over the arsenal', () => {
  it('shows every app while nothing is chosen', async () => {
    await renderInSpanish();

    expect(visibleAppTitles()).toHaveLength(9);
  });

  it('shows only the transparency apps for "Transparencia & Gasto"', async () => {
    await renderInSpanish();

    await userEvent.click(screen.getByRole('button', { name: 'Transparencia & Gasto' }));

    expect(visibleAppTitles()).toEqual(['DatosHoy Universidades', 'Mendoza Transparente']);
  });

  it('shows only the finance apps for "Finanzas & Tasas"', async () => {
    await renderInSpanish();

    await userEvent.click(screen.getByRole('button', { name: 'Finanzas & Tasas' }));

    expect(visibleAppTitles()).toEqual([
      'Municipios Argentinos',
      'Viento en Contra',
      'RIGI.ar',
      'Preciazos',
    ]);
  });

  it('shows only the infrastructure apps for "Infraestructura & Datos"', async () => {
    await renderInSpanish();

    await userEvent.click(screen.getByRole('button', { name: 'Infraestructura & Datos' }));

    expect(visibleAppTitles()).toEqual(['Rutas Argentinas', 'Bacheame', 'SeInunda.ar']);
  });

  it('puts them all back', async () => {
    await renderInSpanish();

    await userEvent.click(screen.getByRole('button', { name: 'Finanzas & Tasas' }));
    await userEvent.click(screen.getByRole('button', { name: 'Todas' }));

    expect(visibleAppTitles()).toHaveLength(9);
  });
});
