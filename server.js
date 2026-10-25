/* Local dev server. Vercel serves api/*.js as functions and public/ as static; this gives
 * the same two things on one port so the journey runs with `npm start`. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
const routes = Object.fromEntries(await Promise.all(
  fs.readdirSync(path.join(ROOT, 'api')).filter((f) => f.endsWith('.js') && !f.startsWith('_'))
    .map(async (f) => [`/api/${f.replace(/\.js$/, '')}`, (await import(`./api/${f}`)).default]),
));

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const fn = routes[url.pathname.replace(/\/$/, '')];
  if (fn) return fn(req, res);

  const rel = url.pathname === '/' ? '/index.html' : url.pathname;
  const file = path.join(ROOT, 'public', rel);
  if (!file.startsWith(path.join(ROOT, 'public')) || !fs.existsSync(file)) { res.statusCode = 404; return res.end('not found'); }
  res.setHeader('Content-Type', TYPES[path.extname(file)] ?? 'application/octet-stream');
  res.end(fs.readFileSync(file));
}).listen(process.env.PORT || 3000, () => console.log(`partner agent on http://localhost:${process.env.PORT || 3000}`));
