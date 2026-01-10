/**
 * Test Runner for Works on Workers
 * 
 * Tests a single npm package for Cloudflare Workers compatibility.
 * Creates a temporary Worker project, installs the package, and runs tests.
 */

import { execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTestConfig } from './package-tests.js';
import type { PackageResult, PackageStatus } from '../../data/schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SANDBOX_DIR = join(__dirname, '../sandbox');
const RESULTS_DIR = join(__dirname, '../results');
const TIMEOUT_MS = 30000; // 30 second timeout

interface TestResult {
  success: boolean;
  status: PackageStatus;
  output?: string;
  error?: string;
  version?: string;
}

/**
 * Get the installed version of a package
 */
function getPackageVersion(packageName: string, sandboxDir: string): string {
  try {
    const pkgJsonPath = join(sandboxDir, 'node_modules', packageName, 'package.json');
    if (existsSync(pkgJsonPath)) {
      const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
      return pkgJson.version || 'unknown';
    }
  } catch {
    // Scoped packages have different paths
    try {
      const parts = packageName.split('/');
      if (parts.length === 2) {
        const pkgJsonPath = join(sandboxDir, 'node_modules', parts[0], parts[1], 'package.json');
        if (existsSync(pkgJsonPath)) {
          const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
          return pkgJson.version || 'unknown';
        }
      }
    } catch {
      // ignore
    }
  }
  return 'unknown';
}

/**
 * Get Wrangler version
 */
function getWranglerVersion(): string {
  try {
    const output = execSync('npx wrangler --version', { encoding: 'utf-8' });
    const match = output.match(/(\d+\.\d+\.\d+)/);
    return match ? match[1] : 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Create a sandbox Worker project for testing a package
 */
function createSandbox(packageName: string, testConfig: ReturnType<typeof getTestConfig>): string {
  const sandboxPath = join(SANDBOX_DIR, packageName.replace('/', '__'));
  
  // Clean up any existing sandbox
  if (existsSync(sandboxPath)) {
    rmSync(sandboxPath, { recursive: true, force: true });
  }
  
  mkdirSync(sandboxPath, { recursive: true });
  
  // Create package.json
  const packageJson = {
    name: `test-${packageName.replace('/', '-')}`,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      test: 'vitest run',
    },
    devDependencies: {
      '@cloudflare/vitest-pool-workers': '^0.8.0',
      '@cloudflare/workers-types': '^4.20250109.0',
      'vitest': '~3.2.0',
      'wrangler': '^3.99.0',
    },
    dependencies: {
      [packageName]: 'latest',
      ...(testConfig.additionalDependencies?.reduce((acc, dep) => ({ ...acc, [dep]: 'latest' }), {}) || {}),
    },
  };
  
  writeFileSync(join(sandboxPath, 'package.json'), JSON.stringify(packageJson, null, 2));
  
  // Create wrangler.toml
  const wranglerToml = `name = "test-worker"
main = "src/index.ts"
compatibility_date = "2026-01-08"
compatibility_flags = ["nodejs_compat"]
`;
  writeFileSync(join(sandboxPath, 'wrangler.toml'), wranglerToml);
  
  // Create vitest.config.ts
  const vitestConfig = `import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
      },
    },
  },
});
`;
  writeFileSync(join(sandboxPath, 'vitest.config.ts'), vitestConfig);
  
  // Create src directory
  mkdirSync(join(sandboxPath, 'src'), { recursive: true });
  
  // Create the Worker
  const workerCode = `${testConfig.importStatement}

export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const __result = await (async () => {
        ${testConfig.testCode}
      })();
      return Response.json(__result);
    } catch (error) {
      return Response.json({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, { status: 500 });
    }
  }
};
`;
  writeFileSync(join(sandboxPath, 'src/index.ts'), workerCode);
  
  // Create test file
  const testCode = `import { SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';

describe('${packageName}', () => {
  it('should work on Workers', async () => {
    const response = await SELF.fetch('http://test/');
    const data = await response.json();
    
    if (!data.success) {
      console.error('Test failed:', data.error);
      if (data.stack) console.error(data.stack);
    }
    
    expect(data.success).toBe(true);
  });
});
`;
  writeFileSync(join(sandboxPath, 'src/index.test.ts'), testCode);
  
  return sandboxPath;
}

/**
 * Run the test for a package
 */
async function runTest(packageName: string): Promise<TestResult> {
  const testConfig = getTestConfig(packageName);
  
  // Check if package should be skipped
  if (testConfig.skipReason) {
    return {
      success: true,
      status: 'not-applicable',
      output: testConfig.skipReason,
    };
  }
  
  console.log(`\n📦 Testing: ${packageName}`);
  console.log('─'.repeat(50));
  
  const sandboxPath = createSandbox(packageName, testConfig);
  
  try {
    // Install dependencies
    console.log('📥 Installing dependencies...');
    execSync('npm install', { 
      cwd: sandboxPath, 
      stdio: 'pipe',
      timeout: TIMEOUT_MS,
    });
    
    const version = getPackageVersion(packageName, sandboxPath);
    console.log(`   Installed ${packageName}@${version}`);
    
    // Run tests
    console.log('🧪 Running tests...');
    
    return new Promise((resolve) => {
      const child = spawn('npm', ['test'], {
        cwd: sandboxPath,
        stdio: 'pipe',
        timeout: TIMEOUT_MS,
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      const timeout = setTimeout(() => {
        child.kill();
        // Clean up sandbox after timeout
        try {
          rmSync(sandboxPath, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }
        resolve({
          success: false,
          status: 'doesnt-work',
          error: `Test timed out after ${TIMEOUT_MS / 1000} seconds`,
          version,
        });
      }, TIMEOUT_MS);
      
      child.on('close', (code) => {
        clearTimeout(timeout);
        
        // Clean up sandbox after test completes
        try {
          rmSync(sandboxPath, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }
        
        if (code === 0) {
          console.log('✅ PASSED');
          resolve({
            success: true,
            status: testConfig.alternative ? 'use-alternative' : 'works',
            output: stdout,
            version,
          });
        } else {
          console.log('❌ FAILED');
          
          // Try to extract meaningful error
          const errorMatch = stderr.match(/Error: (.+)/m) || stdout.match(/Error: (.+)/m);
          const error = errorMatch ? errorMatch[1] : stderr || stdout;
          
          resolve({
            success: false,
            status: 'doesnt-work',
            error: error.substring(0, 500),
            version,
          });
        }
      });
      
      child.on('error', (err) => {
        clearTimeout(timeout);
        // Clean up sandbox after error
        try {
          rmSync(sandboxPath, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }
        resolve({
          success: false,
          status: 'doesnt-work',
          error: err.message,
          version,
        });
      });
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log('❌ FAILED:', errorMsg);
    
    // Clean up sandbox after error
    try {
      rmSync(sandboxPath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    
    return {
      success: false,
      status: 'doesnt-work',
      error: errorMsg,
    };
  }
}

/**
 * Test a package and save the result
 */
export async function testPackage(packageName: string): Promise<PackageResult> {
  const testConfig = getTestConfig(packageName);
  const result = await runTest(packageName);
  const wranglerVersion = getWranglerVersion();
  
  const packageResult: PackageResult = {
    name: packageName,
    version: result.version || 'unknown',
    weeklyDownloads: 0, // Will be filled in by batch runner
    status: result.status,
    category: testConfig.category,
    example: result.success ? `${testConfig.importStatement}\n\n// Usage:\n${testConfig.testCode}` : undefined,
    notes: testConfig.notes,
    alternative: testConfig.alternative,
    errorMessage: result.error,
    testedWith: {
      wranglerVersion,
      compatibilityDate: '2026-01-08',
      nodeCompat: true,
    },
    lastTested: new Date().toISOString(),
    testedBy: 'automated',
  };
  
  // Save individual result
  if (!existsSync(RESULTS_DIR)) {
    mkdirSync(RESULTS_DIR, { recursive: true });
  }
  
  const resultPath = join(RESULTS_DIR, `${packageName.replace('/', '__')}.json`);
  writeFileSync(resultPath, JSON.stringify(packageResult, null, 2));
  
  console.log(`\n📄 Result saved to: ${resultPath}`);
  
  return packageResult;
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const packageName = process.argv[2];
  
  if (!packageName) {
    console.error('Usage: npx tsx src/runner.ts <package-name>');
    process.exit(1);
  }
  
  testPackage(packageName).then((result) => {
    console.log('\n📊 Result:');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.status === 'doesnt-work' ? 1 : 0);
  });
}
