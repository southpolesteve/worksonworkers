/**
 * Schema definitions for Works on Workers package database
 */

export type PackageStatus =
  | 'works'              // ✅ Full functionality, example included
  | 'works-with-caveats' // ⚠️ Works but with documented limitations
  | 'doesnt-work'        // ❌ Fails (native bindings, unsupported APIs)
  | 'use-alternative'    // 🔄 Better Workers-native option exists
  | 'built-in'           // 🏠 Already in Workers runtime
  | 'not-applicable';    // ➖ CLI tool, desktop lib, doesn't make sense

export type PackageCategory =
  | 'utility'
  | 'http-client'
  | 'validation'
  | 'date-time'
  | 'crypto'
  | 'encoding'
  | 'compression'
  | 'database'
  | 'orm'
  | 'testing'
  | 'cli'
  | 'build-tool'
  | 'framework'
  | 'ui'
  | 'logging'
  | 'config'
  | 'parsing'
  | 'string'
  | 'math'
  | 'id-generation'
  | 'type-checking'
  | 'types'
  | 'async'
  | 'file-system'
  | 'network'
  | 'mobile'
  | 'desktop'
  | 'image'
  | 'other';

export interface TestedWith {
  wranglerVersion: string;
  compatibilityDate: string;
  nodeCompat: boolean;
}

export interface PackageResult {
  /** Package name on npm */
  name: string;
  /** Version tested */
  version: string;
  /** Weekly download count (for ranking) */
  weeklyDownloads: number;
  /** Compatibility status */
  status: PackageStatus;
  /** Package category */
  category: PackageCategory;
  /** Working code example (if applicable) */
  example?: string;
  /** Additional notes about compatibility */
  notes?: string;
  /** Recommended alternative (package name or "built-in: X") */
  alternative?: string;
  /** Error message if doesnt-work */
  errorMessage?: string;
  /** Environment used for testing */
  testedWith: TestedWith;
  /** ISO date string of last test */
  lastTested: string;
  /** How this was tested */
  testedBy: 'automated' | 'manual' | 'community';
  /** Whether a failure has been manually investigated (Phase 2) */
  investigated?: boolean;
}

export interface PackageDatabase {
  /** Schema version for migrations */
  schemaVersion: number;
  /** When the database was last updated */
  lastUpdated: string;
  /** Wrangler version used for testing */
  wranglerVersion: string;
  /** Compatibility date used */
  compatibilityDate: string;
  /** All package results */
  packages: PackageResult[];
}

export const STATUS_ICONS: Record<PackageStatus, string> = {
  'works': '✅',
  'works-with-caveats': '⚠️',
  'doesnt-work': '❌',
  'use-alternative': '🔄',
  'built-in': '🏠',
  'not-applicable': '➖',
};

export const STATUS_LABELS: Record<PackageStatus, string> = {
  'works': 'Works',
  'works-with-caveats': 'Works with Caveats',
  'doesnt-work': "Doesn't Work",
  'use-alternative': 'Use Alternative',
  'built-in': 'Built-in',
  'not-applicable': 'Not Applicable',
};
