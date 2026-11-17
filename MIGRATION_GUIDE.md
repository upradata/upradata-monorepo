# Migration Guide: Moving Libraries to Monorepo

## Overview

This guide helps migrate individual Upra-Data libraries into the monorepo structure.

## Steps to Migrate a Library

### 1. Create Package Directory

```bash
mkdir -p libs/{package-name}/src
```

### 2. Create `package.json`

Use the template below, adjusting exports for your library's public API:

```json
{
  "name": "@upradata/{package-name}",
  "version": "0.0.1",
  "description": "Library description",
  "type": "module",
  "main": "./lib/index.js",
  "module": "./lib-esm/index.js",
  "types": "./lib/index.d.ts",
  "exports": {
    ".": {
      "import": "./lib-esm/index.js",
      "require": "./lib/index.js",
      "types": "./lib/index.d.ts"
    }
  },
  "publishConfig": {
    "access": "public"
  },
  "files": ["lib", "lib-esm"],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "lint": "biome lint src",
    "lint:fix": "biome lint --write src",
  }
}
```

### 3. Copy Source Files

```bash
cp -r ../{old-name}/src/* libs/{package-name}/src/
```

### 4. Create Config Files

- `tsconfig.json` - extends root config
- `vitest.config.ts` - test configuration
- `.eslintrc.json` (optional if using shared config)

### 5. Update Imports

- Internal imports to workspace packages use: `@upradata/other-package`
- Mark all internal deps as `workspace:*` in package.json

### 6. Run Build & Tests

```bash
cd Monorepo(new)
pnpm install
pnpm build
pnpm test
```

## Subpath Exports Pattern

Define granular exports for better tree-shaking:

```json
"exports": {
  ".": "./lib/index.js",
  "./assign": "./lib/assign.js",
  "./guid": "./lib/guid.js"
}
```

Import usage:

```ts
import { assign } from '@upradata/util/assign';
```

## Common Issues

### Issue: Module not found

**Solution:** Ensure workspace deps are in `package.json` with `workspace:*` protocol.

### Issue: Type errors during build

**Solution:** Run `pnpm typecheck` and ensure tsconfig.json extends the root config.

### Issue: Tests fail with module resolution

**Solution:** Check vitest config includes correct `environment` and `globals` settings.
