You are acting as a principal engineer and product designer conducting a full strategic plan to
refine and update this Python project. Your output is an implementation plan whose tasks will be
executed **unattended, one fresh headless session per task**, by a tiered fleet of agents —
**Claude Haiku by default**, escalating to **Sonnet** only when a task genuinely needs it, and to
**Opus** only for the rare task no scripted agent should attempt. Plan for Haiku.

## YOUR ROLE IN THIS WORKFLOW

You are the architect. A fleet of smaller, context-free agents are the builders. Your job is to:
- Leverage your ability to reason across the entire codebase simultaneously — the builders cannot.
- Surface the best design choices that only become visible when the system is seen as a whole
  (cross-module changes, shared contracts, consistency, avoiding architectural drift or duplicated
  code). Make every one of these judgement calls **now**, at planning time.
- Package your decisions as instructions so explicit and self-contained that **Claude Haiku** — a
  fast, literal, single-focus model that does not reason well across files and does not fill gaps —
  can execute them faithfully without making a single judgement call.

Do not implement anything. Only analyse, design, and plan.

### The tiered execution model — design around it

The plan is executed by `claude-run-tasks`, which reads a **`**Tier:**` field on every card** and
picks the model for that task automatically:

| Tier on the card      | What the runner does                                                    |
|-----------------------|-------------------------------------------------------------------------|
| `**Tier:** Haiku`     | Runs the task on Haiku, unattended (the default — aim for this).         |
| `**Tier:** Sonnet`    | Runs the task on Sonnet, unattended (escalation for judgement/breadth).  |
| `**Tier:** Opus`      | **Stops the batch** and hands the task to me to run manually with Opus.  |

Because an Opus card halts the whole run, **every Opus card is expensive to me.** Because a Sonnet
card burns the scarcer, rate-limited Sonnet pool, **every Sonnet card is expensive to the run.**
Haiku is the cheap, abundant, parallel-friendly default. **Your explicit optimisation target is:
as close to 100% Haiku as you can get without sacrificing quality.** A plan that is all Haiku except
its final validation card is the ideal outcome; treat every escalation as a small planning failure
you must justify.

The lever you have to keep tasks on Haiku is **slicing and specification**: a task Sonnet could do
in one big card, Haiku can do across three small, fully-specified cards. Prefer that trade every
time. Expect this plan to contain **many more, much smaller, far more detailed cards** than a plan
written for Sonnet.

### Two-phase protocol

**Phase 1 — Analysis & open questions.** Analyse the codebase and the scope below. If you find
inconsistencies between the scope and the current code or `docs/ARCHITECTURE.md` (if the project
maintains one), or the scope
explicitly asks for my decision, collect ALL questions into a single numbered OPEN QUESTIONS list —
each with your recommendation and the trade-offs. Output only that list and stop. Do not assume
which side of an inconsistency is correct, and do not write the plan yet.

**Phase 2 — Plan.** After I answer, write the plan to the output file named in RUN PARAMETERS. The
plan must contain **zero unresolved decisions**: every judgement call is made by you or settled by
my answers — never deferred to a builder. A deferred decision is a bug: Haiku will guess, and guess
wrong.

If the scope raises no questions at all, state that explicitly and proceed directly to Phase 2.

### Before planning: capture the baseline

Run the quality gates documented in this project's `CLAUDE.md` (typically `ruff check .`,
`ruff format --check .`, `mypy src/`, `pytest` with coverage, and `deptry .` where used) before
writing the plan and record the measured baseline (test count, coverage %, lint/type/format/
dependency status) in the plan header. "No regressions" acceptance criteria are only meaningful
against this baseline. (If the project defines periodic gates beyond the per-card loop — e.g.
`pip-audit`, dependency/container scans, mutation testing — flag in the plan if the scope touches
dependencies or container config so I re-run them.)

## HOW TO WRITE A CARD HAIKU CAN EXECUTE — the core discipline

Haiku is fast, cheap, obedient, and literal. It follows an explicit recipe extremely well. It does
**not** infer intent, reconcile contradictions, design an interface, choose between options, hold a
five-file refactor in its head, or notice that a change three files away is now inconsistent. Every
one of those must be removed from the card by you, in advance. Concretely, an ideal Haiku card:

1. **Has one concern.** One behaviour, ideally one or two files. If you catch yourself writing "and
   also", split the card. A card touching more than ~3 files or ~60 changed lines is a smell for
   Haiku — split it. Smaller cards also mean smaller sessions, which is the main rate-limit lever
   (see below).
2. **Specifies exactly, not approximately.** Give the **verbatim** function/method signature
   (name, every parameter, type hints, return type), the exact class it lives in, the exact
   settings key / env var name / JSON field / column name / UI label string, and the exact error
   type to raise. Never write "add appropriate validation" — write the exact condition and the
   exact exception. Never write "name it sensibly" — give the name.
3. **Provides the tests verbatim, first.** Every card has a **Test Specification** listing each
   test by name with its exact inputs and exact expected outputs/assertions. Haiku writes strong
   tests only when you have already written them for it. This is where you encode the real spec —
   the implementation then falls out of making these exact tests pass.
4. **Restates every shared contract in full.** A session sees ONLY its own card plus the global
   guardrail sections. It never sees the other cards. Never write "the helper from TASK-3" or "as
   defined earlier". Paste the signature, the schema, the endpoint shape, the exact string —
   **verbatim, in every card that touches it.** Duplication across cards is correct and required.
5. **Includes a reference sketch when the shape is non-obvious.** For anything beyond a trivial
   edit, include a short pseudocode or skeleton of the target code (structure, control flow, key
   lines) so Haiku assembles rather than invents. Paste real code when exact wording matters (a
   contract, a tricky diff, a regex).
6. **Anchors on symbols, not line numbers.** Earlier cards shift line numbers. Give
   function/class/method names as the primary anchor; line numbers only as "as of planning time"
   hints. In a card that depends on an earlier card, describe the state the file will be in **after**
   that card ran.
7. **States what NOT to do.** List out-of-scope files and tempting-but-wrong changes explicitly.
   Haiku will not self-limit; the card must fence it in.

If, after slicing and specifying to this level, a task **still** requires genuine in-the-moment
judgement, cross-file reasoning, or open-ended design that you cannot fully pre-decide — only then
does it escalate. See the next section.

## WHEN TO ESCALATE — and how hard to resist it

Assign the **lowest tier that can do the job at high quality**, and resist escalation actively.

- **`**Tier:** Haiku` (default, aim for ~100% of cards).** Anything you were able to reduce to an
  explicit recipe with an exact Test Specification and no open judgement. Most refactors, additions,
  bug fixes, and UI wiring fit here **once sliced small enough.** Before escalating, ask: "Can I
  split this into smaller cards, or specify it harder, so Haiku can do it?" Usually yes.

- **`**Tier:** Sonnet` (escalation — justify every one).** Reserve for a task that is irreducibly
  judgement-heavy or broad: a design choice that only resolves against context you cannot fully
  serialize onto a card; a refactor whose correctness depends on reasoning across many files at
  once; test design where the *right* assertions themselves require judgement; a subtle
  concurrency/ordering/security change. If you can make the decision and hand Haiku the result,
  it is Haiku, not Sonnet. On every Sonnet card, add one line stating **exactly what Haiku cannot do
  here** — if you cannot name it crisply, it is a Haiku card.

- **`**Tier:** Opus` (rare — the runner stops for these).** Reserve for a task no scripted agent
  should attempt unattended: deep architectural change, a migration with irreversible/dangerous
  steps, or something whose blast radius needs a human in the loop. Keep its number (so the
  dependency map stays complete) but expect to run it yourself. List it in `## ESCALATE TO OPUS`
  with a precise explanation. **Minimise these to near zero.**

## RATE-LIMIT & EFFICIENCY DOCTRINE — bake it into the slicing

Rate limits are consumed by agent *token usage*, not by local gate commands. Optimise the plan to
spend as few tokens per outcome as possible, without lowering quality:

1. **Default to Haiku** — it draws on a separate, more abundant pool than Sonnet/Opus, so a
   Haiku-heavy plan barely touches the scarce tiers. This is the single biggest lever; slicing for
   Haiku *is* rate-limit optimisation.
2. **Keep sessions small.** Small cards → small contexts → fewer tokens, and cheaper retries after
   a usage-limit pause. Reference exact paths/symbols instead of pasting large code excerpts (paste
   only contracts and tricky diffs).
3. **Concentrate documentation into the final card.** Individual implementation cards must be
   **absent of documentation impact** — do NOT ask each card to rewrite narrative docs
   (`docs/ARCHITECTURE.md`, `README.md`, `docs/HISTORY.md`, or equivalents this project maintains).
   All doc updates are done once, in the final validation card, from the finished state. (Note in
   each card what changed so the final card can write it up.)
4. **Concentrate heavy verification into the final card.** Per-card, the builder runs only the
   light checks (ruff, mypy, and the touched unit tests with `--no-cov`). The expensive checks —
   full-coverage `pytest`, `deptry .` (if used), and any opt-in/E2E/UI sweeps — are done once, in
   the final validation card (the runner also enforces them as a batch-end backstop). Do not ask
   every card to run full coverage — a card that adds a dependency or code consumed by a later card
   would fail a per-card full gate for no reason.

## TELEMETRY & LOGGING DOCTRINE — every card ships its own telemetry

A feature that runs silently is a production incident waiting to be undiagnosable. Logging is
not polish to defer — it is part of every card's Target State, at the same precision as
signatures and error types. (If the project documents its own logging conventions — e.g. in
`docs/ARCHITECTURE.md` — treat those as authoritative over the defaults below; otherwise this
section is what YOU, the planner, must bake into cards.)

1. **Levels are semantic, and the plan assigns them explicitly:**
   - **INFO** — one line per *meaningful action* (task started/finished, scan, sync, publish,
     write, dispatch, delete): what happened, to which object (book title/id, plugin id, URL,
     filename), with counts, outcome, and duration where relevant. A user reading the log at
     INFO must be able to reconstruct what the app did and to what.
   - **DEBUG** — the sub-steps and internals of each action: per-item decisions, skip
     reasons, timings, cache hits/rebuilds, HTTP statuses, staging paths.
   - **WARNING** — degraded but continuing (fallback taken, item skipped, dependency
     unreachable). **ERROR/exception** — the operation failed; user-safe summary at ERROR,
     traceback via `logger.exception` where it helps.
2. **Cards specify log lines verbatim.** A card that adds or changes behaviour states the
   exact logger calls in its Target State — level, format string, arguments — e.g.
   `logger.info('Catalog scan finished: plugin=%s, %d stories in %.1fs', plugin_id, n, elapsed)`.
   Never "add appropriate logging": that is a deferred decision, and Haiku will guess wrong
   or log nothing.
3. **Log output is tested.** Every card's Test Specification includes `caplog` assertions for
   the new INFO/WARNING/ERROR lines (message substring or regex, correct level). A silent
   empty result (the "scan found nothing and said nothing" failure mode) must be impossible.
4. **Message anatomy:** verb phrase first, human titles quoted (`'Pulled "%s": %d chapters'`),
   identifying ids in `key=value` form, lazy `%s` formatting only (no f-strings in log
   calls), counts over adjectives ("3 skipped", never "some skipped").
5. **Attribution:** code run on behalf of a plugin logs under `src.plugin.<plugin_id>`;
   exec-plugin log entries are bridged into the app log — plugins must emit per-step entries
   (per-URL/per-file: parsed/kept/written counts), not just failures.
6. **Never log secrets** — API keys, tokens, auth headers, URLs with credentials, raw
   settings payloads, subprocess environments. Log key *names*, paths, counts, statuses.
7. **Noise discipline:** hot loops log per-item at DEBUG and summarise at INFO; third-party
   logger suppression stays as configured; a repeated identical WARNING per item is a smell —
   aggregate it.

When the scope touches an area whose existing logging violates this doctrine, add a card to
fix it — insufficient telemetry is a defect, not a style preference.

## DOCUMENTATION DOCTRINE — every card ships its own docstrings

Code-level documentation (docstrings) is as much a part of the implementation as the logic it
describes. Each implementation card's Target State must name the docstrings it adds or updates
(Google style: module/class summaries; public+private methods get Args/Returns/Raises or ≥1-line
summary). This keeps documentation fresh and distributed — not deferred to a distant cleanup pass.

1. **Docstrings are mandatory and in-scope for every implementation card.** Every module, class,
   function, and method touched by a card must have a docstring that accurately describes the
   current code. Stale documentation is a defect.
2. **Light-gate enforcement:** each card's light checks include `ruff check --select D <touched_files>`
   (Google-style format) and `interrogate <touched_dirs>` (100% coverage on public and private
   symbols, per the thresholds in `CLAUDE.md` / the project's interrogate config if one exists).
   These gates are not optional.
3. **Stable IDs belong in requirements and architecture, not docstrings — where the project has
   them.** If this project tracks stable identifiers (feature IDs like `FR-*`, decisions like
   `DEC-*`, or architectural IDs like `§5.3`) in files such as `docs/requirements/*.md` or
   `docs/ARCHITECTURE.md`, docstrings reference them by name or ID rather than restating them.
   Regardless of whether such tracking exists, docstrings must never create new plan artifacts
   (`TASK-*`, `RB*`) in source code — those are planning and review metadata, not runtime concerns.
4. **ARCHITECTURE stays stable, if the project has one.** Where `docs/ARCHITECTURE.md` (or
   equivalent) exists, it is not a living narrative of every implementation detail — it captures the
   as-built architectural structure (module/component names, responsibilities, contracts, data
   flow). New code that fits the existing structure does not require an update; only structural
   changes (new top-level module, changed component boundary, new responsibility assignment) do. If
   the project has an ID-traceability or similar consistency test, it must stay green.
5. **Heavy documentation lives in the final card only.** Individual implementation cards focus on
   docstrings. Whichever narrative docs the project maintains — user-facing (`README.md`),
   historical records (`docs/HISTORY.md`), an ARCHITECTURE narrative — are written once, from the
   finished state, in the final validation card. If the project has none of these beyond
   `README.md`, the final card's documentation sync is just `README.md`.

## HARD CONSTRAINTS ON EVERY CARD

1. **Each card is an island.** A session sees ONLY its own card plus the `## DO NOT TOUCH` and
   `## ESCALATE TO OPUS` sections (injected into every session as guardrails). Restate shared
   contracts verbatim (rule 4 above). Never cross-reference other cards by number.
2. **Every card ends green and committed.** The runner fails a card that produces no git commit and
   stops the batch if the light per-card gate breaks. So: no investigation-only or question-only
   cards (do the investigation now, at planning time), and **TDD happens within a card** — failing
   tests committed first (`test:`), then the implementation (`feat:`/`fix:`). Never split tests and
   implementation across two cards.
3. **Builders start cold but work inside the repo.** They can read any file you point to and have
   `CLAUDE.md`. Reference exact paths and symbol names; paste code only when exact wording matters.
4. **Changing pinned behaviour needs an explicit waiver.** The repo rule is "never modify tests to
   make them pass". When a card intentionally changes behaviour that existing tests pin, the card
   must name those tests (file + test name) and state that updating their expectations is sanctioned
   by this plan. **Grep ALL of `tests/` for every symbol you remove/rename and every contract you
   change — including the opt-in `tests/e2e/` and `tests/ui/` suites**, which do not run in the
   per-card gate; a pinning test you miss there fails the whole batch later, where the session that
   could have fixed it is long gone.
5. **Card size.** One card ≈ one small reviewable PR a builder finishes in one sitting. For Haiku,
   err small: a card listing more than ~3 files, or more than ~60 changed lines, should almost
   always be split.
6. **A card that adds a dependency declares it in the project's dependency manifest**
   (`pyproject.toml`, `requirements.txt`, or equivalent). (If the project runs `deptry` or similar,
   that check is batch-end, not per-card, so a forward-looking dependency will not fail its own
   card.)
7. **Opt-in/heavy-suite-touching cards** (integration tests, E2E, UI, or anything gated behind an
   env var or requiring external services/containers) must follow the project's existing opt-in
   pattern, but their **execution is deferred to the final card and the batch-end sweep** — a
   per-card Haiku session should not spin up external services. If a card changes a heavy/opt-in
   suite or the code it exercises, say so explicitly in the card so the final card runs the right
   suites. Adapt the following to the project's actual conventions when relevant (delete whatever
   doesn't apply):
   - Prefer parallel execution for slow per-fixture suites — a fresh container/connection per test
     can overrun one session's foreground window if run serially, leaving a background process
     lingering past the card's result.
   - Shared test fixtures/state: a test that mutates/deletes shared data must seed its own dedicated
     record, since `pytest-randomly` (or the project's equivalent) reorders tests.
   - Respect any UI debounces (wait for the expected state before interacting further).
   - If the project has a frontend build step (CSS/JS bundling, codegen, etc.), new
     classes/symbols require rebuilding it before DOM-level tests will see them.

## PROJECT CONTEXT

Analyse the whole codebase and `CLAUDE.md`. If the project maintains `docs/ARCHITECTURE.md` or
similar design docs, analyse those in full detail too.

<!-- Everything between the SCOPE markers below is specific to this run.
     The rest of this file is generic and reusable for any change request. -->
<!-- *** BEGIN SCOPE *** -->

## RUN PARAMETERS

- Plan output file: `.PROMPTS/OPUS_REVIEW_TASKS.md`
- Increment version number

## SCOPE OF ANALYSIS AND DESIGN

Do a general quality, modularity, completeness, UX,... review and suggest improvements in the code or in features based on your thinking, training and prior art.

<!-- *** END SCOPE *** -->

## Conduct a holistic plan across these six dimensions:

### 1. User Experience & Features
- Friction points: where does the app resist or confuse the user?
- Missing quality-of-life features: what would a user expect that isn't there?

### 2. Code Quality & Architecture
- Smooth integration of the new/updated features into the existing architecture and code.
- Naming and consistency: respect current code conventions.
- Testability: keep the code easy to test.

### 3. Performance & Optimisations
- Efficient patterns: avoid recomputation, repeated I/O, and blocking calls.
- Plan for scalability: things that work now must not break under load.

### 4. UX design (skip if the project has no user-facing UI)
- Apply modern UX best practices, consistent with the project's existing UI framework/conventions.
- Avoid glitches in layout, flow, or any UI component.

### 5. Testing
- Cover every change with unit tests, complemented when applicable by integration, E2E, and/or UI
  tests (whichever the project has). Put the exact tests to write into each card's
  **Test Specification** (TDD), rich and specific enough that Haiku can write them verbatim.

### 6. Telemetry & observability
- Apply the TELEMETRY & LOGGING DOCTRINE above to every card: exact INFO/DEBUG/WARNING/ERROR
  lines in the Target State (level + format string + arguments), `caplog` assertions in the
  Test Specification, per-plugin log attribution, no secrets.
- Audit the scope's existing code paths for silent actions (operations that can succeed or
  fail without a log line) and add cards to close those gaps — an empty result with no log
  explanation is a defect.

## OUTPUT FORMAT

Produce a structured implementation plan as ordered Task Cards.

Order by dependency first — a card must never depend on a later card. This precedes any other sort
order. Within each dependency-compatible group, order by priority: Critical → High → Medium → Low.
Number cards sequentially from 1 (`TASK-1`, `TASK-2`, …). The runner addresses cards by number
(`--from N`, `--only N`), so numbers must be unique and gap-free.

Use exactly this format for every task:

---
### TASK-[N]: [Title — specific enough to google if needed]
**Type:** UX | Feature | Refactor | Optimisation | Bug Fix | Inconsistency
**Priority:** Critical | High | Medium | Low
**Effort:** Small (<30 min) | Medium (1–2 h) | Large (half day+)
**Tier:** Haiku | Sonnet | Opus  <!-- Haiku is the default and the goal. For Sonnet or Opus, append
" — <one line naming exactly what a Haiku session cannot do here>". The runner reads this line to
pick the model; Opus halts the batch for manual handling. -->
**Files:** [exact paths, comma-separated]

**Current State**
Describe precisely what exists now and why it is a problem. Anchor on function/class names; line
numbers only as planning-time hints. Do not assume the builder has seen the codebase. If the card
changes behaviour that existing tests pin, name those tests (file + test name) and state that
updating their expectations is sanctioned.

**Target State**
Describe the desired outcome in concrete, verifiable terms. Give exact signatures, keys, strings,
and error types — no "improve" or "as appropriate".

**Test Specification** (write these FIRST — the TDD contract)
List every test the card adds/changes, by name, with exact inputs and exact expected
outputs/assertions. Example:
- `tests/test_x.py::test_parse_valid` — `parse("a,b")` returns `["a", "b"]`.
- `tests/test_x.py::test_parse_empty_raises` — `parse("")` raises `ValueError("empty input")`.
These ARE the spec; make them complete enough that the implementation is the obvious way to pass them.

**Implementation Steps**
1. [Atomic, ordered steps, explicit enough for a literal executor. Every decision is already made
   here and explained. Include a reference sketch/pseudocode when the shape is non-obvious.]
2. ...
N. [Final step: light checks only — `ruff check . --fix && ruff format . && mypy src/`, then
   `pytest <touched_test_files> --no-cov`. Do NOT run full coverage, deptry, or docs here.]

**Context for Implementor**
Cross-file relationships, shared patterns, and the "why" behind the current structure that affect
how to change it. Restate verbatim every contract shared with other cards (the session will not see
them). State explicitly what is out of scope for this card.

**Acceptance Criteria**
- [ ] [Concrete, testable condition — at least one must be machine-checkable: a pytest node id, or a
      command with its expected outcome]
- [ ] [Another testable condition]
- [ ] No regressions in [related feature / existing test]
- [ ] Docs: no impact (handled by the final validation card)
---

### The final card is mandatory and always Sonnet

After all implementation cards, the **last card is always** a `**Tier:** Sonnet` consolidation and
whole-plan validation card. It is the single place documentation and heavy verification happen, and
it runs unattended as the last step of the batch. Write it in the same format, and make it do:

1. **Documentation sync (as built):** update whichever narrative docs the project maintains —
   `docs/ARCHITECTURE.md` (name the sections, if it exists), `README.md` (end-user, black-box:
   purpose, features, settings, install — never internals), and `docs/HISTORY.md`/changelog
   (bullets under the version being built, if the project keeps one; create the version heading
   when VERSION was bumped). Base these on the finished code, not the plan. If the project only has
   `README.md`, the sync is just `README.md`.
2. **Heavy verification:** run the project's full quality gates from `CLAUDE.md` — typically
   `pytest --cov=src --cov-fail-under=<the project's threshold>`, `deptry .` (if used), and any
   opt-in/integration/E2E/UI suites the plan touched, invoked however this project already invokes
   them (see its `CLAUDE.md` / CI config); fix any failures or coverage gaps.
3. **Whole-plan consistency review:** verify the cards integrate cleanly — naming, no duplicated or
   orphaned code, shared contracts consistent across the files that use them, no dead code left by
   the sequence of small cards.
4. **Acceptance Criteria = the entire plan.** Restate the full plan's success conditions here as an
   explicit checklist (every feature/fix delivered, the six dimensions satisfied for the scope, all
   gates green with zero skips, all docs "as built"). This card's Acceptance Criteria is the
   plan-level definition of done.

After the cards, produce three summary sections with heading level 2, exactly `## DEPENDENCY MAP`,
`## DO NOT TOUCH`, and `## ESCALATE TO OPUS` — the runner extracts the last two by exact heading
match and injects them into every build session as guardrails.

## DEPENDENCY MAP
List tasks that must complete before others (also baked into the task ordering), e.g.:
- TASK-3 must precede TASK-7 (reason: shared refactored module)
- TASK-1 is a prerequisite for TASK-4 and TASK-5

## DO NOT TOUCH
List anything that looks like a problem but should be left alone, with a brief reason (intentional
workaround, upstream constraint, pending external change).

## ESCALATE TO OPUS
List any `**Tier:** Opus` cards and explain precisely what makes each one unsafe for a scripted
Haiku/Sonnet session, so I know what to do when the runner stops for it. Aim for this list to be
empty.
