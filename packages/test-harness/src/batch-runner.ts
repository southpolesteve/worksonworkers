/**
 * Batch Test Runner for Works on Workers
 * 
 * Tests multiple npm packages and aggregates results.
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { testPackage } from './runner.js';
import getTopPackages from './get-top-packages.js';
import type { PackageDatabase, PackageResult } from '../../data/schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = join(__dirname, '../results');
const DATA_DIR = join(__dirname, '../../data');

/**
 * Load existing results from disk
 */
function loadExistingResults(): Map<string, PackageResult> {
  const results = new Map<string, PackageResult>();
  
  if (!existsSync(RESULTS_DIR)) {
    return results;
  }
  
  const files = readdirSync(RESULTS_DIR).filter(f => f.endsWith('.json') && f !== 'top-packages.json');
  
  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(join(RESULTS_DIR, file), 'utf-8'));
      results.set(data.name, data);
    } catch {
      // Skip invalid files
    }
  }
  
  return results;
}

/**
 * Run tests for a list of packages
 */
async function runBatch(
  packageNames: string[],
  options: {
    skipExisting?: boolean;
    concurrency?: number;
  } = {}
): Promise<PackageResult[]> {
  const { skipExisting = true } = options;
  const existingResults = loadExistingResults();
  const results: PackageResult[] = [];
  
  console.log(`\n🚀 Starting batch test of ${packageNames.length} packages`);
  console.log('═'.repeat(60));
  
  // Get download counts for ranking
  const topPackages = getTopPackages(200);
  const downloadMap = new Map(topPackages.map(p => [p.name, p.weeklyDownloads]));
  
  let tested = 0;
  let skipped = 0;
  let passed = 0;
  let failed = 0;
  
  for (let i = 0; i < packageNames.length; i++) {
    const packageName = packageNames[i];
    const position = i + 1;
    
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📦 [${position}/${packageNames.length}] ${packageName}`);
    console.log(`${'─'.repeat(60)}`);
    
    // Skip if we already have a recent result
    if (skipExisting && existingResults.has(packageName)) {
      const existing = existingResults.get(packageName)!;
      // Skip if tested within the last 7 days
      const lastTested = new Date(existing.lastTested);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      if (lastTested > weekAgo) {
        console.log(`   ⏭️  SKIP (tested ${Math.round((Date.now() - lastTested.getTime()) / (1000 * 60 * 60))}h ago, status: ${existing.status})`);
        existing.weeklyDownloads = downloadMap.get(packageName) || 0;
        results.push(existing);
        skipped++;
        continue;
      }
    }
    
    console.log(`   🧪 Testing...`);
    const startTime = Date.now();
    
    try {
      const result = await testPackage(packageName);
      const duration = Math.round((Date.now() - startTime) / 1000);
      result.weeklyDownloads = downloadMap.get(packageName) || 0;
      results.push(result);
      tested++;
      
      if (result.status === 'works' || result.status === 'works-with-caveats' || result.status === 'built-in' || result.status === 'not-applicable' || result.status === 'use-alternative') {
        console.log(`   ✅ PASS (${result.status}) [${duration}s]`);
        passed++;
      } else {
        console.log(`   ❌ FAIL (${result.status}) [${duration}s]`);
        if (result.errorMessage) {
          console.log(`   └─ ${result.errorMessage.substring(0, 100)}`);
        }
        failed++;
      }
    } catch (error) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`   💥 ERROR [${duration}s]: ${error}`);
      failed++;
    }
    
    // Progress summary after each package
    const total = tested + skipped;
    const pct = Math.round((total / packageNames.length) * 100);
    console.log(`\n   📊 Progress: ${total}/${packageNames.length} (${pct}%) | ✅ ${passed} passed | ❌ ${failed} failed | ⏭️ ${skipped} skipped`);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('🏁 Batch complete!');
  console.log(`   Tested: ${tested}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  
  return results;
}

/**
 * Aggregate results into the main database
 */
function aggregateResults(results: PackageResult[]): PackageDatabase {
  // Sort by downloads (most popular first)
  const sorted = [...results].sort((a, b) => b.weeklyDownloads - a.weeklyDownloads);
  
  const database: PackageDatabase = {
    schemaVersion: 1,
    lastUpdated: new Date().toISOString(),
    wranglerVersion: results[0]?.testedWith.wranglerVersion || 'unknown',
    compatibilityDate: '2026-01-08',
    packages: sorted,
  };
  
  return database;
}

/**
 * Save aggregated database
 */
function saveDatabase(database: PackageDatabase): void {
  const outputPath = join(DATA_DIR, 'packages.json');
  writeFileSync(outputPath, JSON.stringify(database, null, 2));
  console.log(`\n💾 Database saved to: ${outputPath}`);
  
  // Print summary
  const statusCounts = new Map<string, number>();
  for (const pkg of database.packages) {
    statusCounts.set(pkg.status, (statusCounts.get(pkg.status) || 0) + 1);
  }
  
  console.log('\n📊 Summary:');
  for (const [status, count] of statusCounts) {
    const pct = Math.round((count / database.packages.length) * 100);
    console.log(`   ${status}: ${count} (${pct}%)`);
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  let packageNames: string[] = [];
  let skipExisting = true;
  
  // Parse args
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--no-skip') {
      skipExisting = false;
    } else if (args[i] === '--top') {
      const count = parseInt(args[++i], 10) || 100;
      packageNames = getTopPackages(count).map(p => p.name);
    } else if (args[i] === '--packages') {
      packageNames = args[++i].split(',');
    } else if (!args[i].startsWith('--')) {
      // Single package
      packageNames.push(args[i]);
    }
  }
  
  if (packageNames.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx src/batch-runner.ts --top 100        # Test top 100 packages');
    console.log('  npx tsx src/batch-runner.ts --packages a,b,c # Test specific packages');
    console.log('  npx tsx src/batch-runner.ts lodash           # Test single package');
    console.log('');
    console.log('Options:');
    console.log('  --no-skip  Force re-test even if recent results exist');
    process.exit(1);
  }
  
  runBatch(packageNames, { skipExisting }).then((results) => {
    // Load ALL existing results to build complete database
    const allResults = loadExistingResults();
    
    // Merge new/updated results
    for (const result of results) {
      allResults.set(result.name, result);
    }
    
    // Convert to array and aggregate
    const database = aggregateResults(Array.from(allResults.values()));
    saveDatabase(database);
  });
}

export { runBatch, aggregateResults, saveDatabase };
