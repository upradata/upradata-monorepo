# Monorepo Setup Checklist

## ✅ Completed Tasks

### Root Configuration

- [x] `pnpm-workspace.yaml` - defines workspace packages
- [x] `package.json` - root dependencies and scripts
- [x] `turbo.json` - build pipeline configuration
- [x] `tsconfig.json` - shared TypeScript configuration
- [x] `.npmrc` - npm registry and settings
- [x] `.nvmrc` - Node.js version pinning
- [x] `.gitignore` - exclusion patterns

### Config Packages (Phase 2)

- [x] `@upradata/tsconfig` - 5 config profiles
- [x] `@upradata/eslint-config` - flat config
- [x] `@upradata/biome-config` - formatting config
- [x] `@upradata/vitest-config` - test configuration

### Library Scaffolding (Phase 3)

- [x] `@upradata/util` - template with package.json structure
- [x] Subpath exports pattern defined
- [x] Build scripts configured

### Quality & DX (Phase 6)

- [x] `commitlint.config.js` - conventional commits
- [x] `.husky/commit-msg` - commit validation
- [x] `.husky/pre-commit` - auto-format + lint

### CI/CD (Phase 8)

- [x] `.github/workflows/pr-validation.yml` - PR checks
- [x] `.github/workflows/release.yml` - automated releases

### Documentation

- [x] `README.md` - project overview
- [x] `CONTRIBUTING.md` - development guide
- [x] `MIGRATION_GUIDE.md` - per-package template
- [x] `SETUP_CHECKLIST.md` - this file

---

## 🔄 Next Phase: Source Code Migration

To continue, you need to:

### 1. Copy Source Code

```bash
# Copy util sources
cp -r ../util/src/* libs/util/src/

# Repeat for other libraries
# cp -r ../browser-util/src/* libs/browser-util/src/
```

### 2. Update Imports

- Change relative imports to workspace imports
- Update `util/*` → `@upradata/util/*`
- Ensure `workspace:*` protocol in package.json

### 3. Test Installation

```bash
pnpm install
pnpm build
pnpm test
```

### 4. Create Changesets

```bash
pnpm changeset
```

### 5. Verify Subpath Exports

```bash
# From another directory:
cd /tmp
node -e "const pkg = require('@upradata/util/assign'); console.log(pkg)"
```

---

## 📚 Reference Files

- Migration plan: `repo:/memories/repo/upra-data-monorepo-migration-plan.md`
- Implementation details: `session:files/IMPLEMENTATION_COMPLETE.md`
- Status tracking: `session:files/monorepo-migration-status.md`

---

## 🧪 Testing Commands (Ready to Run)

Once source code is in place:

```bash
# Lint all packages
pnpm lint

# Type check
pnpm typecheck

# Run tests
pnpm test

# Build all packages
pnpm build

# Check coverage
pnpm test:coverage

# Format code
pnpm format

# Create release
pnpm changeset
pnpm version
```

---

## ⚠️ Important Notes

1. **Node.js requirement:** `>=20.0.0` (use `.nvmrc` with nvm)
2. **pnpm requirement:** `^9.0.0` (specified in root `package.json`)
3. **Git hooks:** Run `pnpm install` to initialize Husky hooks
4. **Workspace resolution:** Use `workspace:*` for internal dependencies
5. **Subpath imports:** Test with `@upradata/package/subpath` pattern

---

**Last Updated:** 2026-06-25
**Status:** Foundation complete, ready for source migration
