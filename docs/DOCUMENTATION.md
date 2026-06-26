# Documentation Guide

## Overview

The Upra-Data monorepo uses **TypeDoc** to automatically generate API documentation from TypeScript source code. Documentation is deployed to **GitHub Pages** and accessible from `https://upra-data.github.io/monorepo/`.

## Structure

```
docs/
├── index.html              # Documentation portal (all packages)
├── api/
│   ├── util/              # @upradata/util API docs
│   ├── browser-util/      # @upradata/browser-util API docs
│   ├── decorators/        # @upradata/decorators API docs
│   └── ...                # Other packages
└── README.md              # This guide
```

## Generating Documentation

### Local Generation

Generate documentation for all packages:

```bash
pnpm docs
```

This runs:
1. `turbo run docs` — Builds TypeDoc for each package
2. `tsx scripts/generate-docs-index.ts` — Creates the documentation portal index

### Per-Package

Generate docs for a single package:

```bash
cd libs/util
pnpm docs
```

### Serving Locally

```bash
pnpm docs:serve
```

Then open `http://localhost:8000` and navigate to the `docs` folder.

## Configuration

### Root Configuration

**`typedoc.root.json`** — Root-level TypeDoc config:
- Aggregates all library entry points
- Generates main API reference
- Includes version info

### Per-Package Configuration

**`typedoc.package.json`** — Template for each package:
- Entry point: `src/index.ts`
- Output: `docs/` (included in published package)
- Excludes: externals, private, internal members

## Adding Documentation to Packages

### 1. TypeScript Comments

```typescript
/**
 * Deeply assigns properties from source to target.
 * 
 * @param target - The target object to assign to
 * @param source - The source object to copy from
 * @returns The modified target object
 * 
 * @example
 * ```ts
 * const result = assignDeep({ a: { b: 1 } }, { a: { c: 2 } });
 * // result: { a: { b: 1, c: 2 } }
 * ```
 */
export function assignDeep(target: any, source: any): any {
  // implementation
}
```

### 2. Module-Level Docs

Add a `README.md` at the package root. It will be included in generated docs.

```markdown
# @upradata/util

General utilities library with utilities for object, string, type manipulation.

## Features

- Deep object assignment
- Type utilities
- Promise helpers
- String utilities
```

### 3. Categories

Group related exports with TypeDoc categories:

```typescript
/**
 * @category String Utilities
 */
export function padStart(str: string, length: number): string {
  // ...
}

/**
 * @category String Utilities
 */
export function padEnd(str: string, length: number): string {
  // ...
}
```

## Cross-References

### Internal References

Link to other API members using TypeScript symbol references:

```typescript
/**
 * Similar to {@link assignDeep}, but shallow.
 * 
 * @see assignDeep - For recursive assignment
 */
export function assign(target: any, source: any): any {
  // ...
}
```

### External Package References

Reference types from other Upra-Data packages:

```typescript
import { assign } from '@upradata/util';

/**
 * Process items using {@link @upradata/util!assign}.
 */
export function processItems(items: any[]): void {
  // ...
}
```

## Deployment

### GitHub Pages Setup

Documentation is automatically deployed on every push to `main`:

1. **Trigger:** Push to `main` branch
2. **Build:** All packages built → TypeDoc generated → Portal created
3. **Deploy:** Uploaded to `gh-pages` branch
4. **URL:** `https://github-username.github.io/monorepo/`

### GitHub Settings

Ensure repository settings are configured:

1. Go to Settings → Pages
2. Source: Deploy from branch
3. Branch: `gh-pages`
4. Folder: `/` (root)

## Customization

### Theme

Change theme in `typedoc.root.json`:

```json
{
  "theme": "default"
}
```

### Exclude Members

Hide private/internal members:

```json
{
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeInternal": true
}
```

## Best Practices

1. **Document public APIs** — Use JSDoc comments on exports
2. **Add examples** — Include `@example` tags with runnable code
3. **Link related items** — Use `@see` and `{@link}` for navigation
4. **Group by category** — Organize related functions with `@category`
5. **Keep it updated** — Rebuild docs when API changes

## References

- [TypeDoc Documentation](https://typedoc.org/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [JSDoc Style Guide](https://jsdoc.app/)
