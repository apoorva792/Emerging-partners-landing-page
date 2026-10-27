/* Which words mean anything when deciding whether two pieces of work are about the same
 * thing.
 *
 * Everything in this product is an agent that automates a workflow for an enterprise
 * customer, so those words carry no information at all: every record shares them with
 * every other record. Counting them put an outbound voice agent story under a
 * procurement card on a three word "match", all three of them words that would match
 * anything we have ever written down. */

export const GENERIC = new Set([
  'agent', 'agents', 'agentic', 'automate', 'automated', 'automating', 'automation',
  'platform', 'platforms', 'system', 'systems', 'solution', 'solutions', 'service',
  'services', 'process', 'processes', 'processing', 'workflow', 'workflows', 'workflow',
  'enterprise', 'enterprises', 'business', 'company', 'companies', 'client', 'clients',
  'customer', 'customers', 'team', 'teams', 'user', 'users', 'data', 'digital',
  'management', 'managed', 'manager', 'operations', 'operational', 'integration',
  'integrated', 'technology', 'technologies', 'software', 'application', 'applications',
  'built', 'build', 'building', 'deploy', 'deployed', 'deployment', 'using', 'with',
  'from', 'into', 'across', 'their', 'your', 'that', 'this', 'what', 'when', 'where',
  'which', 'while', 'without', 'within', 'them', 'they', 'have', 'been', 'more', 'than',
  'tool', 'tools', 'layer', 'based', 'driven', 'powered', 'intelligent', 'intelligence',
  'time', 'work', 'works', 'working', 'first', 'next', 'every', 'each', 'real',
]);

/* The words of a string that are worth comparing: long enough to mean something, and not
 * one of the words everything shares. */
export function terms(s) {
  return String(s ?? '').toLowerCase().split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !GENERIC.has(w));
}

export const termSet = (s) => new Set(terms(s));
