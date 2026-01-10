#!/usr/bin/env npx tsx
/**
 * Fetch top npm packages from the anvaka gist and merge with curated Workers-relevant packages
 * 
 * This gist is updated daily and contains packages ranked by dependency count.
 * We also add modern/Workers-relevant packages that may not be in the top 1000 by dependencies.
 * 
 * Usage: npx tsx scripts/fetch-top-1000.ts > src/top-packages.ts
 */

const GIST_URL = 'https://gist.githubusercontent.com/anvaka/8e8fa57c7ee1350e3491/raw/01.most-dependent-upon.md';

interface PackageInfo {
  name: string;
  dependencyCount: number;
  rank: number;
}

// Modern packages that are relevant for Workers testing but may not be in top 1000 by dependencies
const CURATED_ADDITIONS = [
  // Validation (modern)
  'zod', 'valibot', 'superstruct', 'class-validator', 'yup',
  // ID Generation (modern)
  'nanoid', 'ulid', 'short-uuid',
  // HTTP Clients (modern)
  'ky', 'undici',
  // Date/Time (modern)
  'luxon',
  // Encoding (modern)
  'superjson', 'devalue', 'fast-xml-parser', 'papaparse', 'toml',
  // Compression
  'fflate', 'lz-string', 'pako',
  // Crypto/Auth
  'jose', 'js-sha256', 'hash.js',
  // Async utilities
  'p-limit', 'p-queue', 'p-retry', 'p-map', 'p-all', 'p-throttle', 'async-retry',
  // Type checking
  'fast-deep-equal', 'is-number', 'kind-of', 'rfdc',
  // Workers-native frameworks
  'hono', 'itty-router',
  // Serverless DB clients
  'drizzle-orm', 'kysely', '@planetscale/database', '@neondatabase/serverless', '@libsql/client',
  // Modern utilities
  'type-fest', 'ts-essentials', 'tiny-invariant', 'tiny-emitter', 'mitt',
  // Modern caching
  'quick-lru', 'memoizee',
  // Modern serialization
  '@msgpack/msgpack', 'msgpack-lite', 'cbor',
  // Formatting
  'dinero.js', 'currency.js',
  // Math
  'decimal.js', 'big.js',
  // Color
  'chroma-js',
  // Template
  'liquid',
  // Image/PDF
  'pdf-lib',
  // GraphQL
  '@graphql-tools/schema',
  // OpenAPI
  'openapi-types', '@apidevtools/swagger-parser',
  // i18n
  'intl-messageformat',
  // Build tools (for completeness - should be marked not-applicable)
  'esbuild', 'vite', 'vitest',
  // Express ecosystem
  'cookie-signature', 'statuses', 'vary', 'serialize-error',
  'media-typer', 'negotiator', 'forwarded', 'proxy-addr', 'range-parser', 'destroy',
  'mime-db', 'encoding', 'email-validator', 'rate-limiter-flexible', 'unleash-client', 'bottleneck',
];

// Estimate weekly downloads from dependency count
function estimateWeeklyDownloads(dependencyCount: number, rank: number): number {
  const baseDownloads = Math.max(100000, dependencyCount * 1000);
  const rankMultiplier = Math.max(0.1, 1 - (rank / 2000));
  return Math.round(baseDownloads * rankMultiplier);
}

async function fetchTopPackages(): Promise<PackageInfo[]> {
  console.error('Fetching top packages from gist...');
  
  const response = await fetch(GIST_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch gist: ${response.status} ${response.statusText}`);
  }
  
  const markdown = await response.text();
  const packages: PackageInfo[] = [];
  
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(\d+)\.\s+\[([^\]]+)\]\([^)]+\)\s+-\s+(\d+)/);
    if (match) {
      const rank = parseInt(match[1], 10) + 1;
      const name = match[2];
      const dependencyCount = parseInt(match[3], 10);
      packages.push({ name, dependencyCount, rank });
    }
  }
  
  console.error(`Found ${packages.length} packages from gist`);
  
  // Add curated packages that aren't in the gist
  const existingNames = new Set(packages.map(p => p.name));
  let addedCount = 0;
  
  for (const name of CURATED_ADDITIONS) {
    if (!existingNames.has(name)) {
      packages.push({
        name,
        dependencyCount: 100, // Low but non-zero
        rank: 1000 + addedCount + 1,
      });
      addedCount++;
    }
  }
  
  console.error(`Added ${addedCount} curated packages not in gist`);
  console.error(`Total: ${packages.length} packages`);
  
  return packages;
}

function generateTopPackagesFile(packages: PackageInfo[]): string {
  const lines: string[] = [
    '/**',
    ' * Top npm packages for testing on Cloudflare Workers',
    ' * ',
    ' * Generated from https://gist.github.com/anvaka/8e8fa57c7ee1350e3491 (top 1000 by dependency count)',
    ' * Plus curated modern packages relevant for Workers testing.',
    ' * The weeklyDownloads field is estimated from dependency counts for compatibility.',
    ' * ',
    ` * Last generated: ${new Date().toISOString()}`,
    ' */',
    '',
    'export interface TopPackage {',
    '  name: string;',
    '  weeklyDownloads: number;',
    '  rank: number;',
    '}',
    '',
    '/**',
    ' * Top npm packages (1000 from gist + curated modern packages)',
    ' */',
    'export const TOP_PACKAGES: TopPackage[] = [',
  ];
  
  for (const pkg of packages) {
    const weeklyDownloads = estimateWeeklyDownloads(pkg.dependencyCount, pkg.rank);
    lines.push(`  { name: '${pkg.name}', weeklyDownloads: ${weeklyDownloads}, rank: ${pkg.rank} },`);
  }
  
  lines.push('];');
  lines.push('');
  lines.push('/**');
  lines.push(' * Get top N packages');
  lines.push(' */');
  lines.push('export function getTopPackages(n: number = TOP_PACKAGES.length): TopPackage[] {');
  lines.push('  return TOP_PACKAGES.slice(0, n);');
  lines.push('}');
  lines.push('');
  lines.push('export default getTopPackages;');
  lines.push('');
  
  return lines.join('\n');
}

async function main() {
  const packages = await fetchTopPackages();
  const content = generateTopPackagesFile(packages);
  console.log(content);
}

main().catch(console.error);
