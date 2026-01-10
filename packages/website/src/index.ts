/**
 * Works on Workers - Website
 * 
 * A Cloudflare Worker that serves the package compatibility database
 */

import packagesData from '../../data/packages.json';
import type { PackageDatabase, PackageResult, PackageStatus } from '../../data/schema';

const STATUS_ICONS: Record<PackageStatus, string> = {
  'works': '✅',
  'works-with-caveats': '⚠️',
  'doesnt-work': '❌',
  'use-alternative': '🔄',
  'built-in': '🏠',
  'not-applicable': '➖',
};

const STATUS_LABELS: Record<PackageStatus, string> = {
  'works': 'Works',
  'works-with-caveats': 'Works (with notes)',
  'doesnt-work': 'Incompatible',
  'use-alternative': 'Alternative Available',
  'built-in': 'Built into Workers',
  'not-applicable': 'Build/Dev Tool',
};

const STATUS_COLORS: Record<PackageStatus, string> = {
  'works': '#22c55e',
  'works-with-caveats': '#eab308',
  'doesnt-work': '#ef4444',
  'use-alternative': '#3b82f6',
  'built-in': '#8b5cf6',
  'not-applicable': '#6b7280',
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPackageCard(pkg: PackageResult): string {
  const statusIcon = STATUS_ICONS[pkg.status];
  const statusLabel = STATUS_LABELS[pkg.status];
  const statusColor = STATUS_COLORS[pkg.status];
  
  const downloads = pkg.weeklyDownloads.toLocaleString();
  
  let detailsHtml = '';
  
  if (pkg.notes) {
    detailsHtml += `<p class="notes">${escapeHtml(pkg.notes)}</p>`;
  }
  
  if (pkg.alternative) {
    detailsHtml += `<p class="alternative">💡 Alternative: <code>${escapeHtml(pkg.alternative)}</code></p>`;
  }
  
  if (pkg.errorMessage) {
    detailsHtml += `<p class="error">Error: ${escapeHtml(pkg.errorMessage.substring(0, 200))}</p>`;
  }
  
  if (pkg.example) {
    detailsHtml += `
      <details class="example">
        <summary>View Example</summary>
        <pre><code>${escapeHtml(pkg.example)}</code></pre>
      </details>
    `;
  }
  
  return `
    <div class="package-card" data-status="${pkg.status}" data-category="${pkg.category}">
      <div class="package-header">
        <h3>
          <a href="https://www.npmjs.com/package/${pkg.name}" target="_blank" rel="noopener">
            ${escapeHtml(pkg.name)}
          </a>
        </h3>
        <span class="status-badge" style="background-color: ${statusColor}">
          ${statusIcon} ${statusLabel}
        </span>
      </div>
      <div class="package-meta">
        <span class="version">v${escapeHtml(pkg.version)}</span>
        <span class="downloads">${downloads} weekly downloads</span>
        <span class="category">${escapeHtml(pkg.category)}</span>
      </div>
      ${detailsHtml}
    </div>
  `;
}

function renderHomePage(data: PackageDatabase, query: URLSearchParams): string {
  const search = query.get('q')?.toLowerCase() || '';
  const statusFilter = query.get('status') || '';
  const categoryFilter = query.get('category') || '';
  const showAll = query.get('show_all') === 'true';
  
  // Filter packages
  let filtered = data.packages;
  
  // Default filter: hide not-applicable and doesnt-work unless explicitly requested
  if (!showAll && !statusFilter && !search) {
    filtered = filtered.filter(p => 
      p.status !== 'not-applicable' && p.status !== 'doesnt-work'
    );
  }
  
  if (search) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.notes?.toLowerCase().includes(search)
    );
  }
  
  if (statusFilter) {
    filtered = filtered.filter(p => p.status === statusFilter);
  }
  
  if (categoryFilter) {
    filtered = filtered.filter(p => p.category === categoryFilter);
  }
  
  // Calculate stats
  const stats = {
    total: data.packages.length,
    works: data.packages.filter(p => p.status === 'works').length,
    worksWithCaveats: data.packages.filter(p => p.status === 'works-with-caveats').length,
    doesntWork: data.packages.filter(p => p.status === 'doesnt-work').length,
    useAlternative: data.packages.filter(p => p.status === 'use-alternative').length,
    builtIn: data.packages.filter(p => p.status === 'built-in').length,
    notApplicable: data.packages.filter(p => p.status === 'not-applicable').length,
  };
  
  const workingTotal = stats.works + stats.worksWithCaveats + stats.builtIn;
  
  // Get unique categories
  const categories = [...new Set(data.packages.map(p => p.category))].sort();
  
  // Popular categories for Workers (excluding build tools, CLI, etc.)
  const popularCategories = [
    { name: 'validation', label: 'Validation & Schemas', icon: '✓', description: 'zod, joi, yup' },
    { name: 'http-client', label: 'HTTP Clients', icon: '🌐', description: 'ky, ofetch, axios' },
    { name: 'utility', label: 'Utilities', icon: '🔧', description: 'lodash, ramda' },
    { name: 'date-time', label: 'Date & Time', icon: '📅', description: 'date-fns, dayjs' },
    { name: 'parsing', label: 'Parsing', icon: '📄', description: 'cheerio, yaml, csv' },
    { name: 'crypto', label: 'Crypto & Security', icon: '🔒', description: 'jose, crypto-js' },
    { name: 'database', label: 'Database', icon: '💾', description: 'pg, mysql' },
    { name: 'server-framework', label: 'Web Frameworks', icon: '⚡', description: 'hono, express' },
  ];
  
  const categoryOptions = categories.map(c => 
    `<option value="${c}" ${categoryFilter === c ? 'selected' : ''}>${c}</option>`
  ).join('');
  
  const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) =>
    `<option value="${value}" ${statusFilter === value ? 'selected' : ''}>${STATUS_ICONS[value as PackageStatus]} ${label}</option>`
  ).join('');
  
  const packagesHtml = filtered.map(renderPackageCard).join('\n');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Works on Workers - npm Package Compatibility</title>
  <meta name="description" content="${workingTotal}+ npm packages tested and working on Cloudflare Workers. Find validation, HTTP, date/time, and utility libraries.">
  <style>
    :root {
      --bg: #1a1a1a;
      --bg-card: #2a2a2a;
      --text: #ffffff;
      --text-muted: #a3a3a3;
      --border: #404040;
      --accent: #f6821f;
      --accent-light: #fbad41;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--accent), var(--accent-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
    }
    
    .stats {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
      margin: 2rem 0;
    }
    
    .stat {
      background: var(--bg-card);
      border-radius: 8px;
      padding: 1rem 1.5rem;
      text-align: center;
      min-width: 120px;
      border: 1px solid var(--border);
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
    }
    
    .stat-label {
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    
    .highlight {
      background: linear-gradient(135deg, var(--accent), var(--accent-light));
      color: white;
      border: none;
    }
    
    .highlight .stat-value,
    .highlight .stat-label {
      color: white;
    }
    
    .categories {
      margin: 2rem 0 3rem;
    }
    
    .categories h2 {
      text-align: center;
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      color: var(--text);
    }
    
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    
    .category-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      text-decoration: none;
      color: var(--text);
      transition: transform 0.2s, border-color 0.2s;
      display: block;
    }
    
    .category-card:hover {
      transform: translateY(-2px);
      border-color: var(--accent);
    }
    
    .category-icon {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      display: block;
    }
    
    .category-name {
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }
    
    .category-desc {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
      justify-content: center;
    }
    
    .filters input,
    .filters select {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg-card);
      color: var(--text);
      font-size: 1rem;
      min-width: 200px;
    }
    
    .filters input:focus,
    .filters select:focus {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    
    .results-count {
      text-align: center;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
    
    .packages {
      display: grid;
      gap: 1rem;
    }
    
    .package-card {
      background: var(--bg-card);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid var(--border);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .package-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .package-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    
    .package-header h3 {
      font-size: 1.25rem;
    }
    
    .package-header a {
      color: var(--text);
      text-decoration: none;
    }
    
    .package-header a:hover {
      color: var(--accent);
    }
    
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }
    
    .package-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }
    
    .notes {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
    
    .alternative {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
    
    .alternative code {
      background: var(--bg);
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, monospace;
    }
    
    .error {
      color: #f87171;
      font-size: 0.75rem;
      margin-bottom: 0.5rem;
    }
    
    .example {
      margin-top: 0.75rem;
    }
    
    .example summary {
      cursor: pointer;
      color: var(--accent);
      font-size: 0.875rem;
    }
    
    .example pre {
      margin-top: 0.5rem;
      background: var(--bg);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 0.75rem;
    }
    
    .example code {
      font-family: 'SF Mono', Monaco, Consolas, monospace;
    }
    
    footer {
      text-align: center;
      padding: 3rem 0;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    
    footer a {
      color: var(--accent);
      text-decoration: none;
    }
    
    footer a:hover {
      text-decoration: underline;
    }
    
    details {
      cursor: pointer;
    }
    
    details summary {
      user-select: none;
    }
    
    details[open] summary {
      margin-bottom: 0.5rem;
    }
    
    details code {
      font-family: 'SF Mono', Monaco, monospace;
    }
    
    @media (max-width: 640px) {
      .container {
        padding: 1rem;
      }
      
      h1 {
        font-size: 1.75rem;
      }
      
      .stats {
        gap: 0.5rem;
      }
      
      .stat {
        min-width: 100px;
        padding: 0.75rem 1rem;
      }
      
      .stat-value {
        font-size: 1.5rem;
      }
      
      .filters {
        flex-direction: column;
      }
      
      .filters input,
      .filters select {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Works on Workers</h1>
      <p class="subtitle">
        Discover which npm packages work in Cloudflare Workers. ${workingTotal}+ packages tested and working.
      </p>
    </header>
    
    <div class="stats">
      <div class="stat highlight">
        <div class="stat-value">${workingTotal}+</div>
        <div class="stat-label">Packages Working</div>
      </div>
      <div class="stat">
        <div class="stat-value">${stats.total}</div>
        <div class="stat-label">Packages Tested</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: #3b82f6">${stats.useAlternative}</div>
        <div class="stat-label">💡 Alternatives</div>
      </div>
    </div>
    
    <div class="categories">
      <h2>Browse by Category</h2>
      <div class="category-grid">
        ${popularCategories.map(cat => {
          const count = data.packages.filter(p => 
            p.category === cat.name && 
            (p.status === 'works' || p.status === 'works-with-caveats' || p.status === 'built-in')
          ).length;
          return `
            <a href="?category=${cat.name}" class="category-card">
              <span class="category-icon">${cat.icon}</span>
              <div class="category-name">${cat.label}</div>
              <div class="category-desc">${cat.description} • ${count} working</div>
            </a>
          `;
        }).join('')}
      </div>
    </div>
    
    <form class="filters" method="get">
      <input 
        type="search" 
        name="q" 
        placeholder="Search packages..." 
        value="${escapeHtml(search)}"
        autocomplete="off"
      >
      <select name="category">
        <option value="">All Categories</option>
        ${categoryOptions}
      </select>
      <select name="status">
        <option value="">Filter by Status</option>
        ${statusOptions}
      </select>
      <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: var(--bg-card); border-radius: 8px; cursor: pointer;">
        <input type="checkbox" name="show_all" value="true" ${showAll ? 'checked' : ''} onchange="this.form.submit()">
        <span style="font-size: 0.875rem;">Show build tools & incompatible</span>
      </label>
    </form>
    
    ${!showAll && !statusFilter && !search ? `
    <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
      <p>Showing runtime packages only. Build tools, CLI tools, and test frameworks are hidden by default.</p>
      <p style="margin-top: 0.5rem;">Enable "Show build tools & incompatible" to see all ${data.packages.length} tested packages.</p>
    </div>
    ` : ''}
    
    <p class="results-count">
      Showing ${filtered.length} package${filtered.length === 1 ? '' : 's'}
    </p>
    
    <div class="packages">
      ${packagesHtml || '<p style="text-align: center; color: var(--text-muted);">No packages found matching your criteria.</p>'}
    </div>
    
    <div style="margin: 4rem 0 2rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 2rem;">
      <h2 style="text-align: center; margin-bottom: 1.5rem; color: var(--text);">Common Questions</h2>
      
      <details style="margin-bottom: 1rem;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0; color: var(--text);">Why are so many packages marked "Build/Dev Tool"?</summary>
        <p style="margin-top: 0.5rem; color: var(--text-muted); padding-left: 1rem;">
          Many popular npm packages are build tools (webpack, babel), test frameworks (jest, mocha), or CLI utilities (chalk, commander) that run during development—not in production. 
          Cloudflare Workers is a runtime environment for production code. These tools still work great for building your Workers project, they just don't run inside Workers themselves.
        </p>
      </details>
      
      <details style="margin-bottom: 1rem;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0; color: var(--text);">Can I use Express/Koa/Hapi in Workers?</summary>
        <p style="margin-top: 0.5rem; color: var(--text-muted); padding-left: 1rem;">
          Yes! As of September 2025, Workers supports <code style="background: var(--bg); padding: 0.125rem 0.375rem; border-radius: 4px;">node:http</code> server APIs. 
          Use <code style="background: var(--bg); padding: 0.125rem 0.375rem; border-radius: 4px;">httpServerHandler</code> from <code style="background: var(--bg); padding: 0.125rem 0.375rem; border-radius: 4px;">cloudflare:node</code> to wrap Express, Koa, or other Node.js HTTP frameworks. 
          For new projects, we recommend lightweight alternatives like <strong>Hono</strong> or <strong>itty-router</strong> which are built for edge environments.
        </p>
      </details>
      
      <details style="margin-bottom: 1rem;">
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0; color: var(--text);">What about databases like PostgreSQL or MySQL?</summary>
        <p style="margin-top: 0.5rem; color: var(--text-muted); padding-left: 1rem;">
          Workers supports database clients like <code style="background: var(--bg); padding: 0.125rem 0.375rem; border-radius: 4px;">pg</code> (PostgreSQL) and <code style="background: var(--bg); padding: 0.125rem 0.375rem; border-radius: 4px;">mysql2</code> when connecting to public endpoints. 
          For production, use edge-optimized solutions: <strong>Cloudflare D1</strong> (SQLite), <strong>Neon</strong> (serverless Postgres), <strong>PlanetScale</strong> (MySQL), or <strong>Upstash Redis</strong>.
        </p>
      </details>
      
      <details>
        <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem 0; color: var(--text);">Why doesn't package X work?</summary>
        <p style="margin-top: 0.5rem; color: var(--text-muted); padding-left: 1rem;">
          Common reasons: <strong>Native modules</strong> (C++ bindings like sharp, bcrypt) don't work—use alternatives like <code style="background: var(--bg); padding: 0.125rem 0.375rem; border-radius: 4px;">bcryptjs</code> or Cloudflare Images. 
          <strong>Filesystem access</strong> (fs module for local files) isn't available—use KV, R2, or D1 instead. 
          <strong>TCP sockets</strong> (raw socket.io, redis) aren't supported—use Durable Objects, WebSockets, or HTTP-based alternatives.
        </p>
      </details>
    </div>
    
    <footer>
      <p>
        Last updated: ${new Date(data.lastUpdated).toLocaleDateString()} 
        | Tested with Wrangler ${data.wranglerVersion}
        | Compatibility date: ${data.compatibilityDate}
      </p>
      <p style="margin-top: 0.5rem">
        <a href="https://github.com/cloudflare/works-on-workers">Contribute on GitHub</a>
        | <a href="/api/packages">API</a>
      </p>
    </footer>
  </div>
  
  <script>
    // Auto-submit on filter change
    document.querySelectorAll('.filters select').forEach(select => {
      select.addEventListener('change', () => select.form.submit());
    });
    
    // Debounced search
    let timeout;
    document.querySelector('.filters input[type="search"]').addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => e.target.form.submit(), 500);
    });
  </script>
</body>
</html>`;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const data = packagesData as PackageDatabase;
    
    // API endpoints
    if (url.pathname === '/api/packages') {
      return Response.json(data);
    }
    
    if (url.pathname.startsWith('/api/packages/')) {
      const packageName = decodeURIComponent(url.pathname.replace('/api/packages/', ''));
      const pkg = data.packages.find(p => p.name === packageName);
      
      if (pkg) {
        return Response.json(pkg);
      }
      
      return Response.json({ error: 'Package not found' }, { status: 404 });
    }
    
    // Homepage
    if (url.pathname === '/' || url.pathname === '') {
      const html = renderHomePage(data, url.searchParams);
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    
    // 404 for other paths
    return new Response('Not Found', { status: 404 });
  },
};
