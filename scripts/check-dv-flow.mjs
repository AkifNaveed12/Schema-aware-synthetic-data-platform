import { readFileSync } from 'node:fs';
const dir = 'docs/assets/datavault-flow/';
const d = readFileSync(dir + 'datavault-flow-desktop.svg', 'utf8');
const m = readFileSync(dir + 'datavault-flow-mobile.svg', 'utf8');
const need = ['input-dataset','input-schema','input-intent','semantic-layer','data-profile','generation-engine','tabular-engine','relational-engine','document-engine','quality-engine','regeneration-loop','trusted-output','export-state'];
const fail = [];
const q = '"';
for (const id of need) if (!d.includes('id=' + q + id + q)) fail.push('desktop missing #' + id);
if (!d.includes('viewBox=' + q + '0 0 1200 530' + q)) fail.push('desktop viewBox changed');
if (!m.includes('viewBox=' + q + '0 0 360 600' + q)) fail.push('mobile viewBox changed');
// Strip metadata (c2pa manifest) and known-safe namespace URIs before security check
function stripMeta(s) {
  return s
    .replace(/<metadata>[\s\S]*?<\/metadata>/gi, '')
    .replace('http://www.w3.org/2000/svg', '')
    .replace('http://c2pa.org/manifest', '');
}
for (const [n, s] of [['desktop', d], ['mobile', m]]) {
  const clean = stripMeta(s);
  if (/<image|<script|https?:\/\//.test(clean)) fail.push(n + ' has external or unsafe content');
  if (!s.includes('dv-flow')) fail.push(n + ' lost dv-flow scope');
}
const ids = [...d.matchAll(/id="([^"]+)"/g)].map(x => x[1]).filter(i => m.includes('id=' + q + i + q));
if (ids.length) fail.push('duplicate ids across files: ' + ids.join(', '));
if (fail.length) { console.error(fail.join('\n')); process.exit(1); }
console.log('dv-flow svg check passed');
