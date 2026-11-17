#!/usr/bin/env node
/**
 * Generate documentation index that links all package documentation
 * and creates a central documentation portal.
 */

import { writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'node:path';

const docsDir = './docs';
const libsDir = './libs';
const appsDir = './apps';
const toolsDir = './tools';

interface PackageInfo {
  name: string;
  path: string;
  category: 'lib' | 'app' | 'tool';
}

function getPackages(): PackageInfo[] {
  const packages: PackageInfo[] = [];

  const dirs = [
    { dir: libsDir, category: 'lib' as const },
    { dir: appsDir, category: 'app' as const },
    { dir: toolsDir, category: 'tool' as const },
  ];

  for (const { dir, category } of dirs) {
    try {
      const items = readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          packages.push({
            name: item.name,
            path: `${dir}/${item.name}`,
            category,
          });
        }
      }
    } catch {
      // Directory doesn't exist yet
    }
  }

  return packages;
}

function generateIndexHTML(packages: PackageInfo[]): string {
  const libs = packages.filter(p => p.category === 'lib');
  const apps = packages.filter(p => p.category === 'app');
  const tools = packages.filter(p => p.category === 'tool');

  const packageLinks = (pkgs: PackageInfo[]) =>
    pkgs
      .map(
        p =>
          `<li><a href="./api/${p.name}/index.html" class="package-link">@upradata/${p.name}</a></li>`
      )
      .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upra-Data Monorepo Documentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      margin-bottom: 40px;
    }
    h1 { color: #667eea; margin-bottom: 10px; font-size: 2.5em; }
    .subtitle { color: #666; font-size: 1.1em; margin-bottom: 20px; }
    .links { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 20px; }
    .link-btn {
      display: inline-block;
      padding: 10px 20px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      transition: background 0.3s;
    }
    .link-btn:hover { background: #764ba2; }
    .packages-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }
    .package-section {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }
    .package-section h2 { color: #667eea; margin-bottom: 20px; font-size: 1.5em; }
    .package-section ul { list-style: none; }
    .package-section li { margin-bottom: 10px; }
    .package-link { color: #667eea; text-decoration: none; font-weight: 500; }
    .package-link:hover { color: #764ba2; text-decoration: underline; }
    .footer { text-align: center; color: white; margin-top: 40px; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Upra-Data Monorepo</h1>
      <p class="subtitle">Complete API documentation for all packages</p>
      <div class="links">
        <a href="https://github.com/upra-data/monorepo" class="link-btn">GitHub</a>
      </div>
    </div>
    <div class="packages-grid">
      ${libs.length > 0 ? `<div class="package-section"><h2>📚 Libraries</h2><ul>${packageLinks(libs)}</ul></div>` : ''}
      ${apps.length > 0 ? `<div class="package-section"><h2>🚀 Applications</h2><ul>${packageLinks(apps)}</ul></div>` : ''}
      ${tools.length > 0 ? `<div class="package-section"><h2>🔧 Tools</h2><ul>${packageLinks(tools)}</ul></div>` : ''}
    </div>
    <div class="footer">
      <p>Upra-Data Monorepo Documentation • Auto-generated with TypeDoc</p>
      <p>Last updated: ${new Date().toISOString().split('T')[ 0 ]}</p>
    </div>
  </div>
</body>
</html>`;
}

// Main
mkdirSync(docsDir, { recursive: true });
const packages = getPackages();
const indexHTML = generateIndexHTML(packages);
writeFileSync(join(docsDir, 'index.html'), indexHTML);
console.log('✅ Documentation index generated at docs/index.html');
console.log(`📦 Found ${packages.length} packages`);
packages.forEach(p => { console.log(`   - @upradata/${p.name}`); });
