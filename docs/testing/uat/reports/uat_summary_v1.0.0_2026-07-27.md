# UAT Test Summary Report — v1.0.0: First stable release

**Generated:** 2026-07-27T08:34:02.150Z
**Build under test:** Windows x64 packaged app — HA Visual Dashboard Maker.exe (source tree unchanged since 7c49ae0)
**Test plan:** `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`

## Summary

| Total | Pass | Fail | Skip | Untested |
| --- | --- | --- | --- | --- |
| 66 | 30 | 28 | 8 | 0 |

### Defects by severity

| High | Medium | Low | Unrated |
| --- | --- | --- | --- |
| 22 | 5 | 1 | 0 |

## Acceptance check

Against `phase-7-ecosystem-future-growth-amendment-03.md` §3.1 / `UAT_STRATEGY.md` §11:

| Criterion | Result |
| --- | --- |
| Zero open High-severity defects | ❌ 22 open |
| No test left Untested | ✅ met |
| Every Fail has a severity | ✅ met |
| Mediums fixed or accepted with rationale | ⚠ 5 require written sign-off in the release notes |
| Uncovered failures gain regression tests | ⚠ 6 require new coverage |

## Failed tests

| ID | Name | Type | Severity | Regression? | Screenshot | Observed |
| --- | --- | --- | --- | --- | --- | --- |
| SHELL-03 | Theme toggle switches the interface and survives a restart | edge case | Low | no | yes | CTRL-T switched to "Light Theme" however canvas is still dark and blue areas are unchanged.  Pressing CTRL-T does not switch it back but just keeps saying 'Switched to Light Theme' so it is not toggling.  Need to do a full sweep to ensure dark on dark does not occur - if dark background then must be light text and visa versa. |
| FILE-01 | Create a blank dashboard | gate test | High | no | yes | Some buttons black text on dark background ("greyed out" but unreadable) |
| FILE-02 | Create a Sections-view dashboard | gate test | High | no | yes | Can't find "Sections View".  Do you mean "Convert to Sections Veiw"? |
| FILE-03 | Create a dashboard from a template | gate test | High | no | no | Message displayed saying "Template selection coming soon..." and then just loads a blank template |
| FILE-05 | Save writes the file, clears the dirty marker and leaves a backup | edge case | High | no | no | Save shows message "No dashboard loaded to save" |
| FILE-06 | Save As... writes a new file and it appears in Recent Files | interaction | High | no | no | Save As... shows message "No dashboard loaded to save" |
| CANVAS-04 | Resize a card | edge case | High | no | no | Cannot grab resize handle. |
| CANVAS-06 | Delete a card from the right-click context menu | edge case | Medium | no | no | No right-click context menu display.  Pressing DEL while card is selected deletes the card |
| CANVAS-07 | Undo and redo restore in single, predictable steps | gate test | High | no | no | I deleted a card and then clicked Undo.  The text I typed into the Card Pallet was affected (undone) but the deleted card did to get restored. |
| CLIP-01 | Copy and paste a card | gate test | High | no | yes | I added a Markdown Card.  As soon as I updated the Properties and included "Content" the card on the canvas turned into a Spacer (Empty) card.  I was able to successfully copy the Living Room light card through |
| CLIP-02 | A pasted card is genuinely independent of its source | gate test | High | no | no | Changing the name to "UAT Living Room Light" to the copied card changed it into a spacer.  Same issue as CLIP-1 |
| CLIP-03 | Cut removes the original and paste re-homes it | gate test | High | no | no | Cut does not remove the original card. |
| CLIP-04 | Multi-select and bulk property edit | gate test | High | no | no | Any changes to card turns them into spacers.  In this case, the change only applied to the last card selected.  All other selected cards unchanged |
| PROPS-01 | Form edits reach the card immediately, without stalling the app | gate test | High | no | no | Any change immediately turns card to spacer card.  HOWEVER I have discovered that the change IS reflected in the YAML in the Properties editor.  If I make the change on the form, go into yaml editor, and then back to the form, the card changes from spacer back to the original with the changes applied. |
| PROPS-03 | The entity picker searches and completes real entity ids | gate test | High | no | no | Not connected to HA so no entities available |
| PROPS-04 | Configure a tap action | gate test | High | no | yes | Could only find Smart Default Actions.  No other options available |
| PROPS-05 | Build a conditional-visibility rule and see it previewed | gate test | High | no | no | No conditions option for Button card.  Used Slider Button Card to test, no entities available for test because not connected to HA |
| PROPS-06 | Card spacing and layout gap controls | gate test | High | no | no | Cannot put two cards inside it.  Tried to drag Button card in but card inserted onto the canvas. |
| VIEWS-04 | Author a sections view — add, rename, reorder, delete | gate test | High | no | no | Sections created.  Cards added.  Dragging does not work. |
| VIEWS-06 | Convert an ordinary view into a sections view, and be told what was not carried over | fidelity | Medium | no | no | Silent geometry loss |
| VIEWS-08 | The layout-card grid editor accepts raw CSS grid values verbatim | gate test | Medium | no | no | Nonsense was accepted (no rejected message) |
| YAML-04 | Split view keeps canvas and YAML in step | edge case | High | no | no | Selecting a card does not seem to highlight the correct section in the yaml editor.  Editing yaml is reflected in on the canvas. |
| YAML-05 | Insert an entity id at the cursor from the entity browser | gate test | High | no | yes | Started typing to add an entities section and validation error immediately popped up.  This should be limited somehow so that the validation check is only applied after LF/CR or we replace it with the red underline and a hover or right click to see the error (if possible).  For this test, however, the entity browser did not appear when I added the entity section or when I clicked in an existing entity value. |
| EXPORT-01 | Export for Home Assistant writes a YAML file | interaction | High | no | no | Error: No dashboard loaded to export |
| EXPORT-04 | The palette marks unavailable cards honestly, and still lets you author them | fidelity | Medium | no | no | No cards marked Not Installed |
| HA-03 | Download an existing dashboard from Home Assistant (read-only) | interaction | High | no | yes | Some dashboards will load but others don't |
| HA-04 | Detect and remap missing entities | gate test | High | no | no | Missing entities listed. Auto-map All does nothing.  "No data" mesage in the entity browser ("Select replacement entity") |
| HA-06 | Themes are fetched from the instance | gate test | Medium | no | no | Theme change does not change how things appear on the canvas |

## Failed tests without automated coverage

Each fix **must** add automated coverage — `UAT_STRATEGY.md` §7 regression mandate.

| ID | Name | Type | Severity |
| --- | --- | --- | --- |
| SHELL-03 | Theme toggle switches the interface and survives a restart | edge case | Low |
| FILE-05 | Save writes the file, clears the dirty marker and leaves a backup | edge case | High |
| FILE-06 | Save As... writes a new file and it appears in Recent Files | interaction | High |
| CANVAS-04 | Resize a card | edge case | High |
| CANVAS-06 | Delete a card from the right-click context menu | edge case | Medium |
| YAML-04 | Split view keeps canvas and YAML in step | edge case | High |

## Skipped tests

| ID | Name | Reason |
| --- | --- | --- |
| EXPORT-02 | HAVDM-internal keys do not reach the exported YAML | Can't export |
| EXPORT-03 | A canvas-only card becomes a "Card Not Available" placeholder on export | Can't export |
| EXPORT-05 | Layout-card view keys survive the export | Can't export |
| EXPORT-06 | A full round-trip loses nothing, and a second round-trip is stable | Can't export |
| THEME-01 | Theme Settings applies a theme and a light/dark mode | No themes available (possibly because no connection to HA???) |
| THEME-02 | Save a named theme and load it back | No themes available to change to |
| THEME-03 | Per-view theme override | No alternative themes available |
| THEME-04 | Browse, preview and import a preset | Cannot find "Download" or market place in Theme Manager (or anywhere else). |

## Untested

_None — every test has a verdict._

## Passed tests

| ID | Name | Type | Notes |
| --- | --- | --- | --- |
| SHELL-01 | The packaged application launches and presents the welcome screen | interaction | — |
| SHELL-02 | The application menu exposes every top-level operation | interaction | — |
| SHELL-04 | The Settings dialog opens and all three tabs render | gate test | — |
| FILE-04 | Open an existing dashboard YAML file from disk | interaction | Entity Remapping dialog is displayed (good!) |
| CANVAS-01 | The Card Palette lists, categorises and searches the card types | gate test | — |
| CANVAS-02 | Add a Button card and give it an entity | gate test | Not connected to HA so no entities cached.  Need to update test case sequence to connect to HA first. |
| CANVAS-03 | Drag a card to a new position and the position sticks | gate test | — |
| CANVAS-05 | Selecting a card targets the Properties panel at it | gate test | — |
| CLIP-05 | A bulk edit is a single undo step, and the form is not stale after it | gate test | Undo changed the card that was turned into a spacer back. |
| CLIP-06 | Paste a card into a different view | edge case | — |
| PROPS-02 | The Properties panel YAML tab shows and round-trips the card | gate test | PASS however see PROP-01 notes |
| PROPS-07 | The properties form is not stale after an undo | gate test | — |
| VIEWS-01 | Add a view | gate test | — |
| VIEWS-02 | Edit a view's title, path and icon — and re-opening shows current values | gate test | — |
| VIEWS-03 | Change a view's type, and see the warning before it happens | gate test | — |
| VIEWS-05 | Resize a card inside a section | edge case | — |
| VIEWS-07 | Mark a view as a subview with a back path | gate test | — |
| YAML-01 | The Edit YAML dialog opens with the current dashboard | gate test | — |
| YAML-02 | Invalid YAML is flagged and cannot be applied | gate test | — |
| YAML-03 | Apply &amp; Reload Canvas updates the dashboard | gate test | — |
| VCS-01 | The Version Control dialog opens and explains itself | gate test | — |
| VCS-02 | Designate a repository and read its branch and status | gate test | — |
| VCS-03 | Read history and a file diff | gate test | — |
| VCS-04 | The panel offers no way to write, and can forget the repository | edge case | — |
| HA-01 | Connect to Home Assistant | interaction | — |
| HA-02 | Browse, search and select real entities | gate test | Pass but needs colour update (grey on grey) |
| HA-07 | The Deploy dialog states what was adjusted for Home Assistant | fidelity | — |
| HA-08 | Live Preview creates a TEMPORARY dashboard — and Close deletes it | interaction | — |
| HA-09 | Deploy to a THROWAWAY dashboard, verify it renders, then delete it | interaction | — |
| HA-05 | Card availability reflects what is actually installed on the instance | fidelity | Card that is not install says "Unavailable" |
