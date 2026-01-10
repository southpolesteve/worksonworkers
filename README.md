# Works on Workers

> Does this npm package work on Cloudflare Workers? Now you can find out.

A comprehensive database of npm package compatibility with Cloudflare Workers, tested with the latest Node.js compatibility mode.

## Why?

Cloudflare Workers now supports Node.js APIs via the `nodejs_compat` flag. But which of the 3+ million npm packages actually work? Instead of trial and error, check here first.

## Quick Links

- 🌐 **Website**: [works-on-workers.workers.dev](https://works-on-workers.workers.dev)
- 📊 **API**: [works-on-workers.workers.dev/api/packages](https://works-on-workers.workers.dev/api/packages)
- 🐛 **Request a Package**: [Open an Issue](https://github.com/cloudflare/works-on-workers/issues/new?template=package-request.yml)

## Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Works | Full functionality confirmed, example included |
| ⚠️ Works with Caveats | Works but with documented limitations |
| ❌ Doesn't Work | Incompatible (native bindings, unsupported APIs) |
| 🔄 Use Alternative | A better Workers-compatible option exists |
| 🏠 Built-in | Already available in the Workers runtime |
| ➖ Not Applicable | CLI tools, test runners, etc. that don't make sense on Workers |

## Test Environment

All packages are tested with:
- Wrangler 3.99+
- `compatibility_date = "2026-01-08"`
- `compatibility_flags = ["nodejs_compat"]`
- Vitest with `@cloudflare/vitest-pool-workers`

## API

### Get all packages
```bash
curl https://works-on-workers.workers.dev/api/packages
```

### Get a specific package
```bash
curl https://works-on-workers.workers.dev/api/packages/lodash
```

## Contributing

### Request a Package Test

1. [Open an issue](https://github.com/cloudflare/works-on-workers/issues/new?template=package-request.yml)
2. Our GitHub Action will automatically test it
3. Results are posted as a comment
4. If it works, a PR is auto-generated

### Run Tests Locally

```bash
# Clone the repo
git clone https://github.com/cloudflare/works-on-workers
cd works-on-workers

# Install dependencies
npm install

# Test a single package
npm run test:package -- lodash

# Test top 100 packages
cd packages/test-harness
npx tsx src/batch-runner.ts --top 100
```

### Add a Custom Test

Edit `packages/test-harness/src/package-tests.ts`:

```typescript
'my-package': {
  importStatement: `import pkg from 'my-package';`,
  testCode: `const result = pkg.doSomething();
return { success: true, result };`,
  category: 'utility',
},
```

## Project Structure

```
works-on-workers/
├── packages/
│   ├── website/           # Cloudflare Workers website
│   ├── test-harness/      # Automated testing system  
│   └── data/              # Package database
├── .github/
│   ├── workflows/         # CI/CD (nightly tests, deploy, issue handling)
│   └── ISSUE_TEMPLATE/    # Package request template
└── PROMPT.md              # Development prompt for AI assistance
```

## Local Development

```bash
# Run the website locally
npm run dev -w packages/website

# Open http://localhost:8787
```

## Deployment

The website auto-deploys to Cloudflare Workers on push to `main`. Manual deploy:

```bash
npm run deploy -w packages/website
```

## License

MIT

## Credits

Built with [Cloudflare Workers](https://workers.cloudflare.com), [Wrangler](https://developers.cloudflare.com/workers/wrangler/), and [Vitest](https://vitest.dev/).

Inspired by the need to stop googling "does X work on workers" for every package.
