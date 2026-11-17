Upra-Data organization have a lot of libraries you can see in #codebase except Monorepo(new). The project is to create a monorepo in Monorepo(new) containing all the libraries. The monorepo has to use modern tools as :

### Core tooling

- pnpm workspaces
- Turborepo
- TypeScript strict mode
- tsup (ESM + CommonJS + `.d.ts`)
- Vitest with coverage
- Biome (formatter + linter)
- Changesets for versioning
- Conventional Commits
- Commitlint
- Husky
- Typedoc
- GitHub Actions
- npm publishing
- release PRs
- dependency graph
- shared tsconfig packages

Of course, you can propose me alternatives to the tools above if you think they are better. The goal is to have a monorepo that is easy to maintain, has a good developer experience, and is easy to publish.

Here you can find my previous eslint config /home/milottit/Libraries/System/config/eslint/.eslintrc.js.

Parse all the libraries from the #codebase and extract the coding styles and patterns used in them.

The CI/CD pipeline should be set up to run tests, linting, and type checking on every pull request. It should also automatically generate release notes based on the commit messages and create a new release when changes are merged into the main branch.

Pull request:

install
↓
lint
↓
typecheck
↓
test
↓
coverage
↓
build

Merge to main:

changesets
↓
version bump
↓
build
↓
publish npm
↓
GitHub Release


The AI layer should be able to analyze the codebase and suggest improvements to the coding styles and patterns used in the libraries. It should also be able to detect any potential issues or bugs in the code and provide recommendations for fixing them.

You can try a template similar to this one:

.github/
    copilot-instructions.md

    instructions/
        architecture.instructions.md
        style.instructions.md
        testing.instructions.md
        security.instructions.md
        docs.instructions.md

    prompts/
        feature.prompt.md
        debug.prompt.md
        refactor.prompt.md

    agents/
        architect.agent.md
        implementer.agent.md
        reviewer.agent.md

    skills/
        worklog/
        testing/
        release/


For any suggestions or improvements, please provide detailed explanations and examples. The goal is to create a monorepo that is easy to maintain, has a good developer experience, and is easy to publish.

For any instructions I gave you, you can propose me alternatives or improvements if you think they are better. Ask me questions if you need more information to provide better suggestions.