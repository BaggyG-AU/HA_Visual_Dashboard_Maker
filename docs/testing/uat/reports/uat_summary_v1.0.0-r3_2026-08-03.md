# UAT Test Summary Report — v1.0.0-r3: First stable release — round 3 (full re-run)

**Generated:** 2026-08-03T11:26:01.644Z
**Build under test:** Windows x64 packaged app — HA Visual Dashboard Maker.exe, rebuilt 2026-08-03 from main = a3b60b5 (all round-2 remediation merged; 10/10 positive asar markers plus 1 negative marker verified against the round-2 binary)
**Test plan:** `docs/testing/uat/plans/uat_plan_v1.0.0-r3_2026-08-03.md`

## Summary

| Total | Pass | Fail | Skip | Untested |
| --- | --- | --- | --- | --- |
| 66 | 50 | 13 | 2 | 1 |

### Defects by severity

| High | Medium | Low | Unrated |
| --- | --- | --- | --- |
| 11 | 2 | 0 | 0 |

## Acceptance check

Against `phase-7-ecosystem-future-growth-amendment-03.md` §3.1 / `UAT_STRATEGY.md` §11:

| Criterion | Result |
| --- | --- |
| Zero open High-severity defects | ❌ 11 open |
| No test left Untested | ❌ 1 untested |
| Every Fail has a severity | ✅ met |
| Mediums fixed or accepted with rationale | ⚠ 2 require written sign-off in the release notes |
| Uncovered failures gain regression tests | ⚠ 1 require new coverage |

## Failed tests

| ID | Name | Type | Severity | Regression? | Screenshot | Observed |
| --- | --- | --- | --- | --- | --- | --- |
| FILE-06 | Save As... writes a new file and it appears in Recent Files | interaction | Medium | **YES** | no | New file did not appear in Recent Files.  Also, hovering over a recent file does not show the full path in the tool-tip |
| CANVAS-03 | Drag a card to a new position and the position sticks | gate test | High | **YES** | no | Previously passed.  However using c:\dev\homeassistant2\dashboards\uat_dashboard3.yaml I tried to move the Old Button and it snapped back to the original position.  I noticed when trying to figure it out that the YAML editor for that card was not showing.  I pressed escape and made sure only one card was selected.  I have tried to replicate the error but I haven't been able to.  Consider running some automated tests specifically selecting multiple cards, moving cards and trying to stress test it. |
| CLIP-01 | Copy and paste a card | gate test | High | **YES** | no | Right-click on blank canvas does not display context menu |
| PROPS-03 | The entity picker searches and completes real entity ids | gate test | Medium | no | yes | light did not show any results |
| VIEWS-04 | Author a sections view — add, rename, reorder, delete | gate test | High | **YES** | no | Cannot drag cards into any section if the section is empty.  Double-clicking lands a card to the last section if there are multiple sections..  Once the last section has a crard (through double-clicking) then can drag cards across sections.  Needs to be stress tested (automated) |
| EXPORT-04 | The palette marks unavailable cards honestly, and still lets you author them | fidelity | High | **YES** | no | There is no "pallet footer" that I can see.  There is no clear explanation that I can see |
| THEME-01 | Theme Settings applies a theme and a light/dark mode | gate test | High | no | yes | The switch on the main screen changes but the theme is not applied after first switch.  Also note:  HIGH - back text on dark background and light text on light backgrounds still exist.  You need to complete a full deep analysis and ensure dark on dark or light on light text and background on all default teams is fixed |
| THEME-02 | Save a named theme and load it back | gate test | High | no | no | Error message: "No active theme to save" |
| HA-03 | Download an existing dashboard from Home Assistant (read-only) | interaction | High | no | yes | Some cards failed to render.  Some cards cannot be selected.  These should have been detected during e2e and integration testing. |
| HA-04 | Detect and remap missing entities | gate test | High | no | no | 1 Missing entity detected ("input_boolean.toggle") but there is no information provided to allow me to map the correct entity.  Auto map sates "No replacement scored high enough to map... ".  I doesn't appear that any filters are applied either. |
| HA-07 | The Deploy dialog states what was adjusted for Home Assistant | fidelity | High | no | yes | Error during deployment.  Tried to deply C:\dev\homeassistant2\dashboards\dashboard-ha_exported.yaml |
| HA-09 | Deploy to a THROWAWAY dashboard, verify it renders, then delete it | interaction | High | no | no | Does not render properly.  However, it could be because I have not created a proper dashboard.  I want you to create a dashboard yaml with properly configured cards that should render in HA.  I will then use it in HAVDM next round (a known good dashboard to test deployment and live preview functions). |
| HA-06 | Themes are fetched from the instance | gate test | High | **YES** | no | Only some change the canvas colour.  Others make no difference.  You need to fully research how the themes in HA are applied and replicate that in the app. |

## Failed tests without automated coverage

Each fix **must** add automated coverage — `UAT_STRATEGY.md` §7 regression mandate.

| ID | Name | Type | Severity |
| --- | --- | --- | --- |
| FILE-06 | Save As... writes a new file and it appears in Recent Files | interaction | Medium |

## Skipped tests

| ID | Name | Reason |
| --- | --- | --- |
| THEME-03 | Per-view theme override | — |
| VCS-03 | Read history and a file diff | No history or diff to check |

## Untested

⚠ A test with no verdict is not a decision. Mark it Skip with a reason.

| ID | Name |
| --- | --- |
| THEME-04 | Browse, preview and import a preset |

## Passed tests

| ID | Name | Type | Notes |
| --- | --- | --- | --- |
| SHELL-01 | The packaged application launches and presents the welcome screen | interaction | — |
| SHELL-02 | The application menu exposes every top-level operation | interaction | Note:  I mentioned last round that under file we should have a "Close" option so we can close a dashboard and come back to the Welcome screen without exiting the app.  Make a note of it as a new feature. |
| SHELL-03 | Theme toggle switches the interface and survives a restart | edge case | — |
| SHELL-04 | The Settings dialog opens and all three tabs render | gate test | — |
| FILE-01 | Create a blank dashboard | gate test | — |
| FILE-02 | Create a Sections-view dashboard | gate test | — |
| FILE-03 | Create a dashboard from a template | gate test | — |
| FILE-04 | Open an existing dashboard YAML file from disk | interaction | — |
| FILE-05 | Save writes the file, clears the dirty marker and leaves a backup | edge case | — |
| CANVAS-01 | The Card Palette lists, categorises and searches the card types | gate test | — |
| CANVAS-02 | Add a Button card and give it an entity | gate test | — |
| CANVAS-04 | Resize a card | edge case | — |
| CANVAS-05 | Selecting a card targets the Properties panel at it | gate test | — |
| CANVAS-06 | Delete a card from the right-click context menu | edge case | — |
| CANVAS-07 | Undo and redo restore in single, predictable steps | gate test | — |
| CLIP-02 | A pasted card is genuinely independent of its source | gate test | — |
| CLIP-03 | Cut removes the original and paste re-homes it | gate test | — |
| CLIP-04 | Multi-select and bulk property edit | gate test | — |
| CLIP-05 | A bulk edit is a single undo step, and the form is not stale after it | gate test | — |
| CLIP-06 | Paste a card into a different view | edge case | — |
| PROPS-01 | Form edits reach the card immediately, without stalling the app | gate test | — |
| PROPS-02 | The Properties panel YAML tab shows and round-trips the card | gate test | — |
| PROPS-04 | Configure a tap action | gate test | — |
| PROPS-05 | Build a conditional-visibility rule and see it previewed | gate test | — |
| PROPS-06 | Card spacing and layout gap controls | gate test | — |
| PROPS-07 | The properties form is not stale after an undo | gate test | — |
| VIEWS-01 | Add a view | gate test | — |
| VIEWS-02 | Edit a view's title, path and icon — and re-opening shows current values | gate test | — |
| VIEWS-03 | Change a view's type, and see the warning before it happens | gate test | — |
| VIEWS-05 | Resize a card inside a section | edge case | Passed in that I can size with the handles.  However the slides are still there. |
| VIEWS-06 | Convert an ordinary view into a sections view, and be told what was not carried over | fidelity | — |
| VIEWS-07 | Mark a view as a subview with a back path | gate test | Passes.  Need to add a search feature to the yaml editor (make a note of this new new feature request). |
| VIEWS-08 | The layout-card grid editor accepts raw CSS grid values verbatim | gate test | — |
| YAML-01 | The Edit YAML dialog opens with the current dashboard | gate test | — |
| YAML-02 | Invalid YAML is flagged and cannot be applied | gate test | — |
| YAML-03 | Apply &amp; Reload Canvas updates the dashboard | gate test | — |
| YAML-04 | Split view keeps canvas and YAML in step | edge case | — |
| YAML-05 | Insert an entity id at the cursor from the entity browser | gate test | Confirmed all worked.  NOTE that CTRL-Z only works in the yaml editor if the editor is selected (focus).  Need to ensure this is documented |
| EXPORT-01 | Export for Home Assistant writes a YAML file | interaction | — |
| EXPORT-02 | HAVDM-internal keys do not reach the exported YAML | fidelity | — |
| EXPORT-03 | A canvas-only card becomes a "Card Not Available" placeholder on export | fidelity | — |
| EXPORT-05 | Layout-card view keys survive the export | fidelity | — |
| EXPORT-06 | A full round-trip loses nothing, and a second round-trip is stable | fidelity | — |
| VCS-01 | The Version Control dialog opens and explains itself | gate test | — |
| VCS-02 | Designate a repository and read its branch and status | gate test | — |
| VCS-04 | The panel offers no way to write, and can forget the repository | edge case | — |
| HA-01 | Connect to Home Assistant | interaction | — |
| HA-02 | Browse, search and select real entities | gate test | Partial pass.  Typing 'light' provides no results. |
| HA-08 | Live Preview creates a TEMPORARY dashboard — and Close deletes it | interaction | I think it passed.  However require you to check to make sure temp dashboard is deleted. |
| HA-05 | Card availability reflects what is actually installed on the instance | fidelity | — |
