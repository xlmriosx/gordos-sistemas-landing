import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Each scenario file runs in its own process. That is not fastidiousness: the
 * component keeps deliberate module-scope state (the pending removal, the mounted
 * instance) and writes sessionStorage, so scenarios sharing one process would
 * contaminate each other and the failures would point at the wrong thing.
 *
 * Bundles of the same source at distinct paths are what let a scenario hold several
 * independent module instances at once — which is what a Fast Refresh module swap
 * looks like from the component's side: fresh module scope, same DOM underneath.
 */
const run = (cmd, args) => spawnSync(cmd, args, { cwd: here, stdio: 'inherit', encoding: 'utf8' });

for (const out of ['bundle1.cjs', 'bundle2.cjs', 'bundle3.cjs']) {
  const built = run(process.execPath, [resolve(here, 'build.mjs'), out]);
  if (built.status !== 0) {
    console.error(`\nbuild failed for ${out} — the component does not compile.`);
    process.exit(1);
  }
}

const scenarios = ['lifecycle.cjs', 'hot-reload-order.cjs', 'behaviour.cjs', 'dock-contract.cjs'];
const failed = [];

for (const file of scenarios) {
  console.log(`\n── ${file} ${'─'.repeat(Math.max(0, 60 - file.length))}`);
  const result = run(process.execPath, [resolve(here, file)]);
  if (result.status !== 0) failed.push(file);
}

console.log(`\n${'═'.repeat(64)}`);
if (failed.length) {
  console.error(`FAILED: ${failed.join(', ')}`);
  process.exit(1);
}
console.log('all scenarios passed');
