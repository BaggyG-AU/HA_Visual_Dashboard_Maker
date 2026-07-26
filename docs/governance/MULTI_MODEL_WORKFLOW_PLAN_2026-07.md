# Multi-Model Workflow Plan — July 2026

> **Purpose:** Decide whether HAVDM development should move from the current
> single-agent (Opus) workflow to an automated Fable → Opus → Sonnet
> orchestration loop, and lay out concrete next steps either way.
>
> **Produced:** 2026-07-26, by Claude Fable 5 acting as technical advisor, after
> a full review of the codebase, git history, all 77 GitHub PRs, the MemPalace
> `havdm` wing, and a structured interview with the project owner.
>
> **Status:** Recommendation awaiting owner ratification.

---

## 1. The verdict

**Do not build an automated multi-model orchestration loop. Keep the
single-agent workflow you have, and fix the three specific things that are
actually costing you time.**

This is not a hedge — the evidence from the review and interview points one
way:

1. **Your bottleneck is not model capability or model speed.** In the
   interview you identified wall-clock time as the only real pain, and located
   it in three places: the 13–49 minute E2E runs, having to stay at the
   keyboard, and flake triage. None of these is improved by adding more
   models. An orchestration loop does not make a 48-minute Playwright run
   shorter; it just adds more machinery _around_ the wait.

2. **The test suite physically cannot host parallel agents.** Playwright is
   configured with `workers: 1` and `fullyParallel: false`
   ([playwright.config.ts](../../playwright.config.ts)) because each E2E test
   launches a real Electron app instance — and the project rule "never build
   while an E2E run is live" exists for the same reason. Two agents working
   two slices at once would collide on the test runner. The main payoff of
   multi-agent setups — parallel throughput — is unavailable here by design.

3. **You already run the valuable part of the loop.** The autonomy agreement
   (MemPalace decision drawer `drawer_havdm_decisions_9e545b5b958d1c1ef33c701c`,
   2026-07-25) means one agent already executes plan → implement → test-to-green
   → commit → push → PR with zero interim asks, gated only by plan sign-off and
   your merge authority. That _is_ an agentic loop — it just has one model in
   it. It has shipped two slices flawlessly (PRs #76, #77). Replacing a proven
   process with an unproven one needs a stronger reason than "it's possible."

4. **When automation misbehaves, the cost lands on you.** You said you're
   uncomfortable debugging broken automation. An orchestration loop adds new
   failure modes that don't exist today: context lost in model-to-model
   handoffs, a subagent stalled with no one watching, hooks firing wrongly,
   two processes fighting over the working tree. Each one would derail a
   session for someone who doesn't enjoy untangling plumbing. Your current
   workflow's failure modes are all ones you already know.

5. **Cost would rise for negative return.** You have "some headroom" on
   usage. A Fable-plans → Opus-codes → Sonnet-tests pipeline roughly doubles
   to triples per-slice token consumption (every handoff re-reads context),
   spending your headroom on coordination overhead rather than output.

**What gets you the value instead:** three small changes, described in §2 and
implemented step-by-step in §4. The first one alone — push notifications —
directly converts "I sit here because I won't know when it's done or stuck"
into "sign off the plan, leave, get pinged." That recovers most of the 1–3
attended hours per slice at near-zero cost and near-zero new machinery.

There _is_ a sensible role for multiple models here — but as **manual
handoffs and one cheap helper**, not an automated loop. That's §2, Tiers 2–3.

---

## 2. What I recommend instead

### Tier 1 — do this week (fixes the actual pain, ~30 minutes setup)

**1a. Phone notifications when the agent finishes or needs you.**
Claude Code supports _hooks_ — small commands the app itself runs when
defined events happen (jargon: a "hook" is a script triggered automatically
by an event, like "agent finished its turn" or "agent is waiting for
permission"). Because the app runs the hook, it fires reliably even when the
model has wandered off-plan — this is not something the model has to remember
to do. Two hooks, each a one-line `curl` to [ntfy.sh](https://ntfy.sh) (a
free push-notification service with a phone app — no account needed):

- **`Stop` hook** — fires when the agent ends its turn → "HAVDM session idle —
  check when convenient." After a walk-away slice this is your "PR is open"
  ping. (It also fires after ordinary chat replies, so expect it to be quiet
  but not silent during interactive work — see step 4 of §4 for keeping it
  useful.)
- **`Notification` hook** — fires when the agent is _waiting_ on you
  (permission prompt, question) → "HAVDM: Claude is BLOCKED waiting for
  input." This is the ping that saves a wasted evening.

**1b. Kill the residual permission prompts.**
Your 354-entry allowlist and `acceptEdits` mode already cover most things
(verified in `.claude/settings.local.json`), but you reported occasional
prompts still landing. The built-in `/fewer-permission-prompts` command scans
recent session transcripts for prompts that actually fired and adds the
missing allowlist entries. Run it after your next couple of slices. Note the
`gh pr merge` "ask" entries are deliberate — never remove those.

**1c. Adopt the walk-away routine.**
With 1a + 1b in place, change your habit, not your tooling: sign off the
plan, instruct the agent to run the slice to an open PR (which the autonomy
agreement already authorizes), and leave. Return on ping, review the PR,
merge. Your attended time per slice becomes plan sign-off + PR review.

### Tier 2 — worth trying within a fortnight (the _sensible_ multi-model moves)

**2a. A Sonnet flake-triage subagent (report-only).**
This is the one place a second model genuinely fits. Flake triage is
mechanical — compare the failed specs against the documented known-failure
baseline ("SUITE TRUTH" in the MemPalace state drawer and
[docs/testing/PLAYWRIGHT_TESTING.md](../testing/PLAYWRIGHT_TESTING.md)) and
apply the written not-a-regression rules. A _subagent_ (jargon: a separate,
smaller agent your main agent can delegate a task to, with its own
instructions and its own — cheaper — model) running Sonnet can do this at a
fraction of Opus cost. **Hard constraint: it reports classifications only.
It never rebaselines snapshots, never edits tests, never decides "not a
regression" on its own — the main agent (and ultimately you) owns that call.**
Misclassifying a real regression as a flake is the one dangerous failure mode
of this whole plan, and report-only contains it.

**2b. Manual planning/review handoffs to Fable — no automation.**
"Fable does the high-level thinking" doesn't need a loop; it needs a habit.
For a gnarly slice (4.7b's canvas row-height fidelity qualifies — it
re-baselines every layout visual snapshot), start the _planning conversation_
with Fable via `/model`, get the plan and its risks, then switch back to Opus
for the sign-off → PR run. Same for an occasional pre-merge review of a risky
diff. The "handoff" is you switching models in the same window — MemPalace and
the repo docs carry the context across, which is exactly what they were built
for. Use it for the hard 20%, not routinely: Fable costs more per token, and
for routine slices Opus's plans have been fine (77 merged PRs say so).

### Tier 3 — only if pain remains after Tiers 1–2 (deliberately deferred)

- **Nightly scheduled full-E2E baseline run** (Claude Code supports scheduled
  cloud/local "routines"): keeps the known-failure list fresh so in-slice
  triage is faster. Adds a scheduled process that can silently break — that's
  why it's deferred, not first.
- **E2E parallelization** (multiple Xvfb displays + isolated Electron
  profiles to allow `workers: 2+`): the only thing that would truly shrink the
  48-minute wall. It is real engineering with real flake risk, and it's a
  _testing-infrastructure_ project, not a workflow change. If E2E time is
  still the top pain in a month, scope it as its own governed slice.

Do **not** start Tier 3 while Tier 1–2 changes are still bedding in.

---

## 3. What a full orchestration loop would involve (so you know what you're declining)

You asked to learn what's actually involved — here is the honest picture.

**The architecture.** "Fable coordinates, Opus codes, Sonnet tests" is, in
Claude Code terms, one of:

1. **Subagents with model overrides** — files in `.claude/agents/`, each with
   a `model:` line in its header. The main session delegates tasks; each
   subagent runs on its assigned model and reports back. This is the
   _supported, low-machinery_ version — Tier 2a above is exactly this pattern,
   used once, where it fits.
2. **Headless pipelines** — shell scripts invoking `claude -p "<task>"`
   (headless = no interactive window) per stage, passing files between stages;
   or the Claude Agent SDK (a programming library for building custom agents)
   if you want real control flow. This is the version people mean by "an
   automated loop," and it's the one I'm advising against: you'd be writing
   and _owning_ orchestration code — retry logic, stall detection, context
   handoff files, cleanup when a stage dies half-way.

**What triggers each handoff.** In version 2, you (or your script) define it:
planner writes `plan.md` → exit code triggers coder with `plan.md` as input →
coder's PR triggers tester → tester's report either loops back to the coder
(with a bounded retry count — unbounded loops burn usage fast) or escalates to
you. Every arrow is a place where context must be serialized into a file and
where a failure can strand the pipeline silently.

**The realistic costs.**

| Cost                       | Why it bites here                                                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 2–3× token usage per slice | Each stage re-reads the repo/docs context the previous stage already had.                                                                |
| New failure modes          | Stalled stages, half-applied handoffs, orphaned worktrees, hook misfires — landing on someone who dislikes debugging automation.         |
| No throughput gain         | `workers: 1` E2E means slices are serial regardless of how many agents exist.                                                            |
| Process erosion risk       | The plan-signoff and never-merge gates are load-bearing; every layer between you and the agent makes them easier to accidentally bypass. |
| Maintenance                | The loop itself becomes a small software project inside your software project.                                                           |

**When it _would_ make sense:** a larger codebase with independent modules
whose test suites can run in parallel, a team (or person) comfortable owning
orchestration plumbing, and a backlog of well-specified independent tasks.
HAVDM may get there — revisit if the project grows a second parallel
workstream with its own test isolation.

---

## 4. Implementation plan (step by step, in order)

Each step ends with a verification. Don't move on until it passes.

### Step 1 — Set up your ntfy notification channel (10 min)

1. On your phone, install the **ntfy** app (Play Store / App Store).
2. In the app, subscribe to a topic with an unguessable name, e.g.
   `havdm-micah-7k3q9` (topics are public — the random suffix is the
   security; anyone who knows the name could send you pings, so don't use
   `havdm`).
3. **Verify:** in a WSL terminal run
   `curl -d "HAVDM notification test" ntfy.sh/havdm-micah-7k3q9`
   (your topic name). Your phone should buzz within seconds.

### Step 2 — Add the two hooks (10 min)

1. Open `.claude/settings.local.json` in the project root (it's gitignored —
   correct place, since the topic name is personal).
2. Add a top-level `"hooks"` key alongside the existing `"permissions"` key
   (ask Claude to do this edit for you if JSON editing feels risky — say
   "add Stop and Notification hooks to my settings.local.json that curl
   ntfy.sh/<your-topic>"):

```json
"hooks": {
  "Notification": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "curl -s -d 'HAVDM: Claude is BLOCKED waiting for your input' ntfy.sh/YOUR-TOPIC-HERE"
        }
      ]
    }
  ],
  "Stop": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "curl -s -d 'HAVDM: Claude finished its turn - session idle' ntfy.sh/YOUR-TOPIC-HERE"
        }
      ]
    }
  ]
}
```

3. Restart the Claude Code session (hooks load at session start).
4. **Verify:** ask Claude anything trivial; when it finishes replying your
   phone should get the "finished its turn" ping. Then trigger a permission
   prompt (e.g. ask it to run a command not on the allowlist) and confirm the
   "BLOCKED" ping arrives.

### Step 3 — Sweep up residual permission prompts (5 min, after your next slice)

1. In a Claude Code session, run `/fewer-permission-prompts`.
2. Review what it proposes before accepting — **it must not touch the two
   `gh pr merge` ask-entries** (they are your merge gate).
3. **Verify:** the next slice runs plan-signoff → PR with zero permission
   pings on your phone.

### Step 4 — First walk-away slice (your next real slice)

1. Have the agent plan the slice as usual; sign off.
2. Say explicitly: "run autonomously to an open PR per the autonomy
   agreement" — then leave the machine on and walk away. (Practical notes:
   the laptop must not sleep, and VS Code stays open. If the Stop pings feel
   noisy during the interactive planning part, that's normal — they only
   matter once you've walked away.)
3. Return when pinged. Expect either "idle" (PR open — review and merge) or
   "BLOCKED" (something needs you — answer it and leave again).
4. **Verify:** measure honestly — did your attended time drop to roughly
   plan-review + PR-review? If you came back to a silently stalled session
   _without_ a ping, that's a notification gap: note what state it was in and
   fix the hook coverage before relying on it again.

### Step 5 — Create the Sonnet flake-triage subagent (20 min, optional)

1. Ask Claude (in-session): _"Create `.claude/agents/flake-triage.md` — a
   report-only subagent, `model: sonnet`, read-only tools. Its job: given a
   completed E2E run, read `test-results/results.json`, compare failures
   against the stable-known and flaky-family lists in the MemPalace state
   drawer and docs/testing/PLAYWRIGHT_TESTING.md, and report each failure as
   KNOWN-STABLE / KNOWN-FLAKY (with the pass-isolated rule to apply) /
   POTENTIAL REGRESSION. It must never edit files, never rebaseline
   snapshots, and must end its report with 'classification only — regression
   calls require main-agent verification'."_
2. Review the generated file — check the `model: sonnet` line and the absence
   of write tools.
3. **Verify:** after the next E2E run with failures, ask the main agent to
   "use the flake-triage agent on the latest results" and check its
   classifications against your own read. Two clean matches = trust it for
   the first pass (never the final call).

### Step 6 — Try one manual Fable planning handoff (when a hard slice comes up)

1. For the next high-risk slice (4.7b's row-height work qualifies), start the
   session with `/model` → Fable, and run only the investigation/planning
   phase. Let it load MemPalace as usual.
2. When the plan is signed off, switch back (`/model` → Opus) in the same
   conversation, or hand over via a fresh session + the session-handover
   prompt skill.
3. **Verify:** judge the plan quality yourself — did Fable surface risks or
   design options Opus-planning typically wouldn't? If not distinguishable,
   don't pay the premium routinely; reserve it for genuinely hard calls.

---

## 5. How to tell if this is working

**Within two weeks you should see:**

- **Attended time per slice drops sharply** — presence needed only for plan
  sign-off and PR review (target: under ~30 attended minutes per slice,
  versus most of a 1–3 hour session today). This is the single number that
  matters; the git history will show it as slices landing on evenings when
  you weren't at the desk.
- **Zero wasted evenings** — no more discovering at 10pm that the session has
  been sitting on a prompt since 8pm. Every stall produces a phone ping
  within seconds.
- **Flake triage stops consuming your attention** (if you did Step 5) — you
  read a one-screen classification instead of spelunking test artifacts.
- **Usage stays flat or drops** — Sonnet triage is cheap, and no
  orchestration overhead was added. If usage _rises_ noticeably, something is
  wrong — investigate before continuing.

**Roll back if:**

- Notifications prove unreliable (missed stalls) or too noisy to keep
  enabled, and one round of tuning doesn't fix it → delete the `hooks` block;
  you are exactly where you started, nothing else depended on it.
- The triage subagent ever classifies a real regression as a known flake →
  demote it to "advisory footnote" or delete the agent file. This is the one
  failure with teeth; report-only scoping means the blast radius is your
  reading time, not the codebase.
- You find yourself building _more_ machinery to support the machinery
  (watchdog scripts, hook-debugging sessions, retry wrappers) → stop and
  re-read §1. The workflow exists to serve slice throughput, not the other
  way round.

**Rollback is cheap by design:** every change here is additive and
independent — two JSON hook entries, one agent markdown file, one habit. None
of them touches source, tests, CI, or the autonomy agreement.

---

## 6. Decision record

| Question                                         | Answer                                                                                                                                                                           |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Automated Fable→Opus→Sonnet loop?                | **No** — no throughput gain possible (serial E2E), wrong fix for the identified pain, new failure modes land on an owner who dislikes debugging automation.                      |
| Keep current Opus + autonomy-agreement workflow? | **Yes** — proven, disciplined, and already agentic where it counts.                                                                                                              |
| Any multi-model adoption?                        | **Yes, two narrow, manual/contained uses:** Sonnet report-only flake triage (subagent); Fable for occasional hard-slice planning and pre-merge review (manual `/model` handoff). |
| Biggest single win                               | Stop/Notification hooks → phone push, enabling the walk-away routine.                                                                                                            |
| Revisit when                                     | E2E parallelization becomes worth its engineering cost, or the project grows parallel workstreams with isolated test surfaces.                                                   |

_Once ratified by the owner, this decision should be filed as a MemPalace
`[DECISION]` drawer in `room="decisions"`, `wing="havdm"`, citing this
document._
