import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { build } from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const entry = resolve(here, '../Toolbar.tsx');

/**
 * Bundles the real component — not a copy, not a rewrite. If these tests ever pass
 * against something other than the file the app imports, they are worse than no
 * tests.
 *
 * react and react-dom stay external so the harness and the component share one React
 * instance; two copies make hooks throw and the failure looks like a component bug.
 *
 * NODE_ENV is pinned to development on purpose: the component returns null in
 * production by design, so a production build would make every scenario "pass" by
 * rendering nothing.
 */
const outfile = resolve(here, process.argv[2] ?? 'bundle.cjs');

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  format: 'cjs',
  platform: 'node',
  jsx: 'automatic',
  target: 'node18',
  external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'error',
});
