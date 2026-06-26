# Upra-Data Documentation Portal

Welcome to the Upra-Data monorepo documentation. This is the central hub for all API documentation across our libraries, applications, and tools.

## 📚 About

The Upra-Data monorepo contains TypeScript libraries, applications, and tools for data processing, transformations, and utilities.

**Documentation is automatically generated** from TypeScript source code using [TypeDoc](https://typedoc.org/) and deployed to GitHub Pages on every commit to `main`.

## 🗂️ Packages

### Libraries
Core utilities and functionality:
- **@upradata/util** — General utilities (objects, strings, promises)
- **@upradata/browser-util** — Browser-specific utilities
- **@upradata/node-util** — Node.js utilities
- **@upradata/decorators** — TypeScript decorators
- **@upradata/dependency-injection** — DI container
- **@upradata/proxy** — Proxy utilities
- **@upradata/rxjs** — RxJS integration
- **@upradata/stream** — Stream utilities
- **@upradata/object-convert** — Object conversion

### Applications
Ready-to-use applications:
- **@upradata/express** — Express middleware
- **@upradata/email** — Email utilities
- **@upradata/stencil** — Stencil components
- **@upradata/puppeteer** — Puppeteer utilities

### Tools
Build and CLI tools:
- **@upradata/gulp** — Gulp plugins
- **@upradata/webpack** — Webpack plugins
- **@upradata/commands** — CLI commands

## 🚀 Quick Start

### Installation

```bash
npm install @upradata/util
```

### Usage

```typescript
import { assign } from '@upradata/util';
```

## 📖 Full Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for comprehensive guide on:
- Writing documentation
- Cross-referencing packages
- Deployment process
- Best practices

## 🔗 Links

- [GitHub Repository](https://github.com/upra-data/monorepo)
- [npm Organization](https://www.npmjs.com/org/upradata)

## 📝 Features

✅ **Automatic Documentation** — Generated from TypeScript JSDoc  
✅ **Cross-Package References** — Link between related APIs  
✅ **Code Examples** — Runnable examples included  
✅ **Type Information** — Complete type signatures  
✅ **GitHub Pages** — Free hosting  

Generated with [TypeDoc](https://typedoc.org/)
