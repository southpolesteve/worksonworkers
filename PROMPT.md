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
- **Filesystem-dependent** - Workers has NO persistent filesystem. Packages that read/write files at startup or runtime won't work.
- **Code generation** - `new Function()`, `eval()` are blocked in Workers
- **Node APIs** - Many ARE supported! Check before assuming failure.
  - Supported: crypto, fs, path, buffer, stream, events, util, http, https, net, dns, zlib, timers, url, assert, process, async_hooks (AsyncLocalStorage)
  - **NEW: node:http server APIs** - http.createServer, http.Server, http.ServerResponse now work!
  - Non-functional stubs: child_process, cluster, vm, v8, readline, repl, dgram

## Filesystem Limitations

**Workers has no persistent filesystem!** The `node:fs` module exists but operates on a virtual in-memory filesystem.

**Packages that WON'T work due to filesystem:**
- `serve-static` - Tries to serve files from disk
- `serve-favicon` - Reads favicon file at startup  
- `serve-index` - Lists directory contents
- `node-static` - Static file server
- Any package that uses `fs.readFileSync()` at import time

**Alternatives for static files:**
- Use Cloudflare R2 for object storage
- Use Workers Assets for static files
- Embed small files as base64 in code
- Use KV for key-value data

**Packages that WILL work despite using fs:**
- `multer` with `memoryStorage()` - Files stay in memory
- Packages that only use fs optionally or lazily

## HTTP Framework & Middleware Testing

### CRITICAL: How to Properly Test Express Middleware

**DO NOT just test if a package imports!** That's a lazy test that doesn't verify the package actually works.

**WRONG approach (lazy test):**
```typescript
import helmet from 'helmet';
const middleware = helmet();
return { success: typeof middleware === 'function' }; // LAZY!
```

**RIGHT approach (functional test):**
Create a real Express app with `httpServerHandler`, use the middleware, and verify it actually does what it's supposed to do:

```javascript
import { httpServerHandler } from 'cloudflare:node';
import express from 'express';
import helmet from 'helmet';

const app = express();
app.use(helmet()); // Actually use the middleware

app.get('/test', (req, res) => {
  res.json({ message: 'Testing helmet' });
});

app.listen(3000);
export default httpServerHandler({ port: 3000 });
```

Then test with curl:
```bash
# For helmet - verify security headers are set
curl -sI http://localhost:8799/ | grep -i "x-frame-options"

# For multer - actually upload a file
curl -X POST -F "file=@test.txt" http://localhost:8799/upload

# For cookie-parser - set and read cookies
curl -c cookies.txt http://localhost:8799/set-cookie
curl -b cookies.txt http://localhost:8799/read-cookie

# For compression - verify gzip encoding
curl -sI -H "Accept-Encoding: gzip" http://localhost:8799/ | grep "Content-Encoding"

# For passport - do a full login flow
curl -X POST -d "username=test&password=pass" http://localhost:8799/login
```

### Middleware Categories

**Works with Express + httpServerHandler:**
- `helmet` - Security headers (CSP, HSTS, X-Frame-Options)
- `multer` - File uploads (use memoryStorage, NOT diskStorage)
- `cookie-parser` - Cookie parsing and signing
- `compression` - Gzip/deflate response compression
- `cors` - CORS headers
- `body-parser` - Request body parsing
- `express-session` - Session management
- `connect-flash` - Flash messages
- `connect-history-api-fallback` - SPA routing
- `passport` - Authentication framework
- `passport-local` - Username/password auth
- `passport-oauth2` - OAuth 2.0
- `method-override` - HTTP method override

**Does NOT work (requires filesystem):**
- `serve-static` - No persistent filesystem in Workers
- `serve-favicon` - Reads file at startup
- `serve-index` - Directory listings need filesystem
- `node-static` - Static file server

**Does NOT work (other reasons):**
- `errorhandler` - Uses `__dirname` (not available in ES modules)
- `morgan` - Uses code generation (disallowed in Workers)

### Test Setup for Middleware

```toml
# wrangler.toml
name = "middleware-test"
main = "src/index.js"
compatibility_date = "2026-01-10"
compatibility_flags = ["nodejs_compat"]  # REQUIRED for node:http
```

### Full Example: Testing passport-local

```javascript
import { httpServerHandler } from 'cloudflare:node';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'test', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Configure strategy
passport.use(new LocalStrategy((username, password, done) => {
  if (username === 'admin' && password === 'pass') {
    return done(null, { id: 1, username });
  }
  return done(null, false);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, { id }));

// Login endpoint
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ success: true, user: req.user });
});

// Protected endpoint
app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.listen(3000);
export default httpServerHandler({ port: 3000 });
```

Test it:
```bash
# Start worker
npx wrangler dev --port 8799

# Login and save session cookie
curl -c cookies.txt -X POST -d "username=admin&password=pass" http://localhost:8799/login

# Access protected route with session
curl -b cookies.txt http://localhost:8799/profile
```

### Key Testing Principles

1. **Always use httpServerHandler** - This is how Express runs on Workers
2. **Test the actual functionality** - Don't just check if it imports
3. **Use proper wrangler.toml** - Need `nodejs_compat` flag
4. **Verify with curl** - Check headers, cookies, responses
5. **Test error cases** - Make sure failures are handled correctly

### Common Mistakes to Avoid

- ❌ Testing import only: `typeof middleware === 'function'`
- ❌ Using `nodejs_compat_v2` instead of `nodejs_compat`
- ❌ Forgetting to add session middleware for passport
- ❌ Using diskStorage with multer (no filesystem)
- ❌ Assuming filesystem-based middleware will work
```

## NOW: Exit after your task

Keep it short. Another iteration starts in 5 seconds.
