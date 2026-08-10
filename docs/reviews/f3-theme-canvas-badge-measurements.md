# Measurement evidence — F3 / HA-06 interim badge

**Author:** Claude Opus 5
**Reviewer:** Codex (see `f3-theme-canvas-badge-codex-review.md`)
**Owner gate:** the owner merges; this document decides nothing.

**Why this file exists.** Two measurements on this slice changed a conclusion,
and both were originally read off a terminal rather than written down. Both are
**structurally destructive** — one requires checking out a base tree that is then
restored, the other a probe that is then deleted — so once the procedure
finishes, there is nothing left to re-read. A measurement like that decays into
the author's testimony the moment it completes, which is exactly what the
project's standing test rejects: a claim handed over without command output
beside it is unverified.

Both were therefore **re-run with output redirected here**. The runs below are
fresh, not transcriptions of the earlier ones, and each reproduced its earlier
result exactly.

---

## 1. `advanced-slider.visual:16` fails on `main`, unrelated to this slice

Method: `git checkout 6bf5f62 -- src/` plus removal of this branch's new
component, so `src/` is byte-identical to `main`; then the single spec, headless,
`--workers=1`. Tree restored afterwards and `git status --porcelain` confirmed
empty.

```
### base tree identity check
$ git diff --stat 6bf5f62 -- src/
(empty = src byte-identical to main = 6bf5f62)

### run
    Error: expect(page).toHaveScreenshot(expected) failed
      Expected an image 586px by 882px, received 586px by 818px.
      Snapshot: advanced-slider-vertical-no-markers.png
      - Expected an image 586px by 882px, received 586px by 818px.
      - Expected an image 586px by 882px, received 586px by 818px.
    test-results/artifacts/e2e-advanced-slider.visual-52858-ntation-and-marker-variants-electron-e2e/test-failed-1.png
    test-results/artifacts/e2e-advanced-slider.visual-52858-ntation-and-marker-variants-electron-e2e/test-failed-2.png
  1 failed
```

**Reading.** The failure is a pure dimension mismatch and is identical to the one
this branch's full e2e run produced. The committed baselines are
`advanced-slider-vertical-no-markers` = 586x882 and
`advanced-slider-horizontal-markers` = 586x818; the vertical variant now renders
at the horizontal's height. The last commit touching that snapshot is `159c6f4`
("rebaseline the vertical advanced-slider snapshot"), and
`git merge-base --is-ancestor 159c6f4 origin/main` passes — so the rebaseline IS
on `main` and the spec has regressed since.

⚠ **Consequence for the suite baseline.** The drawer that records the e2e
baseline calls this spec _retired_ after PR #128. That is now false: the expected
e2e failure count is **seven**, not six. **Not rebaselined here** — never
blind-rebaseline; that needs an explained cause and the owner's authorisation,
and the cause lives on `main`, not on this branch.

---

## 2. `Material You` resolves its `var()` chain and genuinely paints

Method: a throwaway probe applied the captured real themes through the app's own
`__testThemeApi`, selected each theme, and read `getComputedStyle` on
`[data-testid="canvas-surface"]`. Probe deleted afterwards; tree confirmed clean.

```
W1[no-theme-selected] {"background":"rgb(20, 20, 20)","color":"rgba(255, 255, 255, 0.85)","inlineBg":"rgb(20, 20, 20)","varTarget":""}
W1[Material-You] {"background":"rgb(238, 237, 244)","color":"rgb(26, 27, 33)","inlineBg":"var(--md-sys-color-surface-container)","varTarget":"#eeedf4"}
W1[Mushroom] {"background":"rgb(20, 20, 20)","color":"rgba(255, 255, 255, 0.85)","inlineBg":"rgb(20, 20, 20)","varTarget":""}
  1 passed (2.9m)
```

**Reading.**

| Selected theme | canvas `background`              | `--md-sys-color-surface-container` |
| -------------- | -------------------------------- | ---------------------------------- |
| _(none)_       | `rgb(20, 20, 20)`                | _(unset)_                          |
| `Material You` | `rgb(238, 237, 244)` = `#eeedf4` | `#eeedf4`                          |
| `Mushroom`     | `rgb(20, 20, 20)`                | _(unset)_                          |

`Material You`'s inline background stays the literal string
`var(--md-sys-color-surface-container)`, and the computed value resolves to
`#eeedf4` — the hex fallback carried by that variable's own definition. **So it
paints, and excluding it from the badge is correct.** `Mushroom` leaves the
canvas at `rgb(20, 20, 20)`, byte-identical to the no-theme-selected row, which
is precisely what the badge asserts.

⚠ **The limit this measurement exposed.** `Material You` paints only because its
chain bottoms out in a literal. A theme whose chain does **not** would hand
`getThemeColors` a truthy string that paints nothing — escaping the badge while
having no visible effect. `definesNoCanvasColors` is a pure function over the
theme object and cannot see this; closing it needs computed styles, i.e. the
canvas fidelity contract's mechanism. Pinned as the `KNOWN-OPEN:` leg in
`tests/unit/themeBadge.spec.ts`.

⚠ **Evidence boundary.** One renderer (Electron/Chromium under Xvfb), light mode,
on the themes one instance happens to carry. The probe is deliberately not
committed, so nothing pins this behaviour — a future antd or Electron bump could
break the resolution silently. That trade-off is named in the commission for the
reviewer to rule on.
