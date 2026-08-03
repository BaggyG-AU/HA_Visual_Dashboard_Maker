#!/usr/bin/env bash
# ============================================================
# GitHub Issues payload — HAVDM UAT v1.0.0-r2 (2026-07-31)
#
# ⚠ REVIEW BEFORE RUNNING. Creating issues is outward-facing and
#   requires the project owner's explicit authorisation.
# ⚠ NOT IDEMPOTENT — search existing issues for the test ID first:
#   https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/issues
# ============================================================
set -euo pipefail

# FILE-04: Open an existing dashboard YAML file from disk
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0-r2] FILE-04: Open an existing dashboard YAML file from disk' \
  --label 'defect,severity:high,regression' \
  --body '## Defect summary
**Test ID:** FILE-04
**Test:** Open an existing dashboard YAML file from disk
**UAT round:** v1.0.0-r2 — 2026-07-31
**Severity:** high
**Regression:** YES — passed in the previous round

## Observed
I opened and new dashboard (C:\dev\homeassistant2\dashboards\uat_dashboard.yaml).  At first the dashboard opened as expected.  However when I created a new button on the canvas the dashboard reverted back to the template dashboard that I had previously created.  Expected behavior would be if there is an existing dashboard open (dirty state) if I try to open or create another dashboard, a "Do you want to save" dialogue should be displayed to allow users to save.  If user answers no, existing dashboard is discarded.  If yes then save or save as process is activated.  In any event, if a new dashboard is created or opened, previous loaded dashboards should not be loaded.

## Expected
- A native OS file dialog opens and accepts .yaml / .yml.
- The dashboard loads; the heading shows its title and the line beneath shows the file path you chose.
- Every view in the file appears as a tab.
- Cards render on the canvas rather than as error tiles.

## Steps to reproduce
1. Choose File &rarr; Open Dashboard... (or press Ctrl+O).
2. In the native file picker, navigate to a dashboard .yaml file and open it.
3. Read the heading and the path line beneath it.
4. Look at the view tabs and the canvas.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/e2e/file-operations.spec.ts covers the keyboard shortcuts and the dirty marker, but explicitly leaves the native file dialog unautomated — opening a real file through the OS picker has no automated coverage at all.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0-r2_2026-07-31.md`'

# CLIP-02: A pasted card is genuinely independent of its source
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0-r2] CLIP-02: A pasted card is genuinely independent of its source' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** CLIP-02
**Test:** A pasted card is genuinely independent of its source
**UAT round:** v1.0.0-r2 — 2026-07-31
**Severity:** high
**Regression:** no

## Observed
I changed the name of the copied card and got an alert from Acronis Active Protection.  Affected file is c:\Users\micah\AppData\Roaming\HA Visual Dashboard Maker\config.json.  I '\''ignored'\'' the notification

## Expected
- The original still shows its own name, unchanged.
- The nested value on the original is unchanged. If editing the copy changed the original, that is silent cross-card corruption — mark Fail and rate it High.
- The YAML shows two independent card entries, not a shared fragment.

## Steps to reproduce
1. Select the pasted copy from CLIP-01.
2. Change its Name to UAT Copy Edited.
3. In the Properties panel, change something nested — a tap action, or a style or colour value.
4. Now select the original card.
5. Read its name and the nested value you just changed on the copy.
6. Click Edit YAML and read both cards'\'' entries.

## Screenshot
Attached in the UAT session JSON.

## Automated coverage
Yes — tests/unit/card-clone.spec.ts proves the clipboard transforms deep-clone nested branches, and carries a characterisation block demonstrating that the previous shallow spread aliased them. It proves the transform in isolation; you are checking the guarantee survives the whole running application — copy, paste, store, form and YAML.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0-r2_2026-07-31.md`'

# CLIP-04: Multi-select and bulk property edit
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0-r2] CLIP-04: Multi-select and bulk property edit' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** CLIP-04
**Test:** Multi-select and bulk property edit
**UAT round:** v1.0.0-r2 — 2026-07-31
**Severity:** high
**Regression:** no

## Observed
When selecting two cards all properties are shown.  When selecting all three just the last clicked one is shown.

## Expected
- All three cards are visibly marked as selected — you can tell at a glance.
- The Properties panel indicates it is editing multiple cards.
- The change applies to all three, not just the last-clicked one.
- Cards that were not selected are untouched.

## Steps to reproduce
1. Click the first card, then Ctrl+Click the second and third.
2. Look at the canvas — how are the selected cards indicated?
3. Read the Properties panel heading.
4. Change one shared property, for example an icon or a colour.
5. Look at all three cards.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/integration/bulk-operations.spec.ts proves a bulk property edit reaches every selected card and preserves undo granularity. It cannot tell you whether the multi-selection is visible — whether you can see what you are about to change.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0-r2_2026-07-31.md`'

# PROPS-03: The entity picker searches and completes real entity ids
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0-r2] PROPS-03: The entity picker searches and completes real entity ids' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** PROPS-03
**Test:** The entity picker searches and completes real entity ids
**UAT round:** v1.0.0-r2 — 2026-07-31
**Severity:** high
**Regression:** no

## Observed
"light" not found in entity list.

## Expected
- Typing filters the suggestions as you go, and the words may be typed in any order — "battery kia" finds "Kia EV6 Battery Level".
- A suggestion can be chosen with the mouse or the keyboard, and the chosen id reaches the card.
- A non-existent id is accepted — HAVDM is permissive when not connected — but is marked or warned about rather than silently treated as valid.
- With no connection and no cached entities, the field is still typable and says plainly that it cannot validate. An empty, un-typable dropdown is a fail — it makes this card'\''s own "works both connected and not" pre-condition impossible to satisfy.

## Steps to reproduce
1. Select a card with an Entity field.
2. Click the field and type light.
3. Read the suggestions offered, and pick one from the list.
4. Clear the field and type a full entity id that does not exist, e.g. sensor.definitely_not_real.
5. Now try it with no Home Assistant connection at all — ideally on a profile that has never connected, so there is no cached entity list either. Type sensor.hand_typed_entity into the field.

## Screenshot
Attached in the UAT session JSON.

## Automated coverage
Yes — tests/unit/EntityPicker.offline.spec.tsx proves source resolution across live, cached and never-connected states, and now proves that with no connection and no cache the field is a real text input that accepts a hand-typed entity id. tests/e2e/entity-picker-sources.spec.ts drives the same through the renderer. This card previously cited entityPickerSource.spec.ts and conceded only that the specs "cannot tell you whether typing into it feels usable" — the real gap was narrower and worse: a sibling spec asserted the "Not Connected" hint APPEARS with an empty cache and passed for the whole life of the defect, because the hint was never the problem. One layer down, that branch rendered an empty Select with no options and no search, so a never-connected user could not enter an id at all. A spec that asserts a message beside a dead end certifies the message and says nothing about the dead end.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0-r2_2026-07-31.md`'

# VIEWS-05: Resize a card inside a section
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0-r2] VIEWS-05: Resize a card inside a section' \
  --label 'defect,severity:medium,regression' \
  --body '## Defect summary
**Test ID:** VIEWS-05
**Test:** Resize a card inside a section
**UAT round:** v1.0.0-r2 — 2026-07-31
**Severity:** medium
**Regression:** YES — passed in the previous round

## Observed
Could not resize with handle.  Dialogue with sliders appears when clicking on a card

## Expected
- Width and height handles are separately discoverable.
- Resizing snaps to the section'\''s column grid rather than to arbitrary pixels.
- Other cards in the section reflow around the resized card.
- Changing Columns wide re-lays-out the section without losing any card.

## Steps to reproduce
1. Hover the right edge of a card inside a section until a width handle appears.
2. Drag it wider, then release.
3. Hover the bottom edge and drag the card taller.
4. Change the section'\''s Columns wide value.

## Screenshot
Attached in the UAT session JSON.

## Automated coverage
**No — a regression test is REQUIRED as part of the fix (UAT_STRATEGY.md §7).**

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0-r2_2026-07-31.md`'

# THEME-01: Theme Settings applies a theme and a light/dark mode
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0-r2] THEME-01: Theme Settings applies a theme and a light/dark mode' \
  --label 'defect,severity:low' \
  --body '## Defect summary
**Test ID:** THEME-01
**Test:** Theme Settings applies a theme and a light/dark mode
**UAT round:** v1.0.0-r2 — 2026-07-31
**Severity:** low
**Regression:** no

## Observed
Light/Dark theme switching doesn'\''t work from Settings | Appearance but does work using switch on main screen

## Expected
- A theme can be chosen and the canvas visibly reflects it.
- Light and Dark are both applied and visibly different.
- Card text stays legible against card backgrounds in both modes.
- Re-opening the dialog shows the theme and mode you selected.

## Steps to reproduce
1. ⭐ No Home Assistant connection is required for this card. Themes are local content and HAVDM ships built-in themes. Connecting to HA adds that instance&rsquo;s themes alongside them; it is never a precondition.
2. Open the Theme Settings dialog — the gear icon in the header, Appearance tab.
3. On the Settings tab, pick a theme from Active Theme.
4. Switch Mode between Light and Dark.
5. Look at the canvas cards as you switch.
6. Close and re-open the dialog.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/e2e/theme-manager.spec.ts covers the import, export, load and per-view override workflows. It cannot judge whether the theme actually looks applied.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0-r2_2026-07-31.md`'

# THEME-02: Save a named theme and load it back
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0-r2] THEME-02: Save a named theme and load it back' \
  --label 'defect,severity:medium' \
  --body '## Defect summary
**Test ID:** THEME-02
**Test:** Save a named theme and load it back
**UAT round:** v1.0.0-r2 — 2026-07-31
**Severity:** medium
**Regression:** no

## Observed
Can'\''t change the values of a theme to be able to save it as something different (i.e. no custom theme creator).  Also, changing the them only changes the background colour behind the canvas.

## Expected
- The saved name appears in the Saved Themes list.
- Loading it restores the appearance you saved.
- Deleting it removes it from the list.
- No confirmation step is missing before a delete that would lose a saved theme.

## Steps to reproduce
1. ⭐ No Home Assistant connection is required for this card. A built-in theme is enough to save, load and delete.
2. On the Manager tab, type UAT Theme into the save-name field and save.
3. Change the active theme to something clearly different.
4. Select UAT Theme in Saved Themes and load it.
5. Look at the canvas.
6. Delete UAT Theme.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/unit/theme-service.spec.ts proves the theme storage and retrieval logic. It cannot tell you whether the manager tab is usable.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0-r2_2026-07-31.md`'

# VCS-02: Designate a repository and read its branch and status
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0-r2] VCS-02: Designate a repository and read its branch and status' \
  --label 'defect,severity:medium,regression' \
  --body '## Defect summary
**Test ID:** VCS-02
**Test:** Designate a repository and read its branch and status
**UAT round:** v1.0.0-r2 — 2026-07-31
**Severity:** medium
**Regression:** YES — passed in the previous round

## Observed
No ability to change repo once one is already selected (you can only forget)

## Expected
- A native folder dialog opens; only a directory can be chosen.
- The panel shows the repository root, the current branch, and the changed files.
- Refresh picks up the change you made outside the app.
- The status is accurate — it matches what the repository actually looks like.

## Steps to reproduce
1. In the Version Control dialog, click the repository-selection control.
2. In the native folder dialog, choose a git repository directory. ⚠ Prefer a repository on a local Windows drive; one under \\wsl.localhost works but is slow.
3. Read the repository path, branch name and working-tree status shown.
4. Make a change to a file in that repository outside HAVDM, then click the refresh control.

## Screenshot
Attached in the UAT session JSON.

## Automated coverage
Yes — tests/integration/version-control.spec.ts proves validation failures return typed errors and never reach git, and that the version-control write surface is empty. It cannot run the native folder picker.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0-r2_2026-07-31.md`'

# HA-02: Browse, search and select real entities
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0-r2] HA-02: Browse, search and select real entities' \
  --label 'defect,severity:high,regression' \
  --body '## Defect summary
**Test ID:** HA-02
**Test:** Browse, search and select real entities
**UAT round:** v1.0.0-r2 — 2026-07-31
**Severity:** high
**Regression:** YES — passed in the previous round

## Observed
Filtering not working properly.  Also "X/page" does not work.  When selecting "Integration" and searching for kia only one entity is listed but there are 41 Kia Uvo integration entities.

## Expected
- Real entities from the instance are listed, with id, friendly name, state and domain.
- The count is plausible for the instance — hundreds, not a handful. ⓘ It is now SMALLER than round 1 because diagnostic and config entities are hidden by default; the “Showing N of M” text must say so rather than leaving the difference unexplained.
- Search narrows the list responsively even with hundreds of rows.
- Words typed in any order still find the entity — battery kia must match "Kia EV6 Battery Level".
- Domain tabs filter correctly and show per-domain counts.
- ⭐ Grouping by Integration produces one tab per integration, named readably (e.g. “Bureau Of Meteorology”, not bureau_of_meteorology) with a count, biggest first — and the sensor haystack is visibly broken up. Selecting an integration tab shows only that integration’s entities.
- ⭐ Ticking “Show diagnostic &amp; config” brings the hidden entities back, and unticking hides them again. A cut you cannot reverse is a FAIL, and so is an entity that disappears without the count admitting it.
- Refresh re-fetches without emptying or duplicating the list.
- ⓘ Entities Home Assistant’s registry does not know about (on a typical instance sun.sun, zone.home, YAML template sensors) must STILL BE LISTED — under “Not in the entity registry” when grouped by integration. Any of them going missing is a fail.

## Steps to reproduce
1. Click Entities in the header.
2. Read the entity count and the domain filter tabs. ⭐ Note the “Showing N of M” text beside the tick-box — on a large instance M is much larger than N.
3. Type light into the search box. Then type two words from a single entity'\''s friendly name in the wrong order — e.g. for "Kia EV6 Battery Level", type battery kia.
4. Switch to a specific domain tab, e.g. sensor.
5. ⭐ NEW: set Group by to Integration. Read the tab strip, then pick one integration’s tab.
6. Select an entity and click the select button.
7. ⭐ NEW: tick Show diagnostic &amp; config, then untick it again.
8. Click the refresh control.

## Screenshot
Attached in the UAT session JSON.

## Automated coverage
Yes — tests/integration/entity-browser.spec.ts covers the browser and its insert path against fixture data, and tests/integration/entity-registry-picker.spec.ts now covers integration grouping, the diagnostic/config cut and its offline persistence. tests/unit/haWebSocketService.registry.spec.ts asserts the config/entity_registry/list frame itself against a payload captured from a real instance. None of them has seen a real instance’s several hundred entities. THIS CARD PASSED IN ROUND 1 AND ITS BEHAVIOUR HAS DELIBERATELY CHANGED TWICE — ONCE BEFORE THIS ROUND AND ONCE AGAIN NOW, and none of it is a regression: (a) the browser prefers the LIVE connection and falls back to the cached list, where it previously read the cache ONLY; (b) search is multi-token and order-independent; (c) NEW: the tab strip has a “Group by: Domain | Integration” switch, and entities Home Assistant marks diagnostic or config are HIDDEN BY DEFAULT behind a “Show diagnostic &amp; config” tick-box. Steps 3, 4 and 7 exercise these on purpose — judge the card against the Expected, not against how round 1 behaved.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0-r2_2026-07-31.md`'

# HA-03: Download an existing dashboard from Home Assistant (read-only)
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0-r2] HA-03: Download an existing dashboard from Home Assistant (read-only)' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** HA-03
**Test:** Download an existing dashboard from Home Assistant (read-only)
**UAT round:** v1.0.0-r2 — 2026-07-31
**Severity:** high
**Regression:** no

## Observed
Some cards come up with error.  Spacing and sizes are wrong.  A number of other issues

## Expected
- Real dashboards from the instance are listed, with titles and any admin-only marking.
- ⭐ Step 3: if “Overview” cannot be downloaded, HAVDM says so in plain language — naming the dashboard, explaining that Home Assistant builds it automatically, and telling you to use “Take control” in Home Assistant first. A raw Home Assistant error such as “No config found.” is a fail. If your Overview has already been taken control of it will simply download like any other — that is also a pass.
- Downloading one loads it onto the canvas.
- ⭐ A dashboard that cannot be loaded is never reported as loaded. A green “loaded successfully” message over an empty or unchanged canvas is High. A refused dashboard must leave whatever was already open untouched.
- Cards HAVDM cannot render show a marked placeholder, not a crash and not a blank space. A blank canvas here is High.
- HACS cards installed on the instance — Bubble, apexcharts, mushroom, button-card, card-mod, mini-graph-card and the rest — render as something recognisable.
- Nothing is written back to Home Assistant.

## Steps to reproduce
1. Click Download (or Browse HA Dashboards).
2. Read the list of dashboards and their metadata.
3. ⭐ Try the “Overview” entry tagged Default first. On most instances Home Assistant still generates this dashboard automatically and stores no copy, so HAVDM cannot download it — this step checks that it says so clearly.
4. Now choose a different dashboard and download it. Do not save, deploy or modify it.
5. Look at the canvas, the view tabs and the heading.
6. Scan the canvas for cards that failed to render.

## Screenshot
Attached in the UAT session JSON.

## Automated coverage
Yes — tests/unit/dashboardLoadDiagnostics.spec.ts pins the plain-language wording of every load failure, and tests/integration/dashboard-load-honesty.spec.ts drives the real load seam and proves a refused dashboard reports the refusal and leaves the canvas intact. ⚠ Round-1 correction: this card previously cited tests/e2e/live-preview-deploy.spec.ts, which is 26 placeholder tests with zero real assertions — so HA-03 had no automated coverage while marked auto_covered. Neither new spec reads a real storage-mode dashboard; that still needs a human.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0-r2_2026-07-31.md`'

# HA-04: Detect and remap missing entities
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0-r2] HA-04: Detect and remap missing entities' \
  --label 'defect,severity:medium' \
  --body '## Defect summary
**Test ID:** HA-04
**Test:** Detect and remap missing entities
**UAT round:** v1.0.0-r2 — 2026-07-31
**Severity:** medium
**Regression:** no

## Observed
Not enough information to be able to map the missing entities.  It would be helpful have the integration that the entity belongs to so I could find the mapping.  Auto-map doesn'\''t work

## Expected
- The missing entity is detected and listed.
- Real entities from the instance populate the replacement dropdown.
- Applying updates the card and the YAML to the new entity id.
- The history tab records the remap.
- Entities that do exist are not touched.
- Disconnected but with a cached entity list, the dialog still offers real replacement entities. "No data" in the replacement dropdown is a fail.
- Disconnected, entities that exist are not listed as missing. HAVDM claiming your entities are gone when it simply cannot see your instance is a fail, and a worse one than an empty dropdown — it is a false statement about the user'\''s Home Assistant, and remapping on the strength of it would rewrite a working config.

## Steps to reproduce
1. Open a dashboard, then edit one card'\''s entity to something that does not exist, e.g. light.does_not_exist_uat.
2. Click Remap in the toolbar.
3. Read what the dialog reports as missing.
4. Choose a replacement entity from the dropdown for that entity.
5. Apply, then check the card on the canvas and in the YAML.
6. Look at the History tab of the remapping dialog.
7. Now disconnect from Home Assistant (or start from a profile that has connected before, so a cached entity list exists) and click Remap again on a dashboard whose entities all really do exist.

## Screenshot
Attached in the UAT session JSON.

## Automated coverage
Yes — tests/e2e/entity-remapping.spec.ts and tests/unit/entityRemapping.spec.ts prove auto-mapping updates the YAML. They work against fixture entity lists, not a real instance’s naming. tests/e2e/entity-picker-sources.spec.ts proves the remap path reads the persisted offline cache and that entities present in the entity list are NOT reported missing. Round 1'\''s failure had ONE root cause behind all three symptoms: the remap path was the only one of HAVDM'\''s four entity pickers that never read the offline cache, so with no live connection it saw zero entities — and detectMissing treated an empty list as "nothing exists" rather than "I do not know what exists", so it reported EVERY referenced entity as missing, then offered "No data" as each replacement and had nothing for Auto-map to do.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0-r2_2026-07-31.md`'

# HA-07: The Deploy dialog states what was adjusted for Home Assistant
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0-r2] HA-07: The Deploy dialog states what was adjusted for Home Assistant' \
  --label 'defect,severity:high,regression' \
  --body '## Defect summary
**Test ID:** HA-07
**Test:** The Deploy dialog states what was adjusted for Home Assistant
**UAT round:** v1.0.0-r2 — 2026-07-31
**Severity:** high
**Regression:** YES — passed in the previous round

## Observed
Clicking deploy did not provide a summary of what would be done and list adjustments.  It just deployed the dashboard.  When viewing the dashboard in HA

## Expected
- The summary banner appears and lists the adjustments.
- Each line is plain language — it names what was changed and why, without referring to HAVDM internals or key names a user would not recognise.
- The banner is styled as a warning when something was genuinely lost, rather than as neutral information.
- Cancelling closes the dialog and writes nothing to Home Assistant.

## Steps to reproduce
1. Ensure the dashboard contains a canvas-only card (from EXPORT-03).
2. Click Deploy in the toolbar.
3. Read the banner headed "This design was adjusted for Home Assistant".
4. Read each line in it.
5. Click Cancel. Do not deploy from this card — this card only reads the dialog.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/unit/DeployDialog.spec.tsx proves the export summary renders when warnings exist and is absent when they do not; tests/unit/exportWarningSummary.spec.ts covers the wording. Neither can judge whether the summary would stop a person deploying something they did not mean to.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0-r2_2026-07-31.md`'

# HA-08: Live Preview creates a TEMPORARY dashboard — and Close deletes it
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0-r2] HA-08: Live Preview creates a TEMPORARY dashboard — and Close deletes it' \
  --label 'defect,severity:medium,regression' \
  --body '## Defect summary
**Test ID:** HA-08
**Test:** Live Preview creates a TEMPORARY dashboard — and Close deletes it
**UAT round:** v1.0.0-r2 — 2026-07-31
**Severity:** medium
**Regression:** YES — passed in the previous round

## Observed
Address for preview is hidden under cards and even when it is not it cannot be copied.  Better option would be when the user clicks "Live Preview" a dialog with the address is shown with the option to copy it to clipboard and instruction on what to do and what the user should see.

## Expected
- Live Preview reports creating a temporary dashboard and enters preview mode.
- The embedded Home Assistant render is recognisably the dashboard you designed — the single most valuable observation in the round. Note any card that renders differently from the HAVDM canvas.
- The view switcher moves between views, and the Edit Mode / Preview Mode toggle switches between arranging cards and previewing — neither state leaves the embedded view blank.
- Close reports the temporary dashboard was deleted.
- The final step confirms it: no temporary dashboard is left behind. One left behind is High — an unrequested persistent write to Home Assistant.

## Steps to reproduce
1. With a dashboard open and connected, click Live Preview.
2. Read the message about the temporary dashboard being created.
3. Look at the embedded Home Assistant view — compare it to the HAVDM canvas.
4. Switch between views using the preview'\''s view switcher.
5. Toggle between Edit Mode and Preview Mode.
6. DO NOT press "Deploy to Production" — it writes back over the production dashboard the design came from. Click Close instead, and read the confirmation.
7. TEARDOWN: in a browser, open Home Assistant &rarr; Settings &rarr; Dashboards and confirm no HAVDM temporary dashboard remains. If one does, delete it there.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/unit/livePreviewDeploy.spec.ts proves the deploy target resolution never silently defaults to lovelace, and that the confirmation names the destination. It resolves targets in memory; it never creates anything in Home Assistant.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0-r2_2026-07-31.md`'
