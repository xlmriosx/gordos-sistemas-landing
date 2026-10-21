/**
 * Which shell an app gets, and the rule that decides.
 *
 * Its own module rather than a third export of `shells.tsx`, deliberately: a
 * file that exports a function alongside its components loses fast refresh for
 * the whole module, and this is not a component. The rule that chooses between
 * shells is not one either.
 */

export type ShellKind = 'plain' | 'topbar' | 'sidebar';

/**
 * From the one thing whoever chooses can see without understanding the product:
 * how many top-level destinations it has.
 *
 * It is a count, not an interpretation. That matters more than the thresholds:
 * the chooser may well be a tool with no product sense, and a rule that asked
 * it to judge the product would be asking for what it does not have.
 */
export function pickShell(destinations: number): ShellKind {
  if (destinations <= 1) return 'plain';
  if (destinations <= 4) return 'topbar';
  return 'sidebar';
}
