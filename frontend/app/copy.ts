import type { Language } from '../src/i18n';
import { useLanguage } from '../src/i18n';
import type { AppId, Category } from './landing/data';

/**
 * Every word the app itself puts on screen, in both languages.
 *
 * The design system's i18n carries one namespace, `ui`, which is the kit's own
 * chrome; the app's words do not belong in it, and `src/` is not edited here.
 * They live in this object instead, and **the type is the parity check**: a key
 * added to one language and not the other fails `npm run typecheck`, which the
 * kit's own guard (`src/i18n/parity.ts`) would not do for an app's strings.
 *
 * The Spanish is the design's own copy, transcribed verbatim. The English is
 * the same page for the people who read it.
 */
type AppWords = {
  title: string;
  description: string;
  tags: string[];
  seal: string;
};

type ManifestoPoint = {
  /** The text before the highlighted phrase. */
  before: string;
  /** The phrase the design emphasises. Empty when it emphasises none. */
  highlight: string;
  /** The text after the highlighted phrase. */
  after: string;
  /** How the highlighted phrase is painted. */
  tone: 'primary' | 'firm' | 'tertiary';
};

const copy = {
  en: {
    topbar: {
      name: 'Gordos Sistemas',
      tagline: 'Devs for Freedom',
      navLabel: 'Main navigation',
      nav: {
        home: 'HOME',
        pillars: 'MORAL PILLARS',
        apps: 'APPS & TOOLS',
        manifesto: 'MANIFESTO',
        github: 'GITHUB',
      },
      cta: 'Join the Cause',
      language: {
        label: 'Language',
        english: 'English',
        spanish: 'Spanish',
      },
    },
    hero: {
      badge: '🇦🇷 Argentinian devs for freedom · Engineering & open source',
      title: 'Gordos Sistemas',
      motto: ['HONESTE VIVERE', 'ALTERUM NON LAEDERE', 'SUUM CUIQUE TRIBUERE'],
      subtitle:
        'We build decentralised tools, free software and censorship-resistant platforms to defend the sovereignty of the individual, the free market and the truth in cyberspace.',
      actions: {
        apps: 'Explore the apps',
        manifesto: 'Read the manifesto',
        github: '[ GitHub repositories ]',
      },
      slab: {
        code: 'Foundational Plaque Nº 001 · Buenos Aires Node',
        title: 'Doctrine of Computational Sovereignty',
        hash: '',
        imageAlt:
          'Foundational plaque of black marble with the golden bas-relief of the Eye of Providence and the lion of liberty, engraved with the Latin letters: HONESTE VIVERE, ALTERUM NON LAEDERE, SUUM CUIQUE TRIBUERE.',
      },
      metrics: [
        { value: '+10 Repositories', label: '100% open source code' },
        { value: '100% Immune', label: 'Resistant to censorship and blocking' },
        { value: '$0 Subsidies', label: 'Zero state intervention' },
        { value: '+90 Contributors', label: 'Active community and open source' },
      ],
    },
    pillars: {
      eyebrow: 'Ulpian & cypherpunk philosophical bedrock',
      title: 'Moral Pillars & Digital Doctrine',
      lead: 'The foundations of the classical tradition of Roman law, applied with mathematical rigour to the architecture of contemporary software.',
      items: [
        {
          marker: 'Pillar I',
          title: 'HONESTE VIVERE',
          subtitle: 'Code transparency & mathematical truth',
          body: 'We reject black boxes and obscurantist algorithms designed for manipulation outright. Every line we produce is auditable, deterministic and open source. We do not trade on blind faith.',
          points: [
            'Verifiable open source',
            'Bit-for-bit reproducible builds',
            'Public metrics with no government filters',
          ],
        },
        {
          marker: 'Pillar II',
          title: 'ALTERUM NON LAEDERE',
          subtitle: 'Non-aggression principle & sovereign privacy',
          body: 'Software must never work as a device of mass surveillance or state coercion. Privacy is the fundamental prerogative of a free society.',
          points: [
            'Zero invasive telemetry or analytics trackers',
            'Active resistance to censorship demands',
          ],
        },
        {
          marker: 'Pillar III',
          title: 'SUUM CUIQUE TRIBUERE',
          subtitle: 'Private property & free trade',
          body: 'We honour tangible and intangible private property and the legitimate fruit of human ingenuity. We promote individual monetary sovereignty and direct, voluntary exchange infrastructures, without financial customs or confiscations.',
          points: [
            'Exclusive custody of private keys by the user',
            'Autonomous digital contracts without bureaucratic arbitrators',
          ],
        },
      ],
    },
    apps: {
      eyebrow: 'Technological arsenal',
      title: 'Apps & Sites for the cause',
      lead: 'Systems in production, deployed to return power to the citizen and undermine the structures of monetary and informational control.',
      filterLabel: 'Filter the arsenal',
      filters: {
        all: 'All',
        transparency: 'Transparency & Spending',
        finances: 'Finances & Rates',
        infrastructure: 'Infrastructure & Data',
      } satisfies Record<Category, string>,
      open: 'OPEN APP',
      apps: {
        'municipios-argentinos': {
          title: 'Municipios Argentinos',
          description:
            'Comparative map of municipal tax rates, local tax pressure and municipal bureaucracy.',
          tags: ['Finances & Rates', 'Anti-Bureaucracy'],
          seal: '[ Fiscal Radar ]',
        },
        'datoshoy-universidades': {
          title: 'DatosHoy Universidades',
          description:
            'Real-time audit and distribution monitor for the national university budget.',
          tags: ['Open Data', 'Real Time'],
          seal: '[ Audited Budget ]',
        },
        'rutas-argentinas': {
          title: 'Rutas Argentinas',
          description:
            'Viewer and citizen status of road infrastructure, tolls and national routes.',
          tags: ['Infrastructure', 'Road Network'],
          seal: '[ Citizen Map ]',
        },
        'mendoza-transparente': {
          title: 'Mendoza Transparente',
          description:
            "Transparency portal and control of public spending and the tenders of Mendoza's provincial state.",
          tags: ['In Production', 'Transparency'],
          seal: '[ Civic Audit ]',
        },
        'viento-en-contra': {
          title: 'Viento en Contra',
          description:
            'Tool that visualises the tax and regulatory impact on wages and private activity.',
          tags: ['Tax Pressure', 'Real Wages'],
          seal: '[ Free Calculator ]',
        },
        bacheame: {
          title: 'Bacheame',
          description:
            'Community platform to report and track potholes and inefficiency in municipal public works.',
          tags: ['Oversight', 'Community'],
          seal: '[ Geo Reports ]',
        },
        'rigi-ar': {
          title: 'RIGI.ar',
          description:
            'Tracker and breakdown tool for investment projects under the Large Investment Incentive Regime.',
          tags: ['Investments', 'Tracking'],
          seal: '[ RIGI Regime ]',
        },
        preciazos: {
          title: 'Preciazos',
          description:
            'Comparator and demystifier of real mass-consumption prices, to fight statistical distortion.',
          tags: ['Real Prices', 'No Distortion'],
          seal: '[ Free Index ]',
        },
        'seinunda-ar': {
          title: 'SeInunda.ar',
          description:
            'Civic monitoring of hydraulic works, flood-prone areas and accountability for water infrastructure funds.',
          tags: ['Water Works', 'Accountability'],
          seal: '[ Water Oversight ]',
        },
      } satisfies Record<AppId, AppWords>,
    },
    manifesto: {
      eyebrow: 'Sovereign compilation',
      title: 'The Digital Manifesto',
      version: 'CLI v4.2.0-STABLE',
      session: 'bash · dev@gordos-sistemas:~',
      security: 'SECURE_SHELL · ED25519',
      command: 'cat /etc/gordos_sistemas/manifiesto.md',
      heading: '# MANIFESTO OF THE GORDOS SISTEMAS: CODE, LAW AND SOVEREIGNTY',
      points: [
        {
          before:
            '1. We believe human freedom precedes and outranks any state machinery. Modern computing was born to emancipate people, not to surveil them.',
          highlight: '',
          after: '',
          tone: 'primary',
        },
        {
          before:
            '2. If positive legislation or bureaucracy curtails individual freedom, ',
          highlight: 'free code is our inexpugnable refuge',
          after: '. Mathematics does not obey arbitrary decrees.',
          tone: 'primary',
        },
        {
          before: '3. ',
          highlight: 'We do not ask permission to build tools of freedom.',
          after:
            ' We deploy nodes, audit contracts and defend the inalienable right to transfer value voluntarily.',
          tone: 'firm',
        },
        {
          before: '4. We honour the three maxims: ',
          highlight:
            'live honestly, harm no one, and give to each what legitimately belongs to them',
          after: '.',
          tone: 'tertiary',
        },
      ] satisfies ManifestoPoint[],
      seal: '>> LONG LIVE FREEDOM, DAMMIT! <<',
    },
    community: {
      title: 'Join the Forces of Cyberspace',
      items: [
        {
          title: 'Open a Pull Request',
          hint: 'Contribute on GitHub',
          href: 'https://github.com/gordos-sistemas',
          soon: '',
        },
        {
          title: 'Discord',
          hint: 'Debate and technical coordination',
          href: '#comunidad-section',
          soon: '',
        },
        {
          title: 'Donate',
          hint: 'Fund the infrastructure',
          href: '#donar-proximamente',
          soon: 'COMING SOON',
        },
      ],
      seal: 'AUTONOMY · PRIVACY · DECENTRALISATION · ARGENTINE REPUBLIC',
    },
    footer: {
      motto: 'Honeste vivere · Alterum non laedere · Suum cuique tribuere',
      gloss: 'Live honestly · Harm no one · Give to each what is theirs',
      columns: [
        {
          heading: 'Software',
          body: 'Decentralised and immutable tools with no intermediaries and no state censorship.',
          link: 'github.com/gordos-sistemas',
          href: 'https://github.com/gordos-sistemas',
        },
        {
          heading: 'NOW DIGITAL',
          body: 'Sovereign space for debate, systems architecture and technological coordination.',
          link: 'Discord',
          href: '#comunidad-section',
        },
        {
          heading: 'Libertarian Alliance',
          body: 'Built by and for Argentine developers committed to individual autonomy and open source.',
          link: '',
          href: '',
        },
      ],
      legal: '© 2026 GORDOS SISTEMAS. UNRESTRICTED DIGITAL FREEDOM.',
    },
  },
  es: {
    topbar: {
      name: 'Gordos Sistemas',
      tagline: 'Devs por la Libertad',
      navLabel: 'Navegación principal',
      nav: {
        home: 'INICIO',
        pillars: 'PILARES ÉTICOS',
        apps: 'APLICACIONES & HERRAMIENTAS',
        manifesto: 'MANIFIESTO',
        github: 'GITHUB',
      },
      cta: 'Sumate a la Causa',
      language: {
        label: 'Idioma',
        english: 'Inglés',
        spanish: 'Español',
      },
    },
    hero: {
      badge: '🇦🇷 Devs Argentinos por la Libertad · Ingeniería & Código Abierto',
      title: 'Gordos Sistemas',
      motto: ['HONESTE VIVERE', 'ALTERUM NON LAEDERE', 'SUUM CUIQUE TRIBUERE'],
      subtitle:
        'Desarrollamos herramientas descentralizadas, software libre y plataformas a prueba de censura para defender la soberanía del individuo, el libre mercado y la verdad en el ciberespacio.',
      actions: {
        apps: 'Explorar Aplicaciones',
        manifesto: 'Leer el Manifiesto',
        github: '[ GitHub Repositorios ]',
      },
      slab: {
        code: 'Placa Fundacional Nº 001 · Nodo Buenos Aires',
        title: 'Doctrina de Soberanía Computacional',
        hash: '',
        imageAlt:
          'Placa fundacional de mármol negro con el bas-relief dorado del Ojo de la Providencia y el león de la libertad, grabado con las letras latinas: HONESTE VIVERE, ALTERUM NON LAEDERE, SUUM CUIQUE TRIBUERE.',
      },
      metrics: [
        { value: '+10 Repositorios', label: 'Código 100% Abierto' },
        { value: '100% Inmunes', label: 'Resistentes a Censura y Bloqueo' },
        { value: '$0 Subsidios', label: 'Cero Intervención Estatal' },
        { value: '+90 Colaboradores', label: 'Comunidad Activa y Código Abierto' },
      ],
    },
    pillars: {
      eyebrow: 'Cimiento Filosófico Ulpiano & Cypherpunk',
      title: 'Pilares Morales & Doctrina Digital',
      lead: 'Fundamentos de la tradición clásica de derecho romano aplicados con rigor matemático a la arquitectura de software contemporánea.',
      items: [
        {
          marker: 'Pilar I',
          title: 'HONESTE VIVERE',
          subtitle: 'Transparencia de Código & Verdad Matemática',
          body: 'Rechazamos de plano las cajas negras y los algoritmos oscurantistas diseñados para la manipulación. Cada línea que producimos es auditable, determinista y de código abierto. No comerciamos con la fe ciega.',
          points: [
            'Código abierto verificable',
            'Builds reproducibles bit a bit',
            'Métricas públicas sin filtros gubernamentales',
          ],
        },
        {
          marker: 'Pilar II',
          title: 'ALTERUM NON LAEDERE',
          subtitle: 'Principio de No Agresión & Privacidad Soberana',
          body: 'El software jamás debe funcionar como dispositivo de vigilancia masiva o coerción estatal. La privacidad es la prerrogativa fundamental para una sociedad libre.',
          points: [
            'Cero telemetría invasiva o rastreadores analíticos',
            'Resistencia activa ante requerimientos de censura',
          ],
        },
        {
          marker: 'Pilar III',
          title: 'SUUM CUIQUE TRIBUERE',
          subtitle: 'Propiedad Privada & Comercio Libre',
          body: 'Honramos la propiedad privada tangible e intangible y el fruto legítimo del ingenio humano. Promovemos la soberanía monetaria individual e infraestructuras de intercambio voluntario directas, sin aduanas financieras ni confiscaciones.',
          points: [
            'Custodia exclusiva de llaves privadas por el usuario',
            'Contratos digitales autónomos sin árbitros burocráticos',
          ],
        },
      ],
    },
    apps: {
      eyebrow: 'Arsenal Tecnológico',
      title: 'Apps & Sitios para la Causa',
      lead: 'Sistemas en producción desplegados para devolverle el poder al ciudadano y socavar las estructuras de control monetario e informativo.',
      filterLabel: 'Filtrar el arsenal',
      filters: {
        all: 'Todas',
        transparency: 'Transparencia & Gasto',
        finances: 'Finanzas & Tasas',
        infrastructure: 'Infraestructura & Datos',
      } satisfies Record<Category, string>,
      open: 'ABRIR APP',
      apps: {
        'municipios-argentinos': {
          title: 'Municipios Argentinos',
          description:
            'Mapa comparativo de tasas municipales, presión impositiva local y burocracia comunal.',
          tags: ['Finanzas & Tasas', 'Anti-Burocracia'],
          seal: '[ Radar Fiscal ]',
        },
        'datoshoy-universidades': {
          title: 'DatosHoy Universidades',
          description:
            'Monitor de auditoría y distribución de presupuesto universitario nacional en tiempo real.',
          tags: ['Datos Abiertos', 'Tiempo Real'],
          seal: '[ Presupuesto Auditado ]',
        },
        'rutas-argentinas': {
          title: 'Rutas Argentinas',
          description:
            'Visualizador y estado ciudadano de la infraestructura vial, peajes y rutas nacionales.',
          tags: ['Infraestructura', 'Red Vial'],
          seal: '[ Mapa Ciudadano ]',
        },
        'mendoza-transparente': {
          title: 'Mendoza Transparente',
          description:
            'Portal de transparencia y control del gasto público y licitaciones del estado provincial mendocino.',
          tags: ['En Producción', 'Transparencia'],
          seal: '[ Auditoría Cívica ]',
        },
        'viento-en-contra': {
          title: 'Viento en Contra',
          description:
            'Herramienta de visualización del impacto impositivo y regulatorio sobre los sueldos y la actividad privada.',
          tags: ['Presión Fiscal', 'Sueldos Reales'],
          seal: '[ Calculadora Libre ]',
        },
        bacheame: {
          title: 'Bacheame',
          description:
            'Plataforma comunitaria de reporte y tracking de desidia vial e ineficiencia en obra pública municipal.',
          tags: ['Fiscalización', 'Comunidad'],
          seal: '[ Geo-Reportes ]',
        },
        'rigi-ar': {
          title: 'RIGI.ar',
          description:
            'Tracker y desglosador de proyectos de inversión bajo el Régimen de Incentivo a las Grandes Inversiones.',
          tags: ['Inversiones', 'Seguimiento'],
          seal: '[ Régimen RIGI ]',
        },
        preciazos: {
          title: 'Preciazos',
          description:
            'Comparador y desmitificador de precios reales de consumo masivo para combatir la distorsión estadística.',
          tags: ['Precios Reales', 'Sin Distorsión'],
          seal: '[ Índice Libre ]',
        },
        'seinunda-ar': {
          title: 'SeInunda.ar',
          description:
            'Monitoreo cívico de obras hidráulicas, zonas anegables y rendición de cuentas de fondos de infraestructura hídrica.',
          tags: ['Obras Hídricas', 'Rendición de Cuentas'],
          seal: '[ Fiscalización Hídrica ]',
        },
      } satisfies Record<AppId, AppWords>,
    },
    manifesto: {
      eyebrow: 'Compilación Soberana',
      title: 'El Manifiesto Digital',
      version: 'CLI v4.2.0-STABLE',
      session: 'bash · dev@gordos-sistemas:~',
      security: 'SECURE_SHELL · ED25519',
      command: 'cat /etc/gordos_sistemas/manifiesto.md',
      heading:
        '# MANIFIESTO DE LOS GORDOS SISTEMAS: CÓDIGO, DERECHO Y SOBERANÍA',
      points: [
        {
          before:
            '1. Creemos que la libertad humana es anterior y superior a cualquier maquinaria estatal. La computación moderna nació para emancipar al hombre, no para vigilarlo.',
          highlight: '',
          after: '',
          tone: 'primary',
        },
        {
          before:
            '2. Si la legislación positiva o la burocracia coartan la libertad individual, ',
          highlight: 'el código libre es nuestro refugio inexpugnable',
          after: '. La matemática no acata decretos arbitrarios.',
          tone: 'primary',
        },
        {
          before: '3. ',
          highlight: 'No pedimos permiso para programar herramientas de libertad.',
          after:
            ' Desplegamos nodos, auditamos contratos y defendemos el derecho inalienable a transferir valor voluntariamente.',
          tone: 'firm',
        },
        {
          before: '4. Honramos las tres máximas: ',
          highlight:
            'Vivir honestamente, no dañar a nadie y dar a cada uno lo que legítimamente le pertenece',
          after: '.',
          tone: 'tertiary',
        },
      ] satisfies ManifestoPoint[],
      seal: '>> ¡VIVA LA LIBERTAD, CARAJO! <<',
    },
    community: {
      title: 'Sumate a las Fuerzas del Ciberespacio',
      items: [
        {
          title: 'Abrir un Pull Request',
          hint: 'Contribuye en GitHub',
          href: 'https://github.com/gordos-sistemas',
          soon: '',
        },
        {
          title: 'Discord',
          hint: 'Debate y coordinación técnica',
          href: '#comunidad-section',
          soon: '',
        },
        {
          title: 'Donar',
          hint: 'Financia la infraestructura',
          href: '#donar-proximamente',
          soon: 'PROXIMAMENTE',
        },
      ],
      seal: 'AUTONOMÍA · PRIVACIDAD · DESCENTRALIZACIÓN · REPÚBLICA ARGENTINA',
    },
    footer: {
      motto: 'Honeste vivere · Alterum non laedere · Suum cuique tribuere',
      gloss: 'Vivir honestamente · No dañar a nadie · Dar a cada uno lo suyo',
      columns: [
        {
          heading: 'Software',
          body: 'Herramientas descentralizadas e inmutables sin intermediarios ni censura estatal.',
          link: 'github.com/gordos-sistemas',
          href: 'https://github.com/gordos-sistemas',
        },
        {
          heading: 'AHORA DIGITAL',
          body: 'Espacio soberano de debate, arquitectura de sistemas y coordinación tecnológica.',
          link: 'Discord',
          href: '#comunidad-section',
        },
        {
          heading: 'Alianza Libertaria',
          body: 'Edificado por y para desarrolladores argentinos comprometidos con la autonomía individual y el código abierto.',
          link: '',
          href: '',
        },
      ],
      legal: '© 2026 GORDOS SISTEMAS. LIBERTAD DIGITAL IRRESTRICTA.',
    },
  },
} satisfies Record<Language, unknown>;

type Copy = (typeof copy)['en'];

// Checked separately so a missing Spanish key names the key, not the whole object.
copy.es satisfies Copy;

/** The app's words in the language the page is in; re-renders when it changes. */
export function useCopy(): Copy {
  const [language] = useLanguage();
  return copy[language];
}
