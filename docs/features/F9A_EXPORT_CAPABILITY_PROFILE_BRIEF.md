# F9a — The export honours the captured capability profile (Brief)

**Status:** Draft — the owner's four rulings of 2026-09-08 are applied (§9); awaiting the Astra review, then owner lock
**Author:** Claude Opus 5 (1M context) — routine-upstream seat
(`docs/governance/OPERATING_AGREEMENT.md` §3.6, STRAT-D4: "Routine upstream;
default capability-class implementation review"). Seat confirmed against that
table before authoring; the owner's choice of this seat for this brief on
2026-09-08 is recorded in the live `[STATE]` drawer
`drawer_havdm_state_a15b0af78e0814cfd19cf627` item 11 and in the
`claude-code`/`havdm` diary entry of 2026-09-08.
**Reviewer:** **OpenAI Codex / GPT-6 Astra** — the
`docs/governance/OPERATING_AGREEMENT.md` §3.6 **default** seat for plan and
spec review (the Sol/Codex row). **Not a per-slice override**, so there is none
to record: Astra signs its own committed reviews "OpenAI Codex / GPT-6 Astra"
(`docs/reviews/b7-product-backlog-codex-review.md:3`) and its four B7 reviews
are named `*-codex-review.md`. Named to the exact model as §3.1 requires — the
§3.6 watch attributes escaped defects to seat + model. Chosen by the owner
2026-09-08; ruling and correction at §9.1.
**Owner gate:** the owner locks this brief before spec authoring begins
(`docs/governance/OPERATING_AGREEMENT.md` §1, §3).
**Branch:** `feature/f9a-brief` · **Created:** 2026-09-08 · **Base:** `main` =
`691c8d1`
**Classification:** **capability** — the slice touches shared export services
(`src/services/yamlService.ts`, `src/services/yamlConversionService.ts`,
`src/services/cardModTranslator.ts`) and the capability layer under
`src/services/capability/`. Capability-class takes the full chain
(`docs/governance/OPERATING_AGREEMENT.md` §3.7, STRAT-D6).

**Parent objective:** board epic **E01 — "the export tells the truth about what
Home Assistant will render"** (`PVTI_lAHOBFbZhs4BgtcWzg53c5g`; story **S01.1** =
GitHub Issue #159).
**Cheapest acceptable outcome:** the card-mod decision is read from the
captured profile at every export path that sends bytes to Home Assistant or to
a file, the existing warning is shown when card-mod is absent, and a
never-connected user is unaffected. (Owner-adopted 2026-09-08, §9.3.)
**Cost stop-rule:** if the spec, its review, or the implementation reaches a
point where making this work requires changing how the export services are
constructed — a new provider, a module-level global, or threading a parameter
through code that is not on the five call sites' path — work halts and
re-asks. (Owner-adopted 2026-09-08, §9.3.)

---

## 0. What this document is, and what it is not

This is the **brief**: the locked input a Sonnet session writes the F9a
**spec** from (`docs/governance/OPERATING_AGREEMENT.md` §3.6 — "Sonnet: spec
authoring from locked briefs").

It carries the problem in product terms, the ruled scope and its boundary, the
code facts the spec must respect, which decisions are already made and which
are the spec's to make, the acceptance bar in the owner's words, and the
red-before-green legs the owner named.

It deliberately does **not** contain normative behaviour, an
acceptance-criteria matrix, a test plan, or a list of files to change. Those
are the spec's, and writing them here would repeat the 2026-09-07 seat
deviation this slice was restarted to correct
(`drawer_havdm_decisions_6cee661a86b707ac149e207d`; practice rule
`drawer_practice_review_16154bed9f1fe37d44b7c2a4`).

§4's `path:line` references are **measurements of today's code**, not a change
list. Every one was re-measured on this branch's base (`main` = `691c8d1`) on
2026-09-08 with the command printed beside it. Nothing in §4 was inherited from
the withdrawn spec without being measured again.

---

## 1. The product problem, in plain English

A user builds a dashboard in HAVDM, styles some cards, and exports or deploys
it to their Home Assistant.

Some of that styling only works if the **card-mod** add-on is installed on
their Home Assistant. HAVDM already knows how to handle that: when card-mod is
absent it is supposed to remove the styling that would not work and tell the
user plainly — _"… had custom styling removed because the card-mod add-on isn't
installed on your Home Assistant."_

HAVDM also already **knows** whether card-mod is installed. It records that on
every connection, in a capability profile it keeps on disk.

The two halves have never been connected. The export assumes card-mod is
installed — always, for everybody — so the removal never happens and the
sentence is never shown. A user without card-mod gets a dashboard that renders
wrong on their Home Assistant, and HAVDM says nothing.

That is a truthfulness failure, which is why the story sits under E01. The
project's vision calls it out directly: HAVDM should **translate where it can
and honestly mark what it cannot**, and the Phase 7 record names card-mod as
one of two unhedged dependencies the vision itself never named
(`drawer_havdm_testing_ad358a7d31912bba2419205d`).

---

## 2. The scope, as ruled

The owner split F9 on 2026-09-07 (`drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c`):

- **F9a — this slice.** Thread the captured capability profile into the export
  path so the card-mod decision is read from the profile instead of assumed;
  when card-mod is absent the existing strip-and-warn path runs and the user
  sees the existing warning; never-connected stays permissive. One capability
  object carries **both** the card-mod and the layout-card facts
  (remediation-order item 9, `drawer_havdm_decisions_6e8d4788d9513ccce593c378`).
- **F9b — later, its own spec. OUT OF SCOPE HERE.** Sections-first view
  translation under ruling **R3**: emit `custom:grid-layout` only when a
  native `sections` view cannot hold the geometry **and** layout-card is
  installed (or the user explicitly opts in); always warn when geometry is
  lossy; sanitise dead `view_layout` keys (Codex finding N6). This is backlog
  story **S01.2**, and it depends on S01.1.

The story's outcome in the approved backlog
(`docs/strategy/2026-09-07-product-backlog-seeding.md` §4, E01 row S01.1 —
frozen document):

> The export reads ONE captured capability object for BOTH card-mod and
> layout-card: when card-mod is absent, card-mod-only styling is stripped and
> the existing warning shown; the layout-card flag is honoured the same way;
> never-connected stays permissive.

⚠ **The boundary that needs saying out loud.** The card-mod half has a
consumer in today's code (§4, F2). The layout-card half's consumer — the rule
that decides whether a `custom:grid-layout` view may be emitted at all — is
R3, and R3 is F9b. So "the layout-card flag is honoured the same way" cannot
mean the same thing for both halves inside F9a. **The owner ruled this on
2026-09-08 (§9.2, option A): F9a's one capability object CARRIES a layout-card
fact and nothing consumes it until F9b.**

---

## 3. Where this sits in the run

- First **product** PR under the governance pause
  (`drawer_havdm_decisions_89b5f20cc75d3f70a7e0491b`). The pause's watch item
  (`PVTI_lAHOBFbZhs4BgtcWzg5sSBI`) reads "0 of 3"; F9a is the first counted.
- Ruled order of the first three product PRs: **F9a → F6 (S02.1) → F10
  (S02.2)** (`drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c` ruling 2;
  `drawer_havdm_decisions_d30f5f85e1c5237c664ca26f`).
- Chain for this slice, from the no-override ruling
  (`drawer_havdm_decisions_6cee661a86b707ac149e207d`, "why it matters" (3)):
  **brief (this) → spec (Sonnet) → spec review (Codex) → owner sign-off →
  implementation (Codex) → implementation review (Opus)**.

---

## 4. The facts the spec must respect

Every fact below was measured on `main` = `691c8d1` on 2026-09-08. Line numbers
decay — the commands are the durable part
(`drawer_havdm_src_3488d55dd69286718dfaddce`).

### F1 — Two `?? true` defaults assume card-mod is installed

```
grep -rn "cardModAvailable" src --include=*.ts --include=*.tsx
```

returns exactly five lines:

| `path:line`                                  | What it is                                                   |
| -------------------------------------------- | ------------------------------------------------------------ |
| `src/services/yamlConversionService.ts:979`  | `cardModAvailable?: boolean;` — option declaration           |
| `src/services/yamlConversionService.ts:1035` | `cardModAvailable: options.cardModAvailable ?? true,`        |
| `src/services/cardModTranslator.ts:62`       | `cardModAvailable?: boolean;` — option declaration           |
| `src/services/cardModTranslator.ts:108`      | `const cardModAvailable = options.cardModAvailable ?? true;` |
| `src/services/cardModTranslator.ts:181`      | `if (!cardModAvailable) {` — the only **use**                |

**No line in `src/` supplies a value for this option.** That is a property of
the name, so the grep above decides it: the only assignment form present
(`:1035`) forwards the option to itself with the same default.

### F2 — The strip-and-warn path exists and is complete

`src/services/cardModTranslator.ts:181-198` — under `if (!cardModAvailable)`
the function returns the card with the card-mod-only keys removed plus one
warning carrying `reason: 'card-mod-unavailable'` and a user-facing sentence.

The plain-language summary sentence also already exists:
`src/services/exportWarningSummary.ts:51-52` —

> "N cards had custom styling removed because the card-mod add-on isn't
> installed on your Home Assistant."

⭐ **Nothing about the warning or the stripping needs to be authored.** F9a is
a wiring slice: the behaviour is built and unreachable.

### F3 — Why it is unreachable — the option chain, traced by hand

⚠ **Labelled hand trace, not a script.** "Does this branch execute in
production" is a control-flow property; no text search decides it
(`drawer_practice_claims_1fcfbf72537d81a3cdb9bc69`). Each hop below was
enumerated with a command; the trace is the joining of them.

| Hop | Site                                              | What is passed                                                                                       | Enumerating command                                                                                                                                       |
| --- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `src/services/yamlService.ts:289-291`             | `exportDashboard(sanitized, { warnings })` — the object literal contains `warnings` and nothing else | `grep -rn "exportDashboard(" src --include=*.ts --include=*.tsx` → 2 hits: the declaration at `yamlConversionService.ts:1119` and this one call           |
| 2   | `src/services/yamlConversionService.ts:1133`      | `exportCard(card, options)` — the same options object, forwarded                                     | `grep -rn "exportCard(" src --include=*.ts --include=*.tsx` → 2 hits: the declaration at `:988` and this one call                                         |
| 3   | `src/services/yamlConversionService.ts:1034-1036` | `translateToCardMod(exported, { cardModAvailable: options.cardModAvailable ?? true })`               | `grep -rn "translateToCardMod" src --include=*.ts --include=*.tsx` → 3 hits: the import, the declaration at `cardModTranslator.ts:104`, and this one call |
| 4   | `src/services/cardModTranslator.ts:108`           | `const cardModAvailable = options.cardModAvailable ?? true;`                                         | (as F1)                                                                                                                                                   |

**Evaluated, not paraphrased.** At hop 1 the literal has no
`cardModAvailable` property, so `options.cardModAvailable` is `undefined`. At
hop 3, `undefined ?? true` evaluates to `true`, and `cardModAvailable: true` is
passed on. At hop 4, `true ?? true` evaluates to `true`. At
`cardModTranslator.ts:181`, `!cardModAvailable` is therefore `!true` = `false`,
and the strip-and-warn branch is not entered — on every production path in §F4.

The path is exercised by unit tests
(`grep -rl "cardModAvailable" tests/` → `tests/unit/yaml-conversion-service.spec.ts`,
which passes the option directly), so it is dead **from the production entry
points**, not dead in the suite. This is the shape reviewer finding **N2**
named (`drawer_havdm_testing_ad358a7d31912bba2419205d`;
`drawer_havdm_decisions_6e8d4788d9513ccce593c378` item 9).

### F4 — The production call sites: five, and they are not all the same kind

⚠ **Issue #159's "Code anchors" section says three export call sites in
`App.tsx`. That is wrong, and it was wrong when written** — not merely stale.
Measured at the commit the Issue names:
`git grep -n "sanitizeForHA\b\|serializeForHA\b\|sanitizeForHAWithReport\b" eb5c918 -- src/App.tsx src/components/HADashboardIframe.tsx`
returns four lines in `App.tsx` and one in `HADashboardIframe.tsx` — the same
five as today. The population on this brief's base:

```
grep -rn "sanitizeForHA\b\|serializeForHA\b\|sanitizeForHAWithReport\b" src --include=*.ts --include=*.tsx
```

Seven files match the names. **Three of the seven match only in comments**
(`src/services/exportWarningSummary.ts:6`,
`src/services/exportSelfCheck.ts:4`, `src/components/DeployDialog.tsx:23`), and
a fourth (`src/services/yamlConversionService.ts:226`, `:1142`, `:1153`) matches
only in comments as well. `src/services/yamlService.ts` is the definition site.

**The five actual call sites, and what each one is — traced by hand by reading
the enclosing function and following what it hands to Home Assistant:**

| #   | `path:line`                                | Enclosing function                     | What reaches Home Assistant                                                                                                                                                                                                                                                                      |
| --- | ------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `src/App.tsx:426`                          | the `deployReport` `useMemo`           | **Config bytes.** Feeds `<DeployDialog dashboardConfig={deployReport?.config} warnings={deployReport?.warnings}>` (`App.tsx:3515`, `:3517`); `DeployDialog.tsx:173-176` builds the deploy object from it (title taken from the form) and `:183-185` sends it to HA via `haWsSaveDashboardConfig` |
| 2   | `src/App.tsx:748`                          | `handleExportForHA`                    | **File bytes.** `serializeForHA(config)` → `fileService.saveFileAs(...)` — the user's exported YAML file                                                                                                                                                                                         |
| 3   | `src/App.tsx:2481`                         | `handleEnterLivePreview`               | **Config bytes.** `haWsCreateTempDashboard(sanitizeForHA(config))` — writes the temp dashboard into HA                                                                                                                                                                                           |
| 4   | `src/App.tsx:2580`                         | `handleDeployFromLivePreview`          | **Words only.** `sanitizeForHAWithReport(config)` is called for `warnings` alone; the deploy at `:2625` sends `haWsDeployDashboard(tempDashboardPath, target.urlPath)` — the bytes are the temp dashboard's, written by #3 and #5                                                                |
| 5   | `src/components/HADashboardIframe.tsx:197` | the live-preview layout-change handler | **Config bytes.** `haWsUpdateTempDashboard(tempDashboardPath, {...sanitized, title})` — rewrites the temp dashboard on every drag                                                                                                                                                                |

⭐ **The distinction the spec needs.** Sites 1, 2, 3 and 5 decide what Home
Assistant _receives_. Site 4 decides only what the user is _told_ before
confirming. A capability object threaded at site 4 alone would produce a
correct warning over content that was never stripped; threading at 3 and 5 but
not 4 would strip correctly and describe it wrongly. Both halves of the
live-preview path are the same user journey.

### F5 — The profile carries a card-mod fact and no layout-card fact

`src/services/capability/capabilityProfile.ts:24-39` declares
`CapabilityProfile` with seven fields, including:

- `:26` `haVersion: string | null` — "`null` = never connected (permissive signal)"
- `:28` `capturedAt: string | null` — "`null` = never captured"
- `:32` `installedFolders: string[]` — the `/hacsfiles/<folder>/` segments present
- `:36` `cardModPresent: boolean` — "load-bearing for the export TRANSLATE path"

There is **no layout-card field**:
`grep -rn "layoutCardPresent\|layoutCardAvailable" src --include=*.ts --include=*.tsx`
returns nothing.

**This is a FACT. Whether F9a adds one, and where its value comes from, is a
DECISION for the spec** (§6, D-2) — bounded by the owner's answer to §9.2.

Two measurements that bear on that decision:

- `cardModPresent` is derived by a folder-name check:
  `src/services/capability/capabilityResolver.ts:79` —
  `cardModPresent: installedFolders.has(CARD_MOD_FOLDER)`, where
  `src/services/capability/resourceElementMap.ts:37` sets
  `CARD_MOD_FOLDER = 'lovelace-card-mod'`.
- `installedFolders` is populated **generically**
  (`capabilityResolver.ts:56-60`): every `/hacsfiles/<folder>/` segment found in
  the resource list is added, whether or not the folder appears in
  `RESOURCE_ELEMENT_MAP`. So an installed layout-card's folder is already in
  every captured profile, and a layout-card fact is derivable from data HAVDM
  **already persists** — no re-capture, no profile migration. ⚠ But there is no
  layout-card constant to derive it with: `grep -n "layout" src/services/capability/resourceElementMap.ts`
  returns nothing. Naming the folder, and evidencing that name, is the spec's
  work, not an assumption it may inherit from this brief.

### F6 — ⚠⚠ THE TRAP: reading `cardModPresent` alone breaks the never-connected rule

`src/services/capability/capabilityProfile.ts:46-56` —
`defaultCapabilityProfile()` returns `haVersion: null` **and**
`cardModPresent: false`.

`src/contexts/CapabilityProfileContext.tsx:79` —
`useCapabilityProfile()` returns
`useContext(CapabilityProfileContext)?.profile ?? defaultCapabilityProfile()`
(deliberately null-tolerant, unlike `useHAEntities` — see that file's header
note and `drawer_havdm_testing_ad358a7d31912bba2419205d`).

**Evaluated:** for a user who has never connected, `cardModPresent` is
`false`. An export that reads that field on its own would strip the styling and
warn — which is exactly what ruling **R1** and vision answer 5 forbid
(`drawer_havdm_decisions_6e8d4788d9513ccce593c378` R1). **"Card-mod is absent"
and "we have never looked" are different states and the profile stores them in
different fields.** Any design that collapses them is wrong before it is
written.

Related timing fact: `CapabilityProfileContext.tsx:49` seeds the provider's
state with `defaultCapabilityProfile()` and `:62-64` fills it from disk in an
async mount effect, so there is a window at boot in which the context holds the
permissive default rather than the persisted profile.

### F7 — The never-connected signal exists today, but only in the palette

`src/services/capability/cardAvailability.ts:41` —
`if (profile.haVersion === null) return 'available'; // never connected → permissive`
inside `resolveCardState`, the **palette** resolver (priority order documented
at `:19-27`). The export path reads no profile at all (F3), so it has no
equivalent.

### F8 — `haVersion === null` is not a perfect proxy for "never connected"

`src/services/haWebSocketService.ts:157`, inside the `auth_ok` branch —

```
this.haVersion = typeof message.ha_version === 'string' ? message.ha_version : null;
```

So a genuine, successful capture against a real instance can still produce
`haVersion === null` if the `auth_ok` frame carries no string `ha_version`.
Meanwhile `buildCapabilityProfile` (`capabilityProfile.ts:63-77`) always sets
`capturedAt` from its `meta` argument, so `capturedAt === null` occurs only in
the default.

**Two candidate signals exist and they disagree in one measurable case.**
Which one the export uses is a DECISION for the spec (§6, D-3). This brief
does not choose it; it records that choosing it carelessly re-creates F6's
failure for a user who _has_ connected.

### F9 — The persisted profile is real and seedable

`src/services/capabilityProfileService.ts:30-31` — a dedicated `electron-store`
named `ha-capability-profile`; `getProfile()` at `:39` returns the stored
profile or the permissive default. `main.ts:614` exposes it as
`capability:getProfile`, which `CapabilityProfileContext.tsx:52-56` calls on
mount.

⭐ **Consequence for the red-before-green legs:** the persisted profile is
read at app boot, so a test can put the app in "captured, card-mod absent" or
"captured, card-mod present" without a live Home Assistant. ⚠ The boot-read
chain above was traced this session; the on-disk file name follows
`electron-store`'s default for a store named `ha-capability-profile` (no `cwd`
is set at `capabilityProfileService.ts:30-35`), which the spec should confirm
by observation when it writes the seeding leg rather than inherit from here.

### F10 — The export services are React-free; the profile is React-bound

`src/services/yamlService.ts`, `yamlConversionService.ts` and
`cardModTranslator.ts` import no React
(`grep -ln "from 'react'"` over the three returns nothing);
`yamlService.ts:323` exports a module-level singleton `yamlService`. The
profile, by contrast, is reachable in the renderer through
`useCapabilityProfile()`.

All five call sites in F4 sit inside React components, so a hook read is
available at each. **How the object travels from the hook to the service is a
DECISION for the spec** (§6, D-1) — this brief only records that the seam
exists and that the services must stay React-free.

---

## 5. Decisions already made — the spec must respect these

| Ref        | Decision                                                                                                                                                                                                              | Authority                                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **R1**     | Never-connected stays **PERMISSIVE**. After a disconnect, the **persisted profile wins** — availability keeps reflecting the last capture; the card's "permissive again after disconnect" expectation was ruled WRONG | `drawer_havdm_decisions_6e8d4788d9513ccce593c378` R1; vision answer 5 (`drawer_havdm_decisions_d4f0886c7035390d30c1d1a7`) |
| **R3**     | Sections-first view translation — **F9b, not this slice**                                                                                                                                                             | `drawer_havdm_decisions_6e8d4788d9513ccce593c378` R3                                                                      |
| **item 9** | **ONE** capability object carries **both** the card-mod and the layout-card facts — not two parallel parameters                                                                                                       | `drawer_havdm_decisions_6e8d4788d9513ccce593c378` item 9                                                                  |
| **N2**     | The strip-and-warn path is dead from the production entry points and belongs to F9                                                                                                                                    | `drawer_havdm_testing_ad358a7d31912bba2419205d`                                                                           |
| **split**  | F9a is capability threading; F9b is sections-first translation; order F9a → F6 → F10                                                                                                                                  | `drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c`                                                                         |
| **vision** | Translate where possible, honestly mark what cannot be translated. "Never silently destroy user data" is structural                                                                                                   | `drawer_havdm_decisions_d4f0886c7035390d30c1d1a7`; `drawer_havdm_testing_ad358a7d31912bba2419205d`                        |

---

## 6. Decisions the spec is free to make

These are open by design. The brief supplies the facts; the spec decides and
justifies.

- **D-1 — the seam.** How the capability object reaches the React-free export
  services from a React-bound profile (F10), at all five call sites (F4).
- **D-2 — the layout-card field.** ⚠ **Narrowed by the owner's 2026-09-08
  ruling (§9.2, option A): F9a DOES add a layout-card fact to the one
  capability object, and nothing reads it until F9b.** What remains the spec's
  is where that fact's value comes from — F5 measured that the underlying
  folder data is already persisted but that no layout-card folder constant
  exists, so naming it and evidencing that name is the spec's work.
- **D-3 — the never-connected signal.** Which field, or combination, the export
  treats as "we have never looked" (F6, F7, F8).
- **D-4 — the shape of the object crossing the seam.** Whether the export
  receives the whole `CapabilityProfile` or a narrower derived object, subject
  to item 9's "one object for both".
- **D-5 — site 4's treatment.** Whether the warning-only call site
  (`App.tsx:2580`) reads the same object as the byte-producing sites, and how
  the spec keeps the words and the bytes consistent (F4).
- **D-6 — the boot window.** Whether an export attempted before the provider's
  async read completes needs handling, and what it should do (F6).
- **D-7 — coverage.** Which legs are unit, which are e2e, and how the
  red-before-green legs of §8 are realised — including whether the profile is
  seeded on disk (F9) or injected.

---

## 7. The acceptance bar, in the owner's words

From the frozen backlog (`docs/strategy/2026-09-07-product-backlog-seeding.md`
§4, row S01.1) — quoted, not paraphrased:

> The export reads ONE captured capability object for BOTH card-mod and
> layout-card: when card-mod is absent, card-mod-only styling is stripped and
> the existing warning shown; the layout-card flag is honoured the same way;
> never-connected stays permissive.

From the F9a ruling (`drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c`
ruling 1):

> …thread the captured capability profile … into the export path so
> `cardModAvailable` (and the layout-card flag — ONE capability object for
> BOTH, per the remediation order item 9) is read from the profile instead of
> defaulting to installed; when card-mod is absent the strip-and-warn path runs
> and the user sees the warning; never-connected stays permissive.

---

## 8. The red-before-green legs the owner named

From `drawer_havdm_decisions_bdef071e2ead9ed0a5ff8d9c` ruling 3 — "red-before-green
in the same checkout":

1. Export a card-mod-styled card against a profile **WITHOUT** card-mod → the
   warning appears **and** the styling is stripped.
2. Export the same card against a profile **WITH** card-mod → untouched.
3. **Never-connected** → permissive.

Two properties of these legs, from the project's testing record, that the spec
should carry into its own test design:

- Each leg must be shown **RED against today's code first**, in the same
  checkout, before the fix makes it green. A leg that is green before the
  change proves nothing about the change
  (`drawer_havdm_testing_cd71883212b81299c3bbef76`).
- Leg 2 and leg 3 are **control legs**, not repetitions: leg 3 in particular
  pins R1, and F6 shows exactly how a plausible implementation turns it red.
  The F4 (#129) precedent is that "nothing is marked while disconnected" is
  correct behaviour, not a defect
  (`drawer_havdm_testing_ad358a7d31912bba2419205d`).

⚠ These are the owner's named legs, not an acceptance-criteria matrix. Building
the matrix — and deciding whether each byte-producing call site in F4 needs its
own leg — is the spec's job.

---

## 9. The owner's rulings, 2026-09-08

⭐ All four decisions this brief put to the owner were ruled on 2026-09-08, by
multiple choice with a recommendation on each. Each subsection keeps the
options as they were put — the record of what was offered, not only what was
chosen. The owner took the recommended course on **all four**: review the
brief, option A, adopt both header fields, push the branch. On §9.1 the owner
named a specific model — GPT-6 Astra — inside the same §3.6 Sol/Codex seat the
recommendation already pointed at; §9.1 records the author's error in having
offered it as a different vendor.

### 9.1 Should this brief be independently reviewed before Sonnet specs from it?

⭐ **RULED 2026-09-08: YES — reviewed by OpenAI Codex / GPT-6 Astra.**

⚠ **Correction, made the same session and before the review was commissioned.**
This was first recorded here and in the header as a _per-slice override_ of the
§3.6 Sol/Codex seat. That was wrong, and the error was the author's: it offered
Astra to the owner as "a different vendor". Astra is not a different vendor —
it identifies itself as "OpenAI Codex / GPT-6 Astra"
(`docs/reviews/b7-product-backlog-codex-review.md:3`) and its four B7 review
files are named `*-codex-review.md`. **Astra therefore sits INSIDE the §3.6
default seat: there is no override, and nothing to record as one.** The owner
took the recommended course — review the brief — and named the specific model
within that seat.

**What was put to the owner — pros:** it catches a wrong fact here, where it costs one
round, rather than after it has been built into a spec and a review of that
spec — and §4 is where this slice's risk is concentrated (the F6 trap and the
F4 call-site distinction are both new to this brief and neither appears in
Issue #159). **Cons:** one more review round on a small, mostly-measured
artifact, on a slice the pause is already waiting on; the facts are each
re-runnable by the spec's own reviewer.

**Recommendation:** review it. This brief corrects a published anchor (Issue
#159's call-site count) and introduces two facts nothing else in the record
carries; a wrong one propagates into the spec, the implementation and the
implementation review.

### 9.2 Owner Decision Brief — what "the layout-card flag is honoured the same way" obliges F9a to deliver

_(STRAT-D15 six-field form, `docs/governance/OPERATING_AGREEMENT.md` §4)_

**What this protects, in product terms.** That when HAVDM sends a dashboard to
Home Assistant, it tells the truth about what will actually render — for both
of the add-ons it silently assumes.

**What is going wrong, plainly.** The approved story says one capability object
covers card-mod **and** layout-card. Card-mod has code waiting for that object
today. Layout-card does not: the rule that would use a layout-card fact — only
emit `custom:grid-layout` when layout-card is installed — is ruling R3, which
the owner deliberately split out as F9b. So the sentence can be read two ways
and they cost different amounts.

**Is the product affected? — Unknown, and honestly so.** Nobody has measured
how many users have layout-card installed. What is measured: HAVDM's only
current hedge for layout-card is an unconditional sentence at edit time
(`src/components/ViewSettingsDialog.tsx:177`, warning that HA "needs the
layout-card custom card installed"), shown whether or not it is installed. That
is a weaker hedge than card-mod's, and it is shown at a different moment from
the export.

**Options.**

| Option                                                                                                                     | What it costs                                                                         | What it leaves undone                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **A — Carry the fact, don't consume it.** F9a's one object carries a layout-card fact; nothing reads it until F9b          | Smallest. One extra field, derived from data already stored (F5); no new capture      | No user-visible layout-card change in F9a; the field is unconsumed code until F9b lands                                |
| **B — Card-mod only.** F9a threads the object with the card-mod fact alone; F9b adds the layout-card fact when it needs it | Smallest of all                                                                       | Departs from the approved S01.1 wording and from item 9's "one object for both" — needs the owner to say so explicitly |
| **C — Carry and consume it.** F9a also makes a layout-card decision visible to the user                                    | Largest. Deciding _what_ to do when layout-card is absent **is** R3 — F9b's substance | Nothing — but it re-merges the split the owner made on 2026-09-07                                                      |

⭐ **RULED 2026-09-08: OPTION A — carry the layout-card fact, do not consume
it.** As recommended.

**Recommendation: A.** It honours item 9's "ONE capability object for BOTH"
literally, keeps the F9a/F9b split intact, and the cost is genuinely small
because F5 measured that the underlying data is already persisted. B saves
almost nothing and requires overriding an approved story line. C undoes the
split.

**If you do nothing.** Sonnet has to choose between A, B and C while writing
the spec, and whichever it picks, the choice arrives at your sign-off gate
buried in a design section instead of being put to you here.

### 9.3 Owner Decision Brief — the cheapest acceptable outcome and the cost stop-rule

_(Required in both lanes by STRAT-D6; `docs/templates/FEATURE_SPEC.md` header)_

**What this protects, in product terms.** That the first product PR under the
pause finishes, rather than growing until it becomes the reason the pause never
lifts.

**What is going wrong, plainly.** Nothing yet — these two header fields simply
have no answer in the record. No drawer, ruling or backlog row sets a cheapest
outcome or a spend limit for F9a, so this brief cannot derive them; it can only
propose them.

**Is the product affected? — No.** These govern process depth, not behaviour.

**Options and the proposal.**

- **Cheapest acceptable outcome — PROPOSED:** _the card-mod decision is read
  from the captured profile at every export path that sends bytes to Home
  Assistant or to a file, the existing warning is shown when card-mod is
  absent, and a never-connected user is unaffected._ That is the whole of the
  truthfulness failure in §1. Anything beyond it — the layout-card field per
  §9.2 option A, the boot-window handling in D-6, site 4's word/byte
  consistency in D-5 — is worth doing but is not what makes the story
  acceptable. The alternative, narrower reading — "the file export path only"
  — would leave deploy and live preview lying. ⓘ No usage data exists on which
  path users prefer; what the record does say is that `App.tsx:2568-2574`
  documents the deploy-from-live-preview path as the one a user reaches by
  downloading a dashboard from Home Assistant and editing it, and that this
  path had previously lost the adjustment summary altogether.
- **Cost stop-rule — PROPOSED:** _if the spec, its review, or the
  implementation reaches a point where making this work requires changing how
  the export services are constructed — a new provider, a module-level global,
  or threading a parameter through code that is not on the five call sites'
  path — work halts and re-asks._ That is the shape this slice could quietly
  become large in (D-1), and the spec-before-code ruling exists because a
  previous slice did exactly that (`drawer_havdm_decisions_bc47e8270caa139d3ee11646`).

⭐ **RULED 2026-09-08: BOTH ADOPTED AS PROPOSED.** As recommended. They are
now in this brief's header, not proposals — the spec inherits them as written
and is held to them.

**Recommendation:** adopt both as written; they are deliberately conservative
and the spec can be held to them.

**If you do nothing.** The FEATURE_SPEC header carries two blank required
fields into spec review, and Codex will — correctly — raise it as a finding.

---

## 10. Constraints on the work that follows

- **F9b is out of scope.** Sections-first translation, `custom:grid-layout`
  emission rules, lossy-geometry warnings and dead `view_layout` sanitisation
  (R3, N6) are story S01.2 and a separate spec.
- **The governance pause is in force**
  (`drawer_havdm_decisions_89b5f20cc75d3f70a7e0491b`). No new rule, gate,
  checker, template section, ledger or procedure. A non-blocking rule defect
  found along the way goes to the cleanup-sweep board item
  (`PVTI_lAHOBFbZhs4BgtcWzg5r2gQ`) as DEFERRED.
- **`ha.home.local` is READ-ONLY.** `ha-test.home.local` is the writable
  instance (amendment-04; `drawer_havdm_testing_d74a5c9655998faabb981188`).
- **No `src/` change on this branch.** `feature/f9a-brief` is docs-only; the
  implementation lands on its own branch after the owner signs off the spec.
- **This branch needs no Electron suite.** A docs-only branch needs no e2e or
  integration run — stated plainly rather than invented
  (`drawer_havdm_governance_b282610792b253fee5c09b40`, standing rules). The
  gate (`./tools/checks`) still applies and was run: §11.
- **Issue creation and board status moves stay with the owner.** #159 is
  already In Progress (`PVTI_lAHOBFbZhs4BgtcWzg5suB4`), moved by the owner on
  2026-09-08.

---

## 11. Verification of this document

| What                         | Result                                                                                                                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base                         | `main` = `691c8d1` (Merge PR #161), tree clean at branch creation                                                                                                                                           |
| Gate on the base             | `./tools/checks` → `REAL_EXIT=0`, 4/4 steps, eslint **0 errors / 145 warnings**, 1559 unit tests passed across 105 files                                                                                    |
| Gate on this branch          | Re-run after `prettier --write` on the tree containing this file: `REAL_EXIT=0`, 4/4 steps, **0 errors / 145 warnings**, 1559 passed / 105 files — unchanged from the base, as a docs-only branch should be |
| Owner rulings                | The four §9 rulings were made on 2026-09-08 AFTER commit `0bfeb6c` and applied in a second commit; §9 keeps the options as they were put, not only the outcomes                                             |
| Every §4 fact                | Measured on `691c8d1` on 2026-09-08 with the command printed beside it                                                                                                                                      |
| Every drawer ID and board ID | Read back from a tool result, never typed from memory                                                                                                                                                       |
| Not established here         | No runtime behaviour was executed. §F3 and §F4 are **hand traces** over source, labelled as such; they are not evidence that any test currently exercises these paths                                       |
