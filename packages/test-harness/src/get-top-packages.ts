/**
 * Get top N npm packages
 * Uses a curated list for efficiency (the download-counts package is too large)
 */

import { TOP_PACKAGES, getTopPackages } from './top-packages.js';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export { getTopPackages };

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const count = parseInt(process.argv[2] || '200', 10);
  const packages = getTopPackages(count);
  
  console.log(`Top ${count} npm packages for Workers testing:\n`);
  
  // Print top 20 to console
  packages.slice(0, 20).forEach((pkg) => {
    console.log(`${pkg.rank.toString().padStart(4)}. ${pkg.name.padEnd(30)} ${pkg.weeklyDownloads.toLocaleString()}`);
  });
  
  if (count > 20) {
    console.log(`\n... and ${count - 20} more`);
  }
  
  // Save full list to file
  const outputPath = join(__dirname, '../results/top-packages.json');
  writeFileSync(outputPath, JSON.stringify(packages, null, 2));
  console.log(`\nFull list saved to: ${outputPath}`);
}

export default getTopPackages;
