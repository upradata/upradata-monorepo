# Add Vite+ tests across `libs`

We will continue a previous work unifinished. The worktree used is /home/milottit/.codex/worktrees/libs-tests.
Do not recreate a worktree. Resume the work from where it was left. You can check the created/modified files with the
git command for instance or whatever it is necessary.

## Summary

Here you find the initial plan to implement:

Create a new worktree from the current `monorepo-creation` base. Use Vite+ with its integrated Vitest runner to cover every public module exported by the 15 `libs` packages.

## Implementation Changes

- Put unit tests in each package’s `test/unit-test/` folder and end-to-end tests in `test/e2e/`. Move existing specs from `src` and other locations into the matching folder.
- Add unit tests for uncovered public entrypoints and subpaths, using package exports and entrypoints to define coverage. Strengthen the `decorators` tests so they assert behavior.
- Add `vp test run` to `stencil` and adapt its component rendering tests to Vitest-compatible assertions under `test/unit-test/`.
- Preserve end-to-end coverage for `npx-init` project generation and `npx-local` package installation under `test/e2e/`, using disposable fixtures and Vitest.
- Add end-to-end tests to other packages where behavior crosses module or process boundaries. Keep external services mocked and filesystem effects temporary; do not make live network calls.
- Avoid production API changes and additional test libraries unless the existing Vite+ Vitest setup requires them.

## Test Plan

- Run `vp test run` in every package, including `stencil`.
- Run the root workspace test script with `vp run test`.
- Confirm all tests pass and specs are located only under `test/unit-test/` or `test/e2e/`.

## Assumptions

- “Every exported module” means each package’s declared public entrypoints and subpaths, not every internal source file or individual exported symbol.
- Existing passing tests count where they already exercise a public module; add tests for uncovered modules.
- Unit and end-to-end suites both run through Vite+ Vitest and pass without external credentials or persistent fixture changes.
