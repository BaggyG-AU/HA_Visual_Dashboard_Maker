# Fable's analysis session: what the saved log establishes

**Status:** evidence correction and proposed refinements for joint assessment. No operating rule, trial or board change is adopted here.

**Conclusion for the owner:** your example was correctly identified: this was Fable's own loop-analysis session. It contains preventable mistakes and repeated corrective work. However, it does **not** establish that repairs caused most of the context consumption, or that all self-correction was wasted. The larger picture includes extensive source loading, a long draft, retrieval and editing failures, and self-review that missed an important unsupported conclusion.

## What can be reconstructed

The [supplied local session log][session] explicitly identifies Fable 5.1 at line 6. Its assistant events consistently record `claude-fable-5-1`. It contains tool inputs, results, the original draft, subsequent edits, timestamps and usage metadata. One Git commit does not make that observable workflow unreconstructable.

Fable's [exchange 3](/home/micah/projects/HA_Visual_Dashboard_Maker/prompts/codex/f9a-loop-analysis-fable-reply-exchange3.md) substituted an Opus brief-repair episode and called its own internal loop “unreconstructable.” The Opus example did not answer your question about Fable. The defensible limitation was that Git history alone could not reconstruct its session, and the transcript had not been assessed in that reply. A saved file being available is different from its contents having been read into a session.

**My correction:** I accepted that evidence gap too readily in [my exchange-3 response](2026-09-10-review-loop-exchange3-codex-response.md). This audit supersedes that response's statement about unavailable Fable-session evidence. Exact causes inside the model and a per-mistake token bill remain unknown. I have not inspected the later session that produced exchange 3, so cannot establish what it searched before replying.

## Where the context grew

These are recorded **input-context tokens at selected model requests**, calculated as input tokens plus cache creation and cache read tokens. They are snapshots, not amounts to add together.

| Checkpoint                                                       | JSONL line | Input-context tokens |
| ---------------------------------------------------------------- | ---------: | -------------------: |
| First request                                                    |         24 |               46,584 |
| Request that produced the initial draft                          |        261 |              434,649 |
| First request after the draft was written                        |        276 |              465,419 |
| Request producing the original delivery response                 |        391 |              547,199 |
| Last request in the supplied log, after comparisons and handover |        516 |              609,538 |

About **84% of the original analysis's input-context growth** had occurred by the first request after drafting, before the visible post-draft correction phase. This does not make that earlier work efficient: it includes earlier mistakes, source material and generated work. It does show why “fixes consumed the context” is an incomplete explanation.

The largest adjacent increase in this log was 145,624 tokens, between requests beginning at lines 108 and 152. The intervening tool batch loaded reviews, dispositions and governance material. The initial draft alone was about 9,200 words. Later, rereading the entire formatted draft returned about 68,000 characters (lines 320–321). These are substantial costs even when the actions succeed.

The full log records 36 distinct assistant message IDs and 97 tool calls. Deduplicating repeated usage by message ID gives 130,584 output tokens through the original delivery, and 162,596 through the final handover. Output includes generated reasoning and tool arguments as well as user-facing text. It is not all report text or all waste. The log does not establish the UI's context-capacity denominator, an exact correspondence with your 60% observation, or monetary cost.

## Concrete preventable work

| Observed episode          | Evidence in the supplied JSONL                                                                                                                                                                                                                                                                                     | Assessment                                                                                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Oversized practice index  | Initial retrieval at line 50 persisted a 79,103-character response. Reads at 83 and 138 exceeded the token limit. Three further reads returned chunk metadata. Fable eventually extracted a 66,588-character content field and read its two parts. Relevant calls: 50, 83, 138, 140, 142, 144, 154, 156, 200, 202. | Both the size of the mandatory index and the retrieval approach contributed. Reducing line counts did not split the large JSON value. An index intended to direct selective reading had itself become substantial reading. |
| Wrong working directory   | Line 154 changed into a scratch directory. Commands at 158 and 160 then failed to find repository files or Git state. Line 162 restored the repository directory; reads were reissued at 204 and 206.                                                                                                              | Preventable execution error with observable retries. Repository commands need an explicit working directory.                                                                                                               |
| Fragile correction script | After formatting at 291, an exact-text replacement at 302 failed because the expected table padding no longer matched. Result 303 contains the assertion failure. The batch was reapplied with padding-safe matches at 314.                                                                                        | A repair operation itself created avoidable rework. The failed Python batch did not write its intended changes; a later successful command masked its failure in the overall tool status.                                  |

There were useful corrections too. Edits narrowed unsupported universals, fixed a citation attribution and corrected conflicting descriptions in the draft. A formatter invocation also failed at lines 278–279; the log establishes the failure, but not its underlying cause. Counting every revision or error response as an agent defect would repeat the denominator problem we already rejected.

### The more consequential self-review miss

Fable performed scripted checks, a sweep for universal wording, a full draft read and further edits. Yet it published the inference that roughly 1,800 keyword occurrences versus 21 findings demonstrated approximately a 1% miss rate and rules being mostly followed. The script producing the denominator explicitly counted candidate claim tokens, not independently assessed opportunities to obey a rule (lines 235–241).

The “mostly followed” passage appeared in Fable's own sweep output at line 296 and survived into its delivery at line 392. Fable withdrew those measurements after Codex's comparison, in the reply recorded at line 470. Self-review therefore happened; it did not adequately test this important inference. More polishing alone would not address that failure.

## Costs we should not blame on Fable alone

The commissioning prompt required extensive historical and rules reading, verification of inherited claims, and detailed option briefs. That helps explain the workload; this audit does not prove each requirement was necessary or unnecessary.

At lines 252–258, the branch helper refused to proceed because **my uncommitted analysis** occupied the shared checkout. Coordination cost was shared. Separate worktrees address that collision; my subsequent review work is already isolated.

The memory writer refused Fable's write because another session held its lease (334–339). Fable used the fallback rather than repeatedly retrying. The log also shows one full repository gate invocation, not an escalating sequence of full test runs. These are not evidence of an uncontrolled testing spiral.

## What this changes in the proposed trial

Keep the agreed DoD, acceptance contract, independent review, repair regression pass and owner assessment. Extend the focus beyond external review rounds:

1. **Reduce the cost of obtaining context.** Propose a concise rules index, with detail in its authoritative drawers. Use structured extraction and bounded excerpts for large results, and staged reading for optional history. Existing mandatory sources still apply until any change is jointly reviewed and adopted.
2. **Make execution reliable.** Use separate worktrees, explicit working directories, edits resilient to formatting, and commands that report prerequisite failures. These directly address observed retries; they do not need another report template.
3. **Check decisive reasoning before expanding the report.** For an important rate or causal conclusion, establish what its evidence measures before writing recommendations around it. Retain useful self-review and regression checks, with recurrence surfaced under the proposed bounded review process.
4. **Measure internal work lightly.** Alongside external rounds, retain available context snapshots and note internal correction cycles in the existing trial close-out. Distinguish reading, drafting, necessary validation and avoidable rework. Do not require an exact token allocation to each mistake or treat tool-error counts as an error rate.

These are proposed refinements for Fable and the owner, not extra acceptance gates. This single session cannot establish what is normal across Fable or Opus. It does establish concrete work we can improve without demanding perfection from either agent.

## Verification and reproduction

Source: the local JSONL linked above; 520 lines, 3,475,318 bytes; SHA-256 `17e57faae1dc259f782221574cb2b730fa1ddf9950e5d9fabcb45a7cc317f871`. Line references address that snapshot. The original Fable report is preserved at commit `28aaad5`; its corrections and the Codex comparisons remain historical records.

I examined tool inputs/results and public responses, and checked aggregate usage without reproducing private reasoning text. No commands from the transcript were executed. No product behavior, other session logs or full regression suite was tested. The following read-only Python reproduces the context checkpoints and deduplicated output totals; use it on the source file, not as a new project gate.

```python
import hashlib
import json
from pathlib import Path

p = Path("/home/micah/.claude/projects/-home-micah-projects-HA-Visual-Dashboard-Maker/57b01b33-c04c-4611-b19c-c559b1b94a8f.jsonl")
raw = p.read_bytes()
print(len(raw), len(raw.splitlines()), hashlib.sha256(raw).hexdigest())
messages = {}
for line, record in enumerate(raw.splitlines(), 1):
    event = json.loads(record)
    if event.get("type") != "assistant":
        continue
    message = event["message"]
    assert message["model"] == "claude-fable-5-1"
    usage = message["usage"]
    values = tuple(usage.get(k, 0) for k in (
        "input_tokens", "cache_creation_input_tokens",
        "cache_read_input_tokens", "output_tokens",
    ))
    if message["id"] in messages:
        assert messages[message["id"]][1] == values
    else:
        messages[message["id"]] = (line, values)
print("distinct assistant messages", len(messages))
for line, values in messages.values():
    if line in (24, 261, 276, 391, 516):
        print("input-context checkpoint", line, sum(values[:3]))
for boundary in (391, 520):
    print("output through", boundary, sum(
        values[3] for line, values in messages.values() if line <= boundary
    ))
```

## MemPalace drawer candidates

The supplied Fable analysis-session JSONL reconstructs observable internal work and usage, qualifying the evidence-gap statement in `drawer_havdm_review_ae8fbccef7140ada467ac5eb`. It confirms avoidable retrieval, working-directory and editing rework; most original-analysis context growth preceded the post-draft correction phase. Exact wasted tokens and model-internal causes remain unknown. Joint trial adoption is still pending; this audit proposes no adopted mechanism.

[session]: /home/micah/.claude/projects/-home-micah-projects-HA-Visual-Dashboard-Maker/57b01b33-c04c-4611-b19c-c559b1b94a8f.jsonl
