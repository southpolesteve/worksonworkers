import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = join(__dirname, 'results');
const DATA_DIR = join(__dirname, '../data');

const results = [];
const files = readdirSync(RESULTS_DIR).filter(f => f.endsWith('.json'));

for (const file of files) {
  try {
    const data = JSON.parse(readFileSync(join(RESULTS_DIR, file), 'utf-8'));
    if (data.name) results.push(data);
  } catch {}
}

console.log('Loaded', results.length, 'results');

const sorted = results.sort((a, b) => b.weeklyDownloads - a.weeklyDownloads);
const database = {
  schemaVersion: 1,
  lastUpdated: new Date().toISOString(),
  wranglerVersion: results[0]?.testedWith?.wranglerVersion || '3.92.0',
  compatibilityDate: '2026-01-08',
  packages: sorted,
};

writeFileSync(join(DATA_DIR, 'packages.json'), JSON.stringify(database, null, 2));
console.log('Saved database to packages/data/packages.json');

// Count statuses
const counts = {};
for (const pkg of database.packages) {
  counts[pkg.status] = (counts[pkg.status] || 0) + 1;
}
console.log('Status counts:', counts);
