# UAT Test Summary Report — v1.0.0-r2: First stable release — round 2 (full re-run)

**Generated:** 2026-07-31T09:13:41.172Z
**Build under test:** Windows x64 packaged app — HA Visual Dashboard Maker.exe, rebuilt 2026-07-31 from main = 199c8f6 (all round-1 remediation merged; 16/16 asar markers verified against the round-1 binary)
**Test plan:** `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md`

## Summary

| Total | Pass | Fail | Skip | Untested |
| --- | --- | --- | --- | --- |
| 66 | 48 | 13 | 3 | 2 |

### Defects by severity

| High | Medium | Low | Unrated |
| --- | --- | --- | --- |
| 7 | 5 | 1 | 0 |

## Acceptance check

Against `phase-7-ecosystem-future-growth-amendment-03.md` §3.1 / `UAT_STRATEGY.md` §11:

| Criterion | Result |
| --- | --- |
| Zero open High-severity defects | ❌ 7 open |
| No test left Untested | ❌ 2 untested |
| Every Fail has a severity | ✅ met |
| Mediums fixed or accepted with rationale | ⚠ 5 require written sign-off in the release notes |
| Uncovered failures gain regression tests | ⚠ 1 require new coverage |

## Failed tests

| ID | Name | Type | Severity | Regression? | Screenshot | Observed |
| --- | --- | --- | --- | --- | --- | --- |
| FILE-04 | Open an existing dashboard YAML file from disk | interaction | High | **YES** | no | I opened and new dashboard (C:\dev\homeassistant2\dashboards\uat_dashboard.yaml).  At first the dashboard opened as expected.  However when I created a new button on the canvas the dashboard reverted back to the template dashboard that I had previously created.  Expected behavior would be if there is an existing dashboard open (dirty state) if I try to open or create another dashboard, a "Do you want to save" dialogue should be displayed to allow users to save.  If user answers no, existing dashboard is discarded.  If yes then save or save as process is activated.  In any event, if a new dashboard is created or opened, previous loaded dashboards should not be loaded. |
| CLIP-02 | A pasted card is genuinely independent of its source | gate test | High | no | yes | I changed the name of the copied card and got an alert from Acronis Active Protection.  Affected file is c:\Users\micah\AppData\Roaming\HA Visual Dashboard Maker\config.json.  I 'ignored' the notification |
| CLIP-04 | Multi-select and bulk property edit | gate test | High | no | no | When selecting two cards all properties are shown.  When selecting all three just the last clicked one is shown. |
| PROPS-03 | The entity picker searches and completes real entity ids | gate test | High | no | yes | "light" not found in entity list. |
| VIEWS-05 | Resize a card inside a section | edge case | Medium | **YES** | yes | Could not resize with handle.  Dialogue with sliders appears when clicking on a card |
| THEME-01 | Theme Settings applies a theme and a light/dark mode | gate test | Low | no | no | Light/Dark theme switching doesn't work from Settings \| Appearance but does work using switch on main screen |
| THEME-02 | Save a named theme and load it back | gate test | Medium | no | no | Can't change the values of a theme to be able to save it as something different (i.e. no custom theme creator).  Also, changing the them only changes the background colour behind the canvas. |
| VCS-02 | Designate a repository and read its branch and status | gate test | Medium | **YES** | yes | No ability to change repo once one is already selected (you can only forget) |
| HA-02 | Browse, search and select real entities | gate test | High | **YES** | yes | Filtering not working properly.  Also "X/page" does not work.  When selecting "Integration" and searching for kia only one entity is listed but there are 41 Kia Uvo integration entities. |
| HA-03 | Download an existing dashboard from Home Assistant (read-only) | interaction | High | no | yes | Some cards come up with error.  Spacing and sizes are wrong.  A number of other issues |
| HA-04 | Detect and remap missing entities | gate test | Medium | no | yes | Not enough information to be able to map the missing entities.  It would be helpful have the integration that the entity belongs to so I could find the mapping.  Auto-map doesn't work |
| HA-07 | The Deploy dialog states what was adjusted for Home Assistant | fidelity | High | **YES** | no | Clicking deploy did not provide a summary of what would be done and list adjustments.  It just deployed the dashboard.  When viewing the dashboard in HA |
| HA-08 | Live Preview creates a TEMPORARY dashboard — and Close deletes it | interaction | Medium | **YES** | no | Address for preview is hidden under cards and even when it is not it cannot be copied.  Better option would be when the user clicks "Live Preview" a dialog with the address is shown with the option to copy it to clipboard and instruction on what to do and what the user should see. |

## Failed tests without automated coverage

Each fix **must** add automated coverage — `UAT_STRATEGY.md` §7 regression mandate.

| ID | Name | Type | Severity |
| --- | --- | --- | --- |
| VIEWS-05 | Resize a card inside a section | edge case | Medium |

## Skipped tests

| ID | Name | Reason |
| --- | --- | --- |
| CLIP-05 | A bulk edit is a single undo step, and the form is not stale after it | CLIP-04 failed |
| VCS-03 | Read history and a file diff | No history |
| HA-09 | Deploy to a THROWAWAY dashboard, verify it renders, then delete it | Not done.  Too many issues to be able to build a functioning dashboard (i.e. entity mapping is broken so creating a dashboard without being able to effectively search and select entities is not possible). |

## Untested

⚠ A test with no verdict is not a decision. Mark it Skip with a reason.

| ID | Name |
| --- | --- |
| PROPS-07 | The properties form is not stale after an undo |
| YAML-05 | Insert an entity id at the cursor from the entity browser |

## Passed tests

| ID | Name | Type | Notes |
| --- | --- | --- | --- |
| SHELL-01 | The packaged application launches and presents the welcome screen | interaction | It ran.  But took a while to load. |
| SHELL-02 | The application menu exposes every top-level operation | interaction | In File it has "Exit".  It would be good to have a "Close" option so you can close the dashboard without exiting the application |
| SHELL-03 | Theme toggle switches the interface and survives a restart | edge case | — |
| SHELL-04 | The Settings dialog opens and all three tabs render | gate test | Pass however dropdown is crowding lable |
| FILE-01 | Create a blank dashboard | gate test | — |
| FILE-02 | Create a Sections-view dashboard | gate test | — |
| FILE-03 | Create a dashboard from a template | gate test | — |
| FILE-05 | Save writes the file, clears the dirty marker and leaves a backup | edge case | I opened and new dashboard (C:\dev\homeassistant2\dashboards\uat_dashboard.yaml).  At first the dashboard opened as expected |
| FILE-06 | Save As... writes a new file and it appears in Recent Files | interaction | — |
| CANVAS-01 | The Card Palette lists, categorises and searches the card types | gate test | — |
| CANVAS-02 | Add a Button card and give it an entity | gate test | — |
| CANVAS-03 | Drag a card to a new position and the position sticks | gate test | — |
| CANVAS-04 | Resize a card | edge case | — |
| CANVAS-05 | Selecting a card targets the Properties panel at it | gate test | — |
| CANVAS-06 | Delete a card from the right-click context menu | edge case | — |
| CANVAS-07 | Undo and redo restore in single, predictable steps | gate test | — |
| CLIP-01 | Copy and paste a card | gate test | — |
| CLIP-03 | Cut removes the original and paste re-homes it | gate test | — |
| CLIP-06 | Paste a card into a different view | edge case | — |
| PROPS-01 | Form edits reach the card immediately, without stalling the app | gate test | — |
| PROPS-02 | The Properties panel YAML tab shows and round-trips the card | gate test | — |
| PROPS-04 | Configure a tap action | gate test | — |
| PROPS-05 | Build a conditional-visibility rule and see it previewed | gate test | — |
| PROPS-06 | Card spacing and layout gap controls | gate test | — |
| VIEWS-01 | Add a view | gate test | — |
| VIEWS-02 | Edit a view's title, path and icon — and re-opening shows current values | gate test | — |
| VIEWS-03 | Change a view's type, and see the warning before it happens | gate test | — |
| VIEWS-04 | Author a sections view — add, rename, reorder, delete | gate test | — |
| VIEWS-06 | Convert an ordinary view into a sections view, and be told what was not carried over | fidelity | — |
| VIEWS-07 | Mark a view as a subview with a back path | gate test | — |
| VIEWS-08 | The layout-card grid editor accepts raw CSS grid values verbatim | gate test | — |
| YAML-01 | The Edit YAML dialog opens with the current dashboard | gate test | — |
| YAML-02 | Invalid YAML is flagged and cannot be applied | gate test | — |
| YAML-03 | Apply &amp; Reload Canvas updates the dashboard | gate test | — |
| YAML-04 | Split view keeps canvas and YAML in step | edge case | — |
| EXPORT-01 | Export for Home Assistant writes a YAML file | interaction | — |
| EXPORT-02 | HAVDM-internal keys do not reach the exported YAML | fidelity | — |
| EXPORT-03 | A canvas-only card becomes a "Card Not Available" placeholder on export | fidelity | — |
| EXPORT-04 | The palette marks unavailable cards honestly, and still lets you author them | fidelity | Has "Unavailable" marking |
| EXPORT-05 | Layout-card view keys survive the export | fidelity | — |
| EXPORT-06 | A full round-trip loses nothing, and a second round-trip is stable | fidelity | — |
| THEME-03 | Per-view theme override | gate test | — |
| THEME-04 | Browse, preview and import a preset | gate test | — |
| VCS-01 | The Version Control dialog opens and explains itself | gate test | — |
| VCS-04 | The panel offers no way to write, and can forget the repository | edge case | — |
| HA-01 | Connect to Home Assistant | interaction | — |
| HA-05 | Card availability reflects what is actually installed on the instance | fidelity | — |
| HA-06 | Themes are fetched from the instance | gate test | — |
