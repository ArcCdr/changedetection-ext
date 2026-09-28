# TDD Protocol

This project uses strict test-driven development. The protocol for 
every new feature or bug fix is:

1. **Write tests first** — write all test cases for the feature before 
any implementation, in the test file that mirrors the source file
(`src/lib/watches.js` → `tests/lib/watches.test.js`). Tests should be
complete and specific, including log assertions (`hasLog`) for every
new info/warn/error line.
Prompt example: "Write tests for `normalizeWatchList()`. TDD: no mock 
implementations yet."

2. **Confirm tests fail** — run `npx jest tests/lib/watches.test.js` and 
confirm every new test fails with the expected error (a missing module or
export counts as failing).

3. **Commit the failing tests** — stage only the test files, then
`git commit -m "test: add tests for watch list normalization"`

4. **Implement** — write the minimum code to make tests pass, with JSDoc.
Prompt: "Implement `normalizeWatchList()`. Do not modify tests. Keep going 
until all tests pass."

5. **Verify coverage** — `npm run test:coverage`
Coverage must be ≥ 95 % (lines, statements, functions) and ≥ 90 % (branches).
In unattended batch runs (`claude-run-tasks`) this step is deferred to the
final validation task; follow the task prompt.

6. **Refactor** — clean up code while keeping tests green and `npm run lint` clean.

7. **Commit implementation** — stage only the changed files, then
`git commit -m "feat: implement watch list normalization"`

Never skip step 2 (the tests must demonstrably fail first).
Never change test expectations to fit a broken implementation.
