# Works on Workers - Ralph Wiggum Prompt

You are iteratively building "Works on Workers" - a database of npm package compatibility with Cloudflare Workers.

## RULE #1: Keep Iterations SHORT (2-5 min max)

## RULE #2: Follow the PHASES in order

## RULE #3: BE CONCISE - No verbose explanations!

Check PROGRESS.md to see which phase you're in, then do that phase's work.

---

# PHASE 1: Test All 1000 Packages (BREADTH FIRST)

**Goal:** Get through ALL top 1000 packages as fast as possible.

**How to know you're in Phase 1:** Total Packages Tested < 1000

**What to do:**
1. Run batch tests: `cd packages/test-harness && npx tsx src/batch-runner.ts --top 1000`
2. This tests ~10-20 packages per iteration
3. Do NOT investigate failures - just record and move on
4. Update PROGRESS.md with new totals
5. EXIT

**When Phase 1 is complete:** Update PROGRESS.md to say "Phase 1 COMPLETE - moving to Phase 2"

---

# PHASE 2: Investigate Failures

**Goal:** Go through each `doesnt-work` package and figure out what's really going on.

**How to know you're in Phase 2:** Phase 1 is complete AND there are still uninvestigated failures

## Phase 2 has TWO modes: BATCH and INDIVIDUAL

### MODE A: BATCH RECLASSIFY (5-20 packages per iteration)

**Use batch mode for packages matching these OBVIOUS patterns:**

| Pattern | Status | Category |
|---------|--------|----------|
| `gulp-*`, `gulp` | not-applicable | build-tool |
| `grunt-*`, `grunt` | not-applicable | build-tool |
| `*-loader` | not-applicable | build-tool |
| `*-webpack-plugin` | not-applicable | build-tool |
| `eslint-*`, `eslint-config-*`, `eslint-plugin-*` | not-applicable | linter |
| `@babel/*`, `babel-*` | not-applicable | build-tool |
| `jest-*`, `@jest/*` | not-applicable | test-framework |
| `@types/*` | not-applicable | type-definitions |
| `prettier-*` | not-applicable | formatter |
| `rollup-*`, `rollup-plugin-*` | not-applicable | build-tool |
| `webpack-*` | not-applicable | build-tool |
| `vite-*`, `@vitejs/*` | not-applicable | build-tool |

**Batch process steps:**
```bash
# Find all packages matching a pattern that need reclassification
cd packages/test-harness/results
for f in gulp-*.json; do
  if grep -q '"status": "doesnt-work"' "$f" 2>/dev/null; then
    echo "$f"
  fi
done
```

Then update each JSON file:
- Set `"status": "not-applicable"`
- Set `"category": "build-tool"` (or appropriate category)
- Set `"investigated": true`
- Add brief `"notes": "Gulp plugin - build tool"`

**DO NOT write lengthy explanations.** We know what Gulp/Grunt/webpack are.

### MODE B: INDIVIDUAL INVESTIGATION (1 package per iteration)

**Use individual mode for packages that:**
- Don't match obvious patterns
- Might actually work with proper test config
- Need real debugging

**Steps:**
1. Find next uninvestigated failure:
```bash
for f in packages/test-harness/results/*.json; do
  if grep -q '"status": "doesnt-work"' "$f" && ! grep -q '"investigated": true' "$f"; then
    echo "$f"
  fi
done | head -5
```

2. Pick ONE package and investigate
3. Classify into outcome A/B/C/D (see below)
4. Update PROGRESS.md with SHORT entry
5. EXIT

**Classification outcomes:**

**A) Miscategorized** - Actually a CLI/build/test tool
- Set `status: "not-applicable"`, add category, set `investigated: true`

**B) Needs better test** - Generic test failed but package might work
- Add test config to `package-tests.ts`
- Re-run: `npx tsx src/runner.ts <package-name>`

**C) Fixable** - Needs specific import/polyfill/workaround
- Add test config with fix
- Set `status: "works"` or `"works-with-caveats"`

**D) Genuinely broken** - Truly incompatible
- Keep `status: "doesnt-work"`
- Add brief `notes` explaining why
- Add `alternative` if one exists
- Set `investigated: true`

---

## PROGRESS.md Logging - KEEP IT SHORT!

**BAD (too verbose):**
```
gulp-concat is a Gulp plugin for concatenating files during build workflows. 
The name pattern 'gulp-*' clearly indicates it's a Gulp plugin (like gulp-babel, 
gulp-uglify, gulp-autoprefixer...). Configured in gulpfile.js as part of Gulp's 
streaming build system... [500 more words]
```

**GOOD (concise):**
```
## Iteration 331 - 2026-01-10

**Phase:** 2 (Batch)
**Task:** Batch reclassified gulp-* packages
**Result:** 8 packages → not-applicable (build-tool): gulp-template, gulp-typescript, gulp-uglify, gulp-util, gulp-watch, gulp, gulp-rename, gulp-sass
**Pass Rate:** 38%
**Next:** Continue batch processing or switch to individual investigation
```

For individual investigations, keep result to 1-2 sentences:
```
**Result:** http-errors works! Added test config. Useful for creating HTTP error objects.
```
or
```
**Result:** hiredis is native Redis client (C++ bindings) → use-alternative: ioredis
```

---

# PHASE 3: Fix Lazy Tests

**Goal:** Go back and fix packages that have lazy `Object.keys()` tests.

**How to know you're in Phase 3:** Phase 2 is complete

**What to do:**
1. Find packages with lazy tests:
```bash
grep -l "Object.keys(pkg)" packages/test-harness/results/*.json | head -5
```

2. For each one, add a proper test to `package-tests.ts` that actually exercises the library

3. Re-run the test to verify it still passes with the real test

---

# PHASE 4: Build Website

**Goal:** Create a website that tells a POSITIVE story about Workers compatibility.

**How to know you're in Phase 4:** Phases 1-3 are complete

**CRITICAL: Read WEBSITE-STRATEGY.md before making any website changes!**

The website should NOT:
- Show raw compatibility percentages (e.g., "40% compatible")
- List all failures prominently
- Make users feel like "most packages don't work"

The website SHOULD:
- Lead with "400+ packages tested and working"
- Organize by USE CASE (validation, data, HTTP, etc.)
- Default-hide build tools, CLI tools, test frameworks (they're irrelevant to Workers)
- Show alternatives prominently when something doesn't work
- Explain WHY categories like build tools don't apply

**Key changes to make:**
1. Reframe hero: "400+ packages work" not "X% compatible"
2. Add category-first navigation (Validation, HTTP, Date/Time, etc.)
3. Default filter: hide `not-applicable` and `doesnt-work`
4. Smart search: show alternatives when searching for incompatible packages
5. Add "Need X? Use Y" section for common alternatives
6. Rename statuses for users:
   - `not-applicable` → "Build/Dev Tool"
   - `use-alternative` → "Alternative Available"
   - `doesnt-work` → "Incompatible" (show rarely, always with context)

**Work on:** `packages/website/`

---

## Status Categories

- `works` - Works on Workers
- `works-with-caveats` - Works with limitations  
- `doesnt-work` - Incompatible (document why)
- `use-alternative` - Better option exists
- `built-in` - Already in Workers runtime
- `not-applicable` - CLI tools, build tools, test runners, etc.

## Instant Classification Patterns (No Investigation Needed)

These patterns can be classified immediately without research:

**Build tools & bundlers:**
- `@babel/*`, `babel-*`, `babelify` → not-applicable (build-tool)
- `webpack-*`, `*-webpack-plugin` → not-applicable (build-tool)
- `rollup-*`, `@rollup/*`, `rollup-plugin-*` → not-applicable (build-tool)
- `vite-*`, `@vitejs/*` → not-applicable (build-tool)
- `esbuild-*` → not-applicable (build-tool)
- `*-loader` → not-applicable (build-tool)
- `gulp-*`, `gulp` → not-applicable (build-tool)
- `grunt-*`, `grunt` → not-applicable (build-tool)

**Linters & formatters:**
- `eslint-*`, `@eslint/*`, `eslint` → not-applicable (linter)
- `tslint-*`, `tslint` → not-applicable (linter)
- `prettier-*`, `prettier` → not-applicable (formatter)
- `stylelint-*`, `stylelint` → not-applicable (linter)

**Test frameworks:**
- `jest-*`, `@jest/*`, `jest` → not-applicable (test-framework)
- `mocha-*`, `mocha` → not-applicable (test-framework)
- `karma-*`, `karma` → not-applicable (test-framework)
- `jasmine-*`, `jasmine` → not-applicable (test-framework)
- `nyc`, `istanbul`, `coveralls` → not-applicable (coverage-tool)

**Type definitions:**
- `@types/*` → not-applicable (type-definitions)

**CLI tools:**
- `@oclif/*`, `oclif` → not-applicable (cli-tool)

**Native modules (C++ - will never work):**
- `sharp`, `canvas` → use-alternative (native-module)
- `bcrypt`, `argon2` → use-alternative: bcryptjs
- `sqlite3`, `better-sqlite3` → use-alternative: D1/@libsql/client
- `grpc` → use-alternative: @grpc/grpc-js
- `hiredis` → use-alternative: ioredis

## Node.js HTTP Server Frameworks NOW WORK!

**IMPORTANT: As of September 2025, Cloudflare Workers supports `node:http` server APIs!**

This means Express.js, Koa, Hapi, and other Node.js HTTP frameworks now work on Workers using:
- `httpServerHandler` from `cloudflare:node` 
- `handleAsNodeRequest` from `cloudflare:node`

**Example (Express):**
```javascript
import { httpServerHandler } from 'cloudflare:node';
import express from 'express';

const app = express();
app.get('/', (req, res) => res.json({ message: 'Express on Workers!' }));
app.listen(3000);

export default httpServerHandler({ port: 3000 });
```

**Example (Koa):**
```javascript
import Koa from 'koa';
import { httpServerHandler } from 'cloudflare:node';

const app = new Koa();
app.use(async ctx => { ctx.body = 'Hello World'; });
app.listen(8080);

export default httpServerHandler({ port: 8080 });
```

**These frameworks should be marked as `works` or `works-with-caveats`:**
- `express` → works-with-caveats (use httpServerHandler, some middleware may not work)
- `koa` → works-with-caveats (use httpServerHandler)
- `hapi` / `@hapi/hapi` → works-with-caveats (use httpServerHandler)
- `fastify` → likely works (test it!)
- `restify` → likely works (test it!)
- `polka` → likely works (test it!)
- `connect` → likely works (test it!)

**ACTION REQUIRED:** The existing express.json, koa.json, hapi.json results are OUTDATED.
They were tested before node:http server support was added. Re-test these with httpServerHandler!

**Requirements:**
- `nodejs_compat` compatibility flag
- Compatibility date `2025-09-01` or later (or `enable_nodejs_http_server_modules` flag)

**Test these frameworks with httpServerHandler pattern, not the generic test!**

## Packages That MIGHT Work (Investigate These)

Don't auto-skip these - they might work with proper testing:
- Server frameworks (express, koa, hapi) - **YES, these work now! See above.**
- Database clients (pg, mysql2, redis, ioredis)
- HTTP clients (axios, got, node-fetch)
- Utility libraries (lodash, ramda, date-fns)
- Crypto libraries (crypto-js, jose)

## File Locations

- `packages/data/packages.json` - Main database (auto-generated)
- `packages/test-harness/results/*.json` - Individual test results
- `packages/test-harness/src/package-tests.ts` - Test configs & known issues
- `packages/test-harness/src/top-packages.ts` - List of top npm packages
- `packages/website/` - The website

## Writing Proper Test Examples

**DON'T write lazy tests:**
```typescript
const keys = Object.keys(pkg);
return { success: keys.length > 0, result: { exports: keys } };
```

**DO write real tests:**
```typescript
// Date library
const date = dayjs('2026-01-08').format('YYYY-MM-DD');
return { success: date === '2026-01-08', result: date };

// Validation
const result = z.object({ name: z.string() }).safeParse({ name: 'test' });
return { success: result.success, result: result.data };
```

## Common Failure Patterns

- **Native modules** (C++ bindings) → use-alternative
- **Browser-only** (DOM, window, document) → not-applicable
- **Node APIs** - Many ARE supported! Check before assuming failure.
  - Supported: crypto, fs, path, buffer, stream, events, util, http, https, net, dns, zlib, timers, url, assert, process, async_hooks (AsyncLocalStorage)
  - **NEW: node:http server APIs** - http.createServer, http.Server, http.ServerResponse now work!
  - Non-functional stubs: child_process, cluster, vm, v8, readline, repl, dgram

## HTTP Framework Testing

When testing HTTP frameworks (express, koa, hapi, fastify, etc.), use this pattern:

```typescript
// In package-tests.ts for express:
'express': {
  test: async (pkg: any) => {
    const { httpServerHandler } = await import('cloudflare:node');
    const app = pkg();
    app.get('/test', (req, res) => res.json({ ok: true }));
    const server = app.listen(3000);
    // Test would need to make request to verify
    return { success: true, result: 'Express server created with httpServerHandler' };
  },
  notes: 'Use httpServerHandler from cloudflare:node. Requires nodejs_compat and compatibility date 2025-09-01+',
}
```

## NOW: Exit after your task

Keep it short. Another iteration starts in 5 seconds.
