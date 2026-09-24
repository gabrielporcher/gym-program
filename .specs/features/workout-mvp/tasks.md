# Workout MVP Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/workout-mvp/design.md`
**Status**: Approved

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `AGENTS.md` (lint `expo lint`, typecheck `tsc --noEmit`), `README.md` (Jest guide only, no runner configured), `package.json` (script `lint` only). No test files exist. Test types confirmed by the user: unit + integration in one Jest run. No device e2e in v1.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Domain (`src/lib/workout.ts` agenda e validação, `src/lib/auth.ts`) | unit | All branches; 1:1 to spec ACs; every listed edge case has a test | `src/lib/**/*.test.ts` | `bunx jest` |
| Persistence (SQLite, catálogo, gravações, fila) | integration | Key query paths + error handling | `src/lib/**/*.integration.test.ts` | `bunx jest` |
| Screen / hook / token / config | none | build gate only | — | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `bunx jest` |
| Full | After tasks with integration tests | `bunx jest` |
| Build | After phase completion or config/entity-only tasks | `bun run lint && bunx tsc --noEmit && bunx jest` |

---

## Execution Plan

Phases are ordered and run sequentially. Tasks inside a phase execute in order. Arrows below are real `Depends on` edges.

### Phase 1: Foundation

Runner, tokens, and the empty SQLite schema.

```
T1 → T2
T1 → T4
```

### Phase 2: Catalog and schedule

Seed, weekday map, and the outbox table write. No intra-phase edges.

### Phase 3: Program and session

Program writes, rest preference, then the session that depends on the program.

```
T5 → T8
T6 → T8
T7 → T8
T4 → T9
T7 → T9
T8 → T10
T10 → T11
T7 → T11
```

### Phase 4: Sync flush and auth

```
T7 → T12
T11 → T12
T1 → T13
T2 → T13
T13 → T14
T3 → T14
```

### Phase 5: Entry screens

```
T13 → T15
T3 → T15
T14 → T15
T10 → T16
T6 → T17
T8 → T17
T10 → T17
T14 → T17
T16 → T17
T6 → T18
T8 → T18
T14 → T18
```

### Phase 6: Day and session screens

```
T5 → T19
T8 → T19
T18 → T19
T3 → T20
T10 → T21
T14 → T21
T20 → T21
T9 → T22
T11 → T22
T21 → T22
```

---

## Task Breakdown

### Phase 1: Foundation

### T1: Add test runner and product dependencies

**What**: Declare Jest, `expo-sqlite`, and `@supabase/supabase-js`, and a `test` script.
**Where**: `package.json`
**Depends on**: None
**Reuses**: `expo-web-browser` already in `package.json`
**Requirement**: design integration points

**Tools**:

- MCP: `user-expo`
- Skill: `expo-overview`

**Done when**:

- [x] `expo-sqlite` and `@supabase/supabase-js` are installed with `npx expo install`
- [x] `jest-expo` is a dev dependency and `package.json` has `"test": "jest"`
- [x] Gate check passes: `bun run lint && bunx tsc --noEmit && bunx jest`

**Tests**: none
**Gate**: build

**Commit**: `build(workout): add jest sqlite and supabase`

---

### T2: Configure Jest for unit and integration

**What**: Add the jest-expo config that runs `src/lib/**/*.test.ts` and `src/lib/**/*.integration.test.ts`.
**Where**: `jest.config.ts`
**Depends on**: T1
**Reuses**: none
**Requirement**: design risk on tests

**Tools**:

- MCP: `user-expo`
- Skill: `expo-overview`

**Done when**:

- [x] `bunx jest` exits 0 with no test files yet
- [x] Gate check passes: `bun run lint && bunx tsc --noEmit && bunx jest`

**Tests**: none
**Gate**: build

**Commit**: `build(workout): configure jest-expo`

---

### T3: Set product tokens

**What**: Replace the template palette with the product tokens from the design.
**Where**: `src/constants/theme.ts`
**Depends on**: None
**Reuses**: `src/components/themed-text.tsx`, `src/components/themed-view.tsx`, `src/hooks/use-theme.ts`
**Requirement**: AD-002

**Tools**:

- MCP: NONE
- Skill: `expo-overview`

**Done when**:

- [x] Tokens match the design: primary `#2C7A7F`, accent `#4FD1C5`, ink `#2C3E50`, surface `#E6FFFA`, danger `#FF3B30`, canvas `#FFFFFF`
- [x] Space steps are 4, 8, 16, 24, 32. Radius is 12 on controls and 16 on cards. Border is 1px `#D5E8E6`
- [x] The same values apply in light and dark
- [x] Gate check passes: `bun run lint && bunx tsc --noEmit && bunx jest`

**Tests**: none
**Gate**: build

**Commit**: `feat(workout): set product color and spacing tokens`

---

### T4: Create the SQLite schema

**What**: Open the database and create the user tables from the design data models.
**Where**: `src/lib/db.ts`
**Depends on**: T1
**Reuses**: none
**Requirement**: design data models

**Tools**:

- MCP: `user-expo`
- Skill: `expo-overview`

**Done when**:

- [x] `getDatabase` and `migrate` create `programs`, `program_day_exercises`, `sessions`, `set_logs`, `rest_preferences`, `exercises`, and `outbox`
- [x] Integration tests in `src/lib/db.integration.test.ts` assert those tables exist. Test count: 1
- [x] Gate check passes: `bunx jest`

**Tests**: integration
**Gate**: full

**Commit**: `feat(workout): create the sqlite schema`

---

### Phase 2: Catalog and schedule

### T5: Seed the exercise catalog

**What**: Seed stable exercise ids and list them with muscle emphasis.
**Where**: `src/lib/db.ts`
**Depends on**: T4
**Reuses**: `migrate` from T4
**Requirement**: WORK-04, WORK-05

**Tools**:

- MCP: `user-expo`
- Skill: `expo-overview`

**Done when**:

- [ ] `listExercises` and `getExercise` return only the seeded catalog
- [ ] `bench-press` includes chest emphasis 5, triceps emphasis 3, and shoulder emphasis 4
- [ ] Emphasis values are integers from 1 to 5, role is `agonist` or `synergist`
- [ ] The same ids are the ones a Supabase seed would use
- [ ] Integration tests in `src/lib/db.integration.test.ts` cover the bench-press row and a list that contains only seed rows. Test count: 3
- [ ] Gate check passes: `bunx jest`

**Tests**: integration
**Gate**: full

**Commit**: `feat(workout): seed the exercise catalog`

---

### T6: Map the weekday to a template day

**What**: List the five templates and resolve the suggested day for a local weekday.
**Where**: `src/lib/workout.ts`
**Depends on**: T2
**Reuses**: the Schedule table in `design.md`
**Requirement**: WORK-06, WORK-07

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `listTemplates` returns ABC, ABCDE, ABC 2x, PPL, and full body
- [ ] ABC 2x exposes A1, B1, C1, A2, B2, C2
- [ ] `suggestedDay` follows the design map, including Monday A for ABCDE and Monday/Wednesday/Friday for full body
- [ ] Saturday and Sunday return null for ABCDE and full body. ABC 2x and PPL still suggest a day on Saturday. Sunday is null for every template
- [ ] Unit tests in `src/lib/workout.test.ts` cover each template and the unmapped weekend. Test count: 6
- [ ] Gate check passes: `bunx jest`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(workout): map weekday to the template day`

---

### T7: Enqueue a local row

**What**: Append a changed user row to the outbox.
**Where**: `src/lib/sync.ts`
**Depends on**: T4
**Reuses**: `getDatabase` from `src/lib/db.ts`
**Requirement**: design sync queue

**Tools**:

- MCP: `user-expo`
- Skill: `expo-overview`

**Done when**:

- [ ] `enqueue` stores `table`, `rowId`, and `payload` for `programs`, `program_day_exercises`, `sessions`, `set_logs`, and `rest_preferences`
- [ ] The catalog is not an outbox table
- [ ] Integration tests in `src/lib/sync.integration.test.ts` cover one enqueue and a rejected table. Test count: 2
- [ ] Gate check passes: `bunx jest`

**Tests**: integration
**Gate**: full

**Commit**: `feat(workout): enqueue a local row change`

---

### Phase 3: Program and session

### T8: Save the active program

**What**: Persist the draft program, its day exercises, and the single active program.
**Where**: `src/lib/workout.ts`
**Depends on**: T5, T6, T7
**Reuses**: `listTemplates`, `enqueue`
**Requirement**: WORK-08

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `saveActiveProgram` stores a draft for `abc`, `abcde`, `abc2x`, `ppl`, or `fullbody` with `origin: 'user'`
- [ ] `addExercise` stores the catalog exercise on that day with `plannedSets >= 1`
- [ ] `completeProgram` sets that program active and demotes any other active program for the user
- [ ] `completeProgram` rejects a program that has a day with no exercise and names that day
- [ ] Each successful write calls `enqueue`
- [ ] Integration tests in `src/lib/workout.integration.test.ts` cover add, the single active program, and the empty-day rejection. Test count: 4
- [ ] Gate check passes: `bunx jest`

**Tests**: integration
**Gate**: full

**Commit**: `feat(workout): save one active weekly program`

---

### T9: Store the default rest

**What**: Read and update the account rest default.
**Where**: `src/lib/workout.ts`
**Depends on**: T4, T7
**Reuses**: `enqueue`
**Requirement**: WORK-17

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Missing row returns 90 seconds
- [ ] `setDefaultRestSeconds` stores an integer of 1 or more and enqueues `rest_preferences`
- [ ] A value below 1 is rejected and the previous value remains
- [ ] Integration tests in `src/lib/workout.integration.test.ts` cover the default, the update, and the rejection. Test count: 3
- [ ] Gate check passes: `bunx jest`

**Tests**: integration
**Gate**: full

**Commit**: `feat(workout): store the default rest duration`

---

### T10: Open and close one session

**What**: Start, extend, skip, and finish a single in-progress session.
**Where**: `src/lib/workout.ts`
**Depends on**: T8
**Reuses**: `enqueue`, program rows from T8
**Requirement**: WORK-10, WORK-13, WORK-14, WORK-18

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `startSession(programId, dayId)` opens that day and does not change `suggestedDay`
- [ ] A second `startSession` while one is `in_progress` is rejected and the open session stays
- [ ] `addExtraSet` allows another set beyond the planned count
- [ ] `skipRemainingSets` keeps completed sets and moves on
- [ ] `completeSession` closes the session with the sets completed so far
- [ ] `getActiveSession` returns the open session or null
- [ ] Writes call `enqueue`
- [ ] Integration tests in `src/lib/workout.integration.test.ts` cover start, the second-session rejection, the extra set, the early skip, and close. Test count: 5
- [ ] Gate check passes: `bunx jest`

**Tests**: integration
**Gate**: full

**Commit**: `feat(workout): open and close one session`

---

### T11: Record a completed set

**What**: Insert a set only when it is completed, with kg, reps, and duration.
**Where**: `src/lib/workout.ts`
**Depends on**: T7, T10
**Reuses**: `enqueue`, session rows from T10
**Requirement**: WORK-09, WORK-12

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `completeSet` stores kg, reps, `startedAt`, and `completedAt`
- [ ] kg <= 0 or reps < 1 is rejected and no row is written
- [ ] A set that was started and not completed has no row
- [ ] The write calls `enqueue` for `set_logs`
- [ ] Integration tests in `src/lib/workout.integration.test.ts` cover the saved set, both invalid inputs, and the absent in-progress row. Test count: 4
- [ ] Gate check passes: `bunx jest`

**Tests**: integration
**Gate**: full

**Commit**: `feat(workout): record a completed set`

---

### Phase 4: Sync flush and auth

### T12: Flush the outbox once per row

**What**: Upsert queued rows by id and leave the queue in place when the network fails.
**Where**: `src/lib/sync.ts`
**Depends on**: T7, T11
**Reuses**: `enqueue`
**Requirement**: WORK-15, WORK-16

**Tools**:

- MCP: `user-expo`
- Skill: `expo-overview`

**Done when**:

- [ ] `flush` upserts each queued row by its device id and then removes that outbox entry
- [ ] A network failure stops the flush and keeps the queue
- [ ] Sending the same local set twice results in one upsert for that id
- [ ] Integration tests in `src/lib/sync.integration.test.ts` cover a successful flush, a failed flush, and the duplicate send. Test count: 3
- [ ] Gate check passes: `bunx jest`

**Tests**: integration
**Gate**: full

**Commit**: `feat(workout): flush each outbox row once`

---

### T13: Sign in with Google and password

**What**: Wrap Supabase Auth for Google, email sign-up, email sign-in, and the current session.
**Where**: `src/lib/auth.ts`
**Depends on**: T1, T2
**Reuses**: none
**Requirement**: WORK-01, WORK-02, WORK-03

**Tools**:

- MCP: `user-expo`
- Skill: `expo-overview`

**Done when**:

- [ ] `signUpWithPassword` and `signInWithPassword` resolve a session for valid credentials
- [ ] Wrong email or password rejects and does not return a session
- [ ] `signInWithGoogle` starts the browser OAuth flow
- [ ] `getSession` returns the persisted session or null
- [ ] Auth storage uses `expo-sqlite/localStorage`
- [ ] Unit tests in `src/lib/auth.test.ts` cover sign-up, sign-in, the bad password, and the Google call. Test count: 4
- [ ] Gate check passes: `bunx jest`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(auth): sign in with google and password`

---

### T14: Gate the app on the session

**What**: Show login when there is no session, and the product stack when there is.
**Where**: `src/app/_layout.tsx`
**Depends on**: T3, T13
**Reuses**: `getSession` from `src/lib/auth.ts`
**Requirement**: WORK-02, WORK-03

**Tools**:

- MCP: `user-expo`
- Skill: `expo-router`

**Done when**:

- [ ] With no session, the only route is login
- [ ] With a session, the `(app)` stack is reachable
- [ ] The template tab shell is no longer mounted
- [ ] Gate check passes: `bun run lint && bunx tsc --noEmit && bunx jest`

**Tests**: none
**Gate**: build

**Commit**: `feat(workout): gate routes on the auth session`

---

### Phase 5: Entry screens

### T15: Build the login screen

**What**: Google and email/password entry that stays on the screen when auth fails.
**Where**: `src/app/login.tsx`
**Depends on**: T3, T13, T14
**Reuses**: `ThemedText`, `ThemedView`, tokens from T3
**Requirement**: WORK-01, WORK-02, WORK-03

**Tools**:

- MCP: `user-expo`
- Skill: `expo-router`

**Done when**:

- [ ] Google and email/password both call the auth client
- [ ] A failed password shows the error and does not leave the screen
- [ ] A successful sign-in lands in the authenticated area
- [ ] One primary button, tokens from T3, no platform-specific native control
- [ ] Gate check passes: `bun run lint && bunx tsc --noEmit && bunx jest`

**Tests**: none
**Gate**: build

**Commit**: `feat(auth): add the login screen`

---

### T16: Read the active session

**What**: Share the in-progress session read between home and the session screen.
**Where**: `src/hooks/use-active-session.ts`
**Depends on**: T10
**Reuses**: `getActiveSession` from `src/lib/workout.ts`
**Requirement**: WORK-14

**Tools**:

- MCP: NONE
- Skill: `expo-overview`

**Done when**:

- [ ] The hook returns the `in_progress` session from `getActiveSession`, or null
- [ ] Gate check passes: `bun run lint && bunx tsc --noEmit && bunx jest`

**Tests**: none
**Gate**: build

**Commit**: `feat(workout): share the active session read`

---

### T17: Show today's workout

**What**: Home suggests the mapped day, offers every day when nothing is mapped, and resumes the open session.
**Where**: `src/app/(app)/index.tsx`
**Depends on**: T6, T8, T10, T14, T16
**Reuses**: `suggestedDay`, `use-active-session`, tokens from T3
**Requirement**: WORK-06, WORK-10, WORK-11

**Tools**:

- MCP: `user-expo`
- Skill: `expo-router`

**Done when**:

- [ ] No active program shows the path to create one and no workout of the day
- [ ] An active program shows the suggested day for the local weekday
- [ ] Saturday and Sunday with no mapped day say there is no suggestion and list the template days
- [ ] Choosing another day opens that session without editing the weekday map
- [ ] An `in_progress` session is the resume path
- [ ] `src/app/index.tsx` and `src/app/explore.tsx` from the template are gone
- [ ] Gate check passes: `bun run lint && bunx tsc --noEmit && bunx jest`

**Tests**: none
**Gate**: build

**Commit**: `feat(workout): show today's suggested workout`

---

### T18: Pick a weekly template

**What**: List the five templates and start a draft from the chosen one.
**Where**: `src/app/(app)/program/index.tsx`
**Depends on**: T6, T8, T14
**Reuses**: `listTemplates`, `saveActiveProgram`
**Requirement**: WORK-06, WORK-07

**Tools**:

- MCP: `user-expo`
- Skill: `expo-router`

**Done when**:

- [ ] The screen lists ABC, ABCDE, ABC 2x, PPL, and full body
- [ ] Choosing ABC 2x leads to the six days A1, B1, C1, A2, B2, C2
- [ ] Gate check passes: `bun run lint && bunx tsc --noEmit && bunx jest`

**Tests**: none
**Gate**: build

**Commit**: `feat(workout): pick a weekly template`

---

### Phase 6: Day and session screens

### T19: Fill a template day

**What**: Add catalog exercises and planned sets to one day, and block completing an empty day.
**Where**: `src/app/(app)/program/[dayId].tsx`
**Depends on**: T5, T8, T18
**Reuses**: `listExercises`, `addExercise`, `completeProgram`
**Requirement**: WORK-05, WORK-08

**Tools**:

- MCP: `user-expo`
- Skill: `expo-router`

**Done when**:

- [ ] The picker lists only catalog exercises
- [ ] Saving an exercise stores it on that day with the planned set count
- [ ] Completing the program with an empty day shows that day and does not activate the program
- [ ] Completing a full program leaves it as the only active program
- [ ] Gate check passes: `bun run lint && bunx tsc --noEmit && bunx jest`

**Tests**: none
**Gate**: build

**Commit**: `feat(workout): fill exercises on a program day`

---

### T20: Confirm leaving an open flow

**What**: Modal with stay or leave while a program draft or a session is unfinished.
**Where**: `src/components/leave-guard.tsx`
**Depends on**: T3
**Reuses**: tokens from T3, danger for the leave action
**Requirement**: design exit behavior

**Tools**:

- MCP: NONE
- Skill: `expo-overview`

**Done when**:

- [ ] The modal offers stay and leave
- [ ] Leave does not delete rows already stored
- [ ] Gate check passes: `bun run lint && bunx tsc --noEmit && bunx jest`

**Tests**: none
**Gate**: build

**Commit**: `feat(workout): confirm leaving an open flow`

---

### T21: List the session exercises

**What**: Show the day's exercises and the planned set count, and finish the workout.
**Where**: `src/app/(app)/session/[sessionId].tsx`
**Depends on**: T10, T14, T20
**Reuses**: `leave-guard`, `completeSession`, `skipRemainingSets`
**Requirement**: WORK-13, WORK-18

**Tools**:

- MCP: `user-expo`
- Skill: `expo-router`

**Done when**:

- [ ] Each exercise shows its planned set count
- [ ] Ending an exercise early keeps completed sets and opens the next exercise
- [ ] Finishing the workout closes the session
- [ ] Back navigation opens the leave guard. Leave keeps the session `in_progress`
- [ ] Gate check passes: `bun run lint && bunx tsc --noEmit && bunx jest`

**Tests**: none
**Gate**: build

**Commit**: `feat(workout): list the exercises in the session`

---

### T22: Log a set and run the rest timer

**What**: Capture kg and reps, then run the rest timer for the next set.
**Where**: `src/app/(app)/session/[sessionId]/[exerciseId].tsx`
**Depends on**: T9, T11, T21
**Reuses**: `completeSet`, `getDefaultRestSeconds`, `setDefaultRestSeconds`
**Requirement**: WORK-09, WORK-11, WORK-12, WORK-17

**Tools**:

- MCP: `user-expo`
- Skill: `expo-router`

**Done when**:

- [ ] Completing a set sends kg, reps, and the start/complete timestamps to `completeSet`
- [ ] Invalid kg or reps stay on the form and show the error
- [ ] When another set remains, rest starts at the saved default and can be skipped
- [ ] Changing the duration of the current rest restarts that timer and does not call `setDefaultRestSeconds`
- [ ] Saving a new default of 1 second or more is what the next rest uses
- [ ] A default below 1 second is refused and the previous default stays
- [ ] One primary button, large load number, tokens from T3
- [ ] Gate check passes: `bun run lint && bunx tsc --noEmit && bunx jest`

**Tests**: none
**Gate**: build

**Commit**: `feat(workout): log a set and run the rest timer`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6

T1 → T2
T1 → T4
T4 → T5
T2 → T6
T4 → T7
T5 → T8
T6 → T8
T7 → T8
T4 → T9
T7 → T9
T8 → T10
T10 → T11
T7 → T11
T7 → T12
T11 → T12
T1 → T13
T2 → T13
T13 → T14
T3 → T14
T13 → T15
T3 → T15
T14 → T15
T10 → T16
T6 → T17
T8 → T17
T10 → T17
T14 → T17
T16 → T17
T6 → T18
T8 → T18
T14 → T18
T5 → T19
T8 → T19
T18 → T19
T3 → T20
T10 → T21
T14 → T21
T20 → T21
T9 → T22
T11 → T22
T21 → T22
```

Execution is strictly sequential. There is no intra-phase parallelism. A single agent (or batch worker) works one task at a time, in order.

**How phase-based execution works:**

At Execute, the agent counts total tasks and packs phases into **task-budgeted batches** (~7 tasks
per worker, whole phases). A **phase** is the semantic/dependency unit; a **batch** is one or more
*consecutive whole phases* assigned to one worker. The cut only ever lands on a phase boundary.

This feature has 22 tasks, so it packs into more than one batch:

1. Phase 1 + Phase 2 (T1–T7)
2. Phase 3 + Phase 4 (T8–T14)
3. Phase 5 + Phase 6 (T15–T22)

Batches run only after the user accepts sub-agents. They run sequentially. When the last task is committed, a fresh Verifier runs automatically.

When the whole feature fits a single batch (≤ ~8 tasks), execution happens inline in the main window
with no sub-agents spawned.
