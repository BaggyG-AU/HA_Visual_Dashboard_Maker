#!/usr/bin/env bash
# ============================================================
# GitHub Issues payload — HAVDM UAT v1.0.0 (2026-07-27)
#
# ⚠ REVIEW BEFORE RUNNING. Creating issues is outward-facing and
#   requires the project owner's explicit authorisation.
# ⚠ NOT IDEMPOTENT — search existing issues for the test ID first:
#   https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/issues
# ============================================================
set -euo pipefail

# SHELL-03: Theme toggle switches the interface and survives a restart
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] SHELL-03: Theme toggle switches the interface and survives a restart' \
  --label 'defect,severity:low' \
  --body '## Defect summary
**Test ID:** SHELL-03
**Test:** Theme toggle switches the interface and survives a restart
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** low
**Regression:** no

## Observed
CTRL-T switched to "Light Theme" however canvas is still dark and blue areas are unchanged.  Pressing CTRL-T does not switch it back but just keeps saying '\''Switched to Light Theme'\'' so it is not toggling.  Need to do a full sweep to ensure dark on dark does not occur - if dark background then must be light text and visa versa.

## Expected
- The interface switches between light and dark on each press, immediately.
- A message names the theme that was switched to.
- After relaunching, the application opens in the theme that was active when you closed it.

## Steps to reproduce
1. Note whether the interface is currently light or dark.
2. Press Ctrl+T.
3. Read the confirmation message that appears.
4. Press Ctrl+T twice more, so a theme change is the last thing you did.
5. Close the application completely and relaunch HA Visual Dashboard Maker.exe.

## Screenshot
Attached in the UAT session JSON.

## Automated coverage
**No — a regression test is REQUIRED as part of the fix (UAT_STRATEGY.md §7).**

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# FILE-01: Create a blank dashboard
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] FILE-01: Create a blank dashboard' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** FILE-01
**Test:** Create a blank dashboard
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Some buttons black text on dark background ("greyed out" but unreadable)

## Expected
- The dialog offers four choices: Blank Dashboard, Sections View, From Template, From Entity Type.
- Choosing Blank Dashboard closes the dialog and shows an empty canvas.
- One view tab exists and is selected.
- The toolbar now shows New, Open, Download, Edit YAML, Visual/Split, Save, Deploy, Remap and Live Preview.

## Steps to reproduce
1. Click New Dashboard on the welcome screen.
2. In the New Dashboard dialog, click Blank Dashboard.
3. Look at the canvas area and the view tab strip.
4. Read the heading above the canvas.

## Screenshot
Attached in the UAT session JSON.

## Automated coverage
Yes — tests/e2e/dashboard-operations.spec.ts covers dashboard creation and the store state that follows. It cannot judge whether the resulting canvas is a usable starting point for a person.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# FILE-02: Create a Sections-view dashboard
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] FILE-02: Create a Sections-view dashboard' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** FILE-02
**Test:** Create a Sections-view dashboard
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Can'\''t find "Sections View".  Do you mean "Convert to Sections Veiw"?

## Expected
- A sections canvas appears, visually distinct from the flat grid canvas.
- At least one section is present, with a heading field and an Add section control.
- The Columns wide control is present and shows a number.
- Nothing on the canvas overlaps or renders on top of itself.

## Steps to reproduce
1. Click New in the toolbar (or New Dashboard on the welcome screen).
2. Click Sections View.
3. Look at the canvas.
4. Find the Columns wide control on the sections toolbar.

## Screenshot
Attached in the UAT session JSON.

## Automated coverage
Yes — tests/e2e/sections-canvas.spec.ts renders imported sections views and asserts section-addressed selection and editing. It starts from a fixture; it never creates a sections dashboard from the New Dashboard dialog.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# FILE-03: Create a dashboard from a template
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] FILE-03: Create a dashboard from a template' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** FILE-03
**Test:** Create a dashboard from a template
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Message displayed saying "Template selection coming soon..." and then just loads a blank template

## Expected
- A list of templates is offered with readable names.
- Selecting one produces a populated canvas, not an empty one.
- Cards are laid out without overlapping each other.
- Clicking a card selects it and the Properties panel targets that card.

## Steps to reproduce
1. Click New, then From Template.
2. Pick any offered template.
3. Look at the cards that appear on the canvas.
4. Click one of them.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/e2e/templates.spec.ts proves a template loads and produces cards. It cannot say whether the resulting layout looks like a dashboard someone would want to start from.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# FILE-05: Save writes the file, clears the dirty marker and leaves a backup
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] FILE-05: Save writes the file, clears the dirty marker and leaves a backup' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** FILE-05
**Test:** Save writes the file, clears the dirty marker and leaves a backup
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Save shows message "No dashboard loaded to save"

## Expected
- The asterisk appears as soon as the dashboard is modified, and Save becomes enabled.
- Saving reports success and the asterisk disappears.
- Re-opening the file shows the moved card in its new position — the change was actually written.
- A backup of the previous file content exists alongside it. If no backup was created, that is data-safety-relevant: mark Fail and note it.

## Steps to reproduce
1. With a file-backed dashboard open, drag any card to a different position.
2. Look at the heading — note the orange asterisk — and that Save is now enabled.
3. Click Save.
4. Read the confirmation message and look at the heading again.
5. Choose File &rarr; Open Dashboard... and re-open the same file.

## Screenshot
_None recorded._

## Automated coverage
**No — a regression test is REQUIRED as part of the fix (UAT_STRATEGY.md §7).**

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# FILE-06: Save As... writes a new file and it appears in Recent Files
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] FILE-06: Save As... writes a new file and it appears in Recent Files' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** FILE-06
**Test:** Save As... writes a new file and it appears in Recent Files
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Save As... shows message "No dashboard loaded to save"

## Expected
- The native save dialog opens and accepts the new name.
- After saving, the path line shows the new path, not the old one.
- uat-scratch.yaml appears in Recent Files.
- Re-opening it from Recent Files loads the same dashboard.

## Steps to reproduce
1. Choose File &rarr; Save As... (or Ctrl+Shift+S).
2. In the native dialog, save to a new filename such as uat-scratch.yaml.
3. Read the path line beneath the dashboard heading.
4. Open the File &rarr; Recent Files submenu.
5. Open a different dashboard, then return via Recent Files &rarr; uat-scratch.yaml.

## Screenshot
_None recorded._

## Automated coverage
**No — a regression test is REQUIRED as part of the fix (UAT_STRATEGY.md §7).**

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# CANVAS-04: Resize a card
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] CANVAS-04: Resize a card' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** CANVAS-04
**Test:** Resize a card
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Cannot grab resize handle.

## Expected
- A resize handle is discoverable by hovering.
- The card grows and shrinks as you drag, and other cards reflow around it.
- Card content reflows to the new size rather than being clipped or overflowing.
- At a very small size the card degrades gracefully — no content escapes its border.

## Steps to reproduce
1. Hover the bottom-right corner of a card until a resize handle appears.
2. Drag it to make the card roughly twice as wide, then release.
3. Look at the card'\''s content.
4. Drag the same handle to make the card very small.

## Screenshot
_None recorded._

## Automated coverage
**No — a regression test is REQUIRED as part of the fix (UAT_STRATEGY.md §7).**

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# CANVAS-06: Delete a card from the right-click context menu
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] CANVAS-06: Delete a card from the right-click context menu' \
  --label 'defect,severity:medium' \
  --body '## Defect summary
**Test ID:** CANVAS-06
**Test:** Delete a card from the right-click context menu
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** medium
**Regression:** no

## Observed
No right-click context menu display.  Pressing DEL while card is selected deletes the card

## Expected
- The context menu offers Cut, Copy, Paste and Delete.
- Delete removes only the card you right-clicked.
- Remaining cards stay where they were — deleting one does not scramble the layout.
- The dashboard is marked modified (asterisk in the heading).

## Steps to reproduce
1. Right-click a card on the canvas.
2. Read the menu items offered.
3. Choose Delete.
4. Look at the canvas.

## Screenshot
_None recorded._

## Automated coverage
**No — a regression test is REQUIRED as part of the fix (UAT_STRATEGY.md §7).**

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# CANVAS-07: Undo and redo restore in single, predictable steps
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] CANVAS-07: Undo and redo restore in single, predictable steps' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** CANVAS-07
**Test:** Undo and redo restore in single, predictable steps
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
I deleted a card and then clicked Undo.  The text I typed into the Card Pallet was affected (undone) but the deleted card did to get restored.

## Expected
- Each Ctrl+Z reverses exactly one of your three actions, in reverse order.
- Three presses return the dashboard to its original state; three redo presses restore it fully.
- The last step undoes your last edit, not a selection — clicking around does not consume undo steps.
- The Undo and Redo toolbar buttons disable when there is nothing left to do.

## Steps to reproduce
1. Move a card. Add a card. Delete a different card. Note the order.
2. Press Ctrl+Z once and look at the canvas.
3. Press Ctrl+Z twice more, checking the canvas after each press.
4. Press Ctrl+Y three times, checking after each.
5. Click a card, click empty canvas, click another card, then press Ctrl+Z once.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/integration/selection-history.spec.ts proves the store records one history entry per real change, and that merely selecting a card records none. It cannot tell you how many Ctrl+Z presses it feels like it takes.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# CLIP-01: Copy and paste a card
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] CLIP-01: Copy and paste a card' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** CLIP-01
**Test:** Copy and paste a card
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
I added a Markdown Card.  As soon as I updated the Properties and included "Content" the card on the canvas turned into a Spacer (Empty) card.  I was able to successfully copy the Living Room light card through

## Expected
- A second card appears, carrying the same configuration.
- It lands in a visible free position, not underneath the original.
- Both cards render correctly.
- The dashboard is marked modified.

## Steps to reproduce
1. Select a card you have configured (name, entity).
2. Right-click it and choose Copy.
3. Right-click empty canvas and choose Paste.
4. Compare the two cards.

## Screenshot
Attached in the UAT session JSON.

## Automated coverage
Yes — tests/e2e/bulk-operations.spec.ts covers the bulk copy, cut-move and delete flows through the DSL. It cannot tell you whether the pasted card lands somewhere sensible on screen.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# CLIP-02: A pasted card is genuinely independent of its source
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] CLIP-02: A pasted card is genuinely independent of its source' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** CLIP-02
**Test:** A pasted card is genuinely independent of its source
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Changing the name to "UAT Living Room Light" to the copied card changed it into a spacer.  Same issue as CLIP-1

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
_None recorded._

## Automated coverage
Yes — tests/unit/card-clone.spec.ts proves the clipboard transforms deep-clone nested branches, and carries a characterisation block demonstrating that the previous shallow spread aliased them. It proves the transform in isolation; you are checking the guarantee survives the whole running application — copy, paste, store, form and YAML.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# CLIP-03: Cut removes the original and paste re-homes it
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] CLIP-03: Cut removes the original and paste re-homes it' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** CLIP-03
**Test:** Cut removes the original and paste re-homes it
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Cut does not remove the original card.

## Expected
- The card disappears on Cut, and Paste brings it back with its configuration intact.
- At no point does a card vanish with no way to get it back. If a cut card cannot be recovered, that is data loss — High.
- Ctrl+Z after a cut also restores the card.

## Steps to reproduce
1. Note the appearance of a specific card.
2. Right-click it and choose Cut. Confirm it has left the canvas.
3. Right-click an empty area and choose Paste.
4. Compare the pasted card to what you noted in step 1.
5. Cut another card, then press Ctrl+Z instead of pasting.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/e2e/bulk-operations.spec.ts asserts the cut-move flow through the DSL. It cannot tell you whether a card ever visibly disappears and fails to come back.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# CLIP-04: Multi-select and bulk property edit
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] CLIP-04: Multi-select and bulk property edit' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** CLIP-04
**Test:** Multi-select and bulk property edit
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Any changes to card turns them into spacers.  In this case, the change only applied to the last card selected.  All other selected cards unchanged

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
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# PROPS-01: Form edits reach the card immediately, without stalling the app
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] PROPS-01: Form edits reach the card immediately, without stalling the app' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** PROPS-01
**Test:** Form edits reach the card immediately, without stalling the app
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Any change immediately turns card to spacer card.  HOWEVER I have discovered that the change IS reflected in the YAML in the Properties editor.  If I make the change on the form, go into yaml editor, and then back to the form, the card changes from spacer back to the original with the changes applied.

## Expected
- The canvas card updates to match, without needing a save or a refresh.
- The icon changes to the one you chose.
- The application stays responsive while you type — no freeze, no blank render. A blank canvas here is High.

## Steps to reproduce
1. Select a Button card.
2. Type a new Name and watch the canvas as you type.
3. Change the Icon to mdi:lightbulb.
4. Change a colour value.
5. Keep typing in a text field for several seconds.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/e2e/properties-panel.spec.ts proves a form field change propagates to the card model. It cannot tell you whether the canvas repaints promptly or whether the app stalls while you type — the blank-app render-loop defect class.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# PROPS-03: The entity picker searches and completes real entity ids
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] PROPS-03: The entity picker searches and completes real entity ids' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** PROPS-03
**Test:** The entity picker searches and completes real entity ids
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Not connected to HA so no entities available

## Expected
- Typing filters the suggestions as you go.
- A suggestion can be chosen with the mouse or the keyboard, and the chosen id reaches the card.
- A non-existent id is accepted — HAVDM is permissive when not connected — but is marked or warned about rather than silently treated as valid.

## Steps to reproduce
1. Select a card with an Entity field.
2. Click the field and type light.
3. Read the suggestions offered, and pick one from the list.
4. Clear the field and type a full entity id that does not exist, e.g. sensor.definitely_not_real.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/unit/entityPickerSource.spec.ts and tests/unit/EntityPicker.offline.spec.tsx prove the source resolution including the offline path. They cannot tell you whether typing into it feels usable.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# PROPS-04: Configure a tap action
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] PROPS-04: Configure a tap action' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** PROPS-04
**Test:** Configure a tap action
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Could only find Smart Default Actions.  No other options available

## Expected
- Options include None, More Info, Toggle, Call Service, Navigate, URL, Popup.
- Choosing Toggle writes a toggle tap action into the YAML.
- Navigate reveals a navigation-path field; Call Service reveals a service field. The form adapts to the choice.
- No option leaves the form half-configured with no way to complete it.

## Steps to reproduce
1. Select a Button card and find the tap action control.
2. Read the options offered.
3. Choose Toggle, and check the YAML tab.
4. Change it to Navigate and look at what additional fields appear.
5. Change it to Call Service.

## Screenshot
Attached in the UAT session JSON.

## Automated coverage
Yes — tests/e2e/smart-actions.spec.ts and tests/unit/smartActions.spec.ts prove the action config reaches the YAML. They cannot judge whether the options presented make sense to a dashboard author.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# PROPS-05: Build a conditional-visibility rule and see it previewed
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] PROPS-05: Build a conditional-visibility rule and see it previewed' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** PROPS-05
**Test:** Build a conditional-visibility rule and see it previewed
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
No conditions option for Button card.  Used Slider Button Card to test, no entities available for test because not connected to HA

## Expected
- A condition can be added, configured and removed without the panel breaking.
- The preview states plainly whether the card would currently be visible.
- Nested groups are visually distinguishable from root-level conditions.
- The YAML carries the condition in Home Assistant'\''s real visibility form.

## Steps to reproduce
1. With a card selected, find the conditional-visibility controls.
2. Add a root condition and set it to a state condition on any entity, e.g. light.kitchen is on.
3. Read the preview area.
4. Add a group with a second condition inside it.
5. Check the card'\''s YAML.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/e2e/conditional-visibility.spec.ts proves a state-based rule applies, updates live and persists to YAML; tests/unit/conditionalVisibility.spec.ts covers the rule logic. Neither can judge whether the rule builder is comprehensible.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# PROPS-06: Card spacing and layout gap controls
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] PROPS-06: Card spacing and layout gap controls' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** PROPS-06
**Test:** Card spacing and layout gap controls
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Cannot put two cards inside it.  Tried to drag Button card in but card inserted onto the canvas.

## Expected
- The preset gap visibly changes the spacing between the nested cards.
- A custom value takes effect and is visibly different from the preset.
- Grid row and column gaps can be set independently and both take effect.
- Spacing on the canvas is proportionate to the value you entered.

## Steps to reproduce
1. Add a Vertical Stack card and put two cards inside it.
2. Select the stack and find the layout gap control.
3. Choose a preset gap and watch the canvas.
4. Switch to the custom gap field and enter a clearly different value, e.g. 40px.
5. Add a Grid card and set its row and column gaps separately.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/e2e/spacing.spec.ts and tests/unit/card-spacing.spec.ts prove the spacing values reach the config. They cannot tell you whether the spacing you chose is the spacing you see.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# VIEWS-04: Author a sections view — add, rename, reorder, delete
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] VIEWS-04: Author a sections view — add, rename, reorder, delete' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** VIEWS-04
**Test:** Author a sections view — add, rename, reorder, delete
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Sections created.  Cards added.  Dragging does not work.

## Expected
- Sections can be added, and each has its own heading field.
- A card added while a section is selected lands in that section, not elsewhere.
- Dragging by the handle reorders sections, and the cards travel with them.
- Deleting a section removes it and its cards, and does not disturb other sections.

## Steps to reproduce
1. On a sections dashboard, click Add section.
2. Type Living Room into the new section'\''s heading field.
3. Add a card into that section from the palette.
4. Drag the section by its reorder handle to a different position.
5. Add a second section, then delete the first with its delete control.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/e2e/sections-canvas.spec.ts proves section-addressed selection, adding palette cards into the selected section, multi-select delete, and cut/paste between sections. It cannot tell you whether dragging a section by its handle works with a real mouse.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# VIEWS-06: Convert an ordinary view into a sections view, and be told what was not carried over
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] VIEWS-06: Convert an ordinary view into a sections view, and be told what was not carried over' \
  --label 'defect,severity:medium' \
  --body '## Defect summary
**Test ID:** VIEWS-06
**Test:** Convert an ordinary view into a sections view, and be told what was not carried over
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** medium
**Regression:** no

## Observed
Silent geometry loss

## Expected
- Every card from the flat view is present after the conversion — none is lost. A lost card is High.
- The layout is not expected to be preserved exactly. What is expected is that HAVDM says so — a banner or message telling you geometry was not carried over. Silent geometric loss with no notice is Medium.
- Undo restores the original flat view and its positions.

## Steps to reproduce
1. On a flat view with several positioned cards, note where each card sits.
2. Find and click the Convert to sections control.
3. Read any banner or message shown.
4. Look at the resulting sections layout.
5. Press Ctrl+Z.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/unit/sectionsLayout.spec.ts proves the sections geometry model. The known limitation is that convert-to-sections does not translate the original grid geometry — you are checking that HAVDM is honest about that rather than pretending the layout survived.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# VIEWS-08: The layout-card grid editor accepts raw CSS grid values verbatim
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] VIEWS-08: The layout-card grid editor accepts raw CSS grid values verbatim' \
  --label 'defect,severity:medium' \
  --body '## Defect summary
**Test ID:** VIEWS-08
**Test:** The layout-card grid editor accepts raw CSS grid values verbatim
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** medium
**Regression:** no

## Observed
Nonsense was accepted (no rejected message)

## Expected
- The grid editor is absent for a masonry view and present for a layout-card view.
- A warning appears before the type conversion.
- The three values round-trip exactly as typed — repeat(3, 1fr) is not rewritten or normalised. Named areas and 1fr 2fr 1fr must survive verbatim.
- Nonsense input is either rejected with a clear message or accepted verbatim — but never silently rewritten into something you did not type.

## Steps to reproduce
1. Open Edit view on an ordinary masonry view — confirm no grid editor is offered.
2. Change Type to the layout-card grid option, read the warning, and save.
3. Re-open Edit view — the grid editor should now be present.
4. Set columns to repeat(3, 1fr), rows to repeat(auto-fill, 56px), gap to 12px. Save.
5. Re-open Edit view and read the three fields.
6. Enter deliberate nonsense in columns, e.g. not-a-grid, and save.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/e2e/layout-card-editor.spec.ts proves the grid editor appears only for a real layout-card view, that edits round-trip, that converting warns first, and that re-opening shows current values. It cannot judge whether raw CSS strings are a reasonable thing to ask of a person.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# YAML-04: Split view keeps canvas and YAML in step
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] YAML-04: Split view keeps canvas and YAML in step' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** YAML-04
**Test:** Split view keeps canvas and YAML in step
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Selecting a card does not seem to highlight the correct section in the yaml editor.  Editing yaml is reflected in on the canvas.

## Expected
- Both panes are visible and usable at the packaged window'\''s size.
- Selecting a card is reflected in the YAML pane (highlight, scroll, or similar).
- Moving a card updates the YAML pane without a manual refresh.
- Switching back to Visual keeps every change made in Split mode.

## Steps to reproduce
1. Set the Visual/Split control to Split.
2. Look at the layout — canvas on one side, YAML on the other.
3. Select a card on the canvas and watch the YAML pane.
4. Move a card on the canvas and watch the YAML pane again.
5. Switch back to Visual.

## Screenshot
_None recorded._

## Automated coverage
**No — a regression test is REQUIRED as part of the fix (UAT_STRATEGY.md §7).**

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# YAML-05: Insert an entity id at the cursor from the entity browser
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] YAML-05: Insert an entity id at the cursor from the entity browser' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** YAML-05
**Test:** Insert an entity id at the cursor from the entity browser
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Started typing to add an entities section and validation error immediately popped up.  This should be limited somehow so that the validation check is only applied after LF/CR or we replace it with the red underline and a hover or right click to see the error (if possible).  For this test, however, the entity browser did not appear when I added the entity section or when I clicked in an existing entity value.

## Expected
- The entity browser opens from within the YAML dialog.
- The selected id is inserted at the cursor, not appended at the end or at the top.
- The YAML remains valid after the insertion.
- The dialog does not lose your other edits when the browser opens and closes.

## Steps to reproduce
1. In the Edit YAML dialog, click into the editor and place the cursor inside a card'\''s entity: value.
2. Click the entity-insert button in the dialog header.
3. Search for and select an entity.
4. Look at where the id landed.

## Screenshot
Attached in the UAT session JSON.

## Automated coverage
Yes — tests/integration/entity-browser.spec.ts proves an entity id is inserted into the dashboard YAML editor. It is also the one load-sensitive integration spec in the suite, so a human confirmation here is worth having.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# EXPORT-01: Export for Home Assistant writes a YAML file
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] EXPORT-01: Export for Home Assistant writes a YAML file' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** EXPORT-01
**Test:** Export for Home Assistant writes a YAML file
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Error: No dashboard loaded to export

## Expected
- A native save dialog opens with a sensible default filename.
- Export reports success.
- The exported file loads back into HAVDM without an error.
- Every view and card is present in the re-loaded dashboard.

## Steps to reproduce
1. Choose File &rarr; Export for Home Assistant....
2. In the native save dialog, save as uat-export.yaml.
3. Read the confirmation message.
4. Load the exported file back in via File &rarr; Open Dashboard...

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/unit/menu.spec.ts proves the File menu item exists and is wired to its own channel, distinct from Save. It never opens the native save dialog or writes a file.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# EXPORT-04: The palette marks unavailable cards honestly, and still lets you author them
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] EXPORT-04: The palette marks unavailable cards honestly, and still lets you author them' \
  --label 'defect,severity:medium' \
  --body '## Defect summary
**Test ID:** EXPORT-04
**Test:** The palette marks unavailable cards honestly, and still lets you author them
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** medium
**Regression:** no

## Observed
No cards marked Not Installed

## Expected
- Not-installed and canvas-only cards are marked differently — they are different situations.
- Tooltips explain in plain language, naming HACS where relevant, without requiring the reader to know HAVDM'\''s internals.
- A not-installed card can still be added and authored — HAVDM does not hard-disable it. Blocking authoring here contradicts the product vision.
- Once placed, the card carries a visible "won’t render on your instance" style marking.

## Steps to reproduce
1. Open Custom Cards in the palette.
2. Hover a card that is marked as not installed and read the tooltip.
3. Hover a card marked HAVDM canvas-only and read that tooltip.
4. Add a not-installed card to the canvas anyway.
5. Look for any banner or marking on the card once placed.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/unit/CardPalette.availability.spec.tsx and tests/unit/capabilityProfile.spec.ts prove the availability logic and its permissive never-connected default. They cannot judge whether the marking is comprehensible to a non-expert.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# HA-03: Download an existing dashboard from Home Assistant (read-only)
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] HA-03: Download an existing dashboard from Home Assistant (read-only)' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** HA-03
**Test:** Download an existing dashboard from Home Assistant (read-only)
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Some dashboards will load but others don'\''t

## Expected
- Real dashboards from the instance are listed, with titles and any admin-only marking.
- Downloading one loads it onto the canvas.
- Cards HAVDM cannot render show a marked placeholder, not a crash and not a blank space. A blank canvas here is High.
- HACS cards installed on the instance — Bubble, apexcharts, mushroom, button-card, card-mod, mini-graph-card and the rest — render as something recognisable.
- Nothing is written back to Home Assistant.

## Steps to reproduce
1. Click Download (or Browse HA Dashboards).
2. Read the list of dashboards and their metadata.
3. Choose one and download it. Do not save, deploy or modify it.
4. Look at the canvas, the view tabs and the heading.
5. Scan the canvas for cards that failed to render.

## Screenshot
Attached in the UAT session JSON.

## Automated coverage
Yes — tests/e2e/live-preview-deploy.spec.ts covers the dashboard browser listing, metadata and download against a mock. It has never read a real storage-mode dashboard.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# HA-04: Detect and remap missing entities
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] HA-04: Detect and remap missing entities' \
  --label 'defect,severity:high' \
  --body '## Defect summary
**Test ID:** HA-04
**Test:** Detect and remap missing entities
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** high
**Regression:** no

## Observed
Missing entities listed. Auto-map All does nothing.  "No data" mesage in the entity browser ("Select replacement entity")

## Expected
- The missing entity is detected and listed.
- Real entities from the instance populate the replacement dropdown.
- Applying updates the card and the YAML to the new entity id.
- The history tab records the remap.
- Entities that do exist are not touched.

## Steps to reproduce
1. Open a dashboard, then edit one card'\''s entity to something that does not exist, e.g. light.does_not_exist_uat.
2. Click Remap in the toolbar.
3. Read what the dialog reports as missing.
4. Choose a replacement entity from the dropdown for that entity.
5. Apply, then check the card on the canvas and in the YAML.
6. Look at the History tab of the remapping dialog.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/e2e/entity-remapping.spec.ts and tests/unit/entityRemapping.spec.ts prove auto-mapping updates the YAML. They work against fixture entity lists, not a real instance’s naming.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'

# HA-06: Themes are fetched from the instance
gh issue create \
  --repo BaggyG-AU/HA_Visual_Dashboard_Maker \
  --title '[UAT v1.0.0] HA-06: Themes are fetched from the instance' \
  --label 'defect,severity:medium' \
  --body '## Defect summary
**Test ID:** HA-06
**Test:** Themes are fetched from the instance
**UAT round:** v1.0.0 — 2026-07-27
**Severity:** medium
**Regression:** no

## Observed
Theme change does not change how things appear on the canvas

## Expected
- Real themes from the Home Assistant instance are listed, not a hard-coded set.
- Selecting one applies it visibly to the canvas.
- Refresh re-fetches without emptying the list.
- After disconnecting, the Home Assistant theme selector is no longer offered, and the app does not error.

## Steps to reproduce
1. While connected, open the theme selector that appears in the header.
2. Read the list of themes offered.
3. Select one and look at the canvas.
4. Click the theme refresh control.
5. Disconnect and look at the header again.

## Screenshot
_None recorded._

## Automated coverage
Yes — tests/integration/theme-integration-mocked.spec.ts proves theme fetching and selection against a mocked WebSocket. It has never read a real instance’s theme list.

## References
- Plan: `docs/testing/uat/plans/uat_plan_v1.0.0_2026-07-27.md`
- Report: `docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`'
