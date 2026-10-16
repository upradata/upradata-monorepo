# Contributing to Upra-Data Monorepo

## Setup

1. **Clone and install:**

    ```bash
    git clone <repo>
    cd Monorepo(new)
    nvm use  # Ensures Node.js 20.x
    pnpm install
    ```

2. **Verify setup:**

    ```bash
    pnpm build
    pnpm test
    ```

## Development Workflow

### Code Changes

```bash
# Make changes to any package in libs/, apps/, or tools/

# Lint and format
pnpm lint:fix
pnpm format

# Type check
pnpm typecheck

# Test locally
pnpm test

# Build
pnpm build
```

### Commits

- Use conventional commits: `feat: ...`, `fix: ...`, `docs: ...`
- Each commit message should be descriptive
- Include `Co-authored-by` trailer if pair-programming

Example:

```
feat(util): add new utility function

Add assignDeep for recursive object assignment.
Includes unit tests and TypeScript types.

Co-authored-by: Other Dev <dev@example.com>
```

### Creating a New Package

Follow the [Migration Guide](./MIGRATION_GUIDE.md) for the template structure.

## Testing

- Unit tests: `src/**/*.test.ts`
- Run coverage: `pnpm test:coverage`
- Vitest config in each package: `vitest.config.ts`

## Building & Publishing

```bash
# Create changeset (documents changes for changelog)
pnpm changeset

# Generate version bump PR
pnpm version

# Publish to npm
pnpm publish
```

## Issues & Questions

- Open issues for bugs or feature requests
- Use existing labels for categorization
- Reference PRs when needed

## Code Style

- **Formatting:** Biome + ESLint
- **TypeScript:** Strict mode required
- **Decorators:** `experimentalDecorators` enabled
- **Node target:** ES2020

Run before committing:

```bash
pnpm format
pnpm lint:fix
pnpm typecheck
```
