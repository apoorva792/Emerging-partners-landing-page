/* node scripts/profile.js <email> [website] */
import { buildProfile } from '../lib/profile.js';
const [email, website] = process.argv.slice(2);
if (!email) { console.error('usage: node scripts/profile.js <email> [website]'); process.exit(1); }
const r = await buildProfile(email, website);
console.log(JSON.stringify(r, null, 1));
