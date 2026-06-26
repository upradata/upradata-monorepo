# Upra-Data Monorepo

A comprehensive monorepo containing libraries, applications, and tools built with TypeScript, using pnpm workspaces and Turborepo.

## Getting Started

### Prerequisites
- Node.js 20.x or higher (use `.nvmrc` with nvm)
- pnpm 9.x or higher

### Install
```bash
pnpm install
```

### Development

```bash
# Lint all packages
pnpm lint
pnpm lint:fix

# Type check
pnpm typecheck

# Test
pnpm test
pnpm test:coverage

# Build
pnpm build

# Format code
pnpm format
```

## Workspace Structure

```
Monorepo(new)/
├── libs/           # Core libraries (@upradata/*)
├── apps/           # Applications
├── tools/          # CLI tools and build utilities
└── configs/        # Shared configuration packages
```

## Packages

### Configuration Packages
- `@upradata/tsconfig` - TypeScript configurations
- `@upradata/eslint-config` - ESLint configurations
- `@upradata/biome-config` - Biome formatting config
- `@upradata/vitest-config` - Vitest testing config

### Libraries
- `@upradata/util` - General utilities
- `@upradata/browser-util` - Browser-specific utilities
- `@upradata/node-util` - Node.js utilities
- `@upradata/decorators` - TypeScript decorators
- `@upradata/dependency-injection` - DI container
- `@upradata/proxy` - Proxy utilities
- `@upradata/rxjs` - RxJS utilities
- `@upradata/stream` - Stream utilities
- `@upradata/object-convert` - Object conversion utilities

### Applications
- `@upradata/express` - Express middleware
- `@upradata/email` - Email utilities
- `@upradata/stencil` - Stencil components
- `@upradata/puppeteer` - Puppeteer utilities

### Tools
- `@upradata/gulp` - Gulp plugins
- `@upradata/webpack` - Webpack plugins
- `@upradata/commands` - CLI commands
- And more...

## Contributing

See `CONTRIBUTING.md` for guidelines.
