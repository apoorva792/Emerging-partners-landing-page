import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ROOT_DIR = ROOT;

/* Locally the keys live in .env; on a host they come from the environment. Reading the
 * file unconditionally threw at import time on Vercel, which took every endpoint down
 * before it ran a line of its own. */
function fromFile() {
  try {
    return Object.fromEntries(
      fs.readFileSync(path.join(ROOT, '.env'), 'utf8')
        .split('\n').filter((l) => l.includes('=') && !l.trimStart().startsWith('#'))
        .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
    );
  } catch { return {}; }
}

export const env = { ...fromFile(), ...process.env };

/* Fail where it can be read, not three calls deep inside a model request. */
for (const key of ['LYZR_API_KEY']) {
  if (!env[key]) console.error(`[env] ${key} is not set — set it in .env locally, or as an environment variable on the host.`);
}
