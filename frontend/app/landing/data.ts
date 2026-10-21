import {
  Building2,
  Droplet,
  GraduationCap,
  Landmark,
  Route,
  TrendingUp,
  TriangleAlert,
  Wallet,
  Wind,
  type LucideIcon,
} from 'lucide-react';

/**
 * The arsenal: the nine apps this collective ships, and the shape of the page
 * that lists them.
 *
 * Everything here is structure — what exists, where it lives, which category
 * it belongs to, what colour it wears. The words on the cards are copy, and
 * they live in `../copy.ts` under the same ids: an app without its words is a
 * type error, not a card with a blank line on it.
 */
export type Category = 'all' | 'transparency' | 'finances' | 'infrastructure';

/** The colour a card wears. Each one is a token in `landing.css`. */
export type Accent = 'primary' | 'tertiary' | 'secondary' | 'error';

export type AppEntry = {
  /** The key this app's words live under, in the copy. */
  id: AppId;
  /** Where "ABRIR APP" goes. These are the real apps, not placeholders. */
  url: string;
  /** The stack the card advertises. */
  stack: string;
  /** Which filter shows it. */
  category: Exclude<Category, 'all'>;
  accent: Accent;
  icon: LucideIcon;
};

/**
 * The ids, in the order the design lists them. Written out instead of
 * inferred from the array so that a card added to `APPS` without its words
 * fails the type check below, naming the missing id.
 */
export type AppId =
  | 'municipios-argentinos'
  | 'datoshoy-universidades'
  | 'rutas-argentinas'
  | 'mendoza-transparente'
  | 'viento-en-contra'
  | 'bacheame'
  | 'rigi-ar'
  | 'preciazos'
  | 'seinunda-ar';

/** The filter row, in the order the design shows it. */
export const CATEGORIES: readonly Category[] = [
  'all',
  'transparency',
  'finances',
  'infrastructure',
];

export const APPS: readonly AppEntry[] = [
  {
    id: 'municipios-argentinos',
    url: 'https://municipiosargentinos.net/',
    stack: 'TypeScript · Mapbox',
    category: 'finances',
    accent: 'primary',
    icon: Building2,
  },
  {
    id: 'datoshoy-universidades',
    url: 'https://www.datoshoy.com/universidades',
    stack: 'Python · Data Viz',
    category: 'transparency',
    accent: 'tertiary',
    icon: GraduationCap,
  },
  {
    id: 'rutas-argentinas',
    url: 'https://rutasargentinas.net/',
    stack: 'GeoJSON · Leaflet',
    category: 'infrastructure',
    accent: 'secondary',
    icon: Route,
  },
  {
    id: 'mendoza-transparente',
    url: 'https://mendoza-transparente.com/',
    stack: 'Next.js · Open Data',
    category: 'transparency',
    accent: 'primary',
    icon: Landmark,
  },
  {
    id: 'viento-en-contra',
    url: 'https://viento-en-contra.vercel.app/',
    stack: 'React · Vercel',
    category: 'finances',
    accent: 'tertiary',
    icon: Wind,
  },
  {
    id: 'bacheame',
    url: 'https://bacheame.com/',
    stack: 'PWA · GPS',
    category: 'infrastructure',
    accent: 'error',
    icon: TriangleAlert,
  },
  {
    id: 'rigi-ar',
    url: 'https://rigi.ar/',
    stack: 'Next.js · Supabase',
    category: 'finances',
    accent: 'primary',
    icon: TrendingUp,
  },
  {
    id: 'preciazos',
    url: 'https://preciazos.com.ar/',
    stack: 'Scrapy · Fastify',
    category: 'finances',
    accent: 'secondary',
    icon: Wallet,
  },
  {
    id: 'seinunda-ar',
    url: 'https://seinunda.ar/',
    stack: 'GIS · Svelte',
    category: 'infrastructure',
    accent: 'tertiary',
    icon: Droplet,
  },
];

/** The apps a filter shows. "All" is everything; the rest are exact. */
export function appsInCategory(category: Category): readonly AppEntry[] {
  if (category === 'all') return APPS;
  return APPS.filter((app) => app.category === category);
}
