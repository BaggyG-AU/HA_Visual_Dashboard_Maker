# UAT Test Plan — v1.0.0: First stable release (ROUND 2)

**Date:** 2026-07-31
**Round:** v1.0.0-r2 — First stable release (**round 2 — full re-run**)
**Scope:** **Full product, all 66 cards.** `UAT_STRATEGY.md` §3.6 requires the
next round to run the **whole matrix**, not only round 1's failures — the
previous-round dots only expose regressions if everything is re-run. Dashboard
authoring, views and sections, cards, the YAML editor, import/export fidelity,
themes and presets, version control, and the Home Assistant connection. Out of
scope: withdrawn slices G (analytics) and H (plugin scaffold), and the deferred
`commitFiles` version-control write.
**Build under test:** **Windows x64** packaged app —
`out/HA Visual Dashboard Maker-win32-x64/HA Visual Dashboard Maker.exe`,
**rebuilt 2026-07-31 from `main` = `199c8f6`**, which carries every round-1
remediation (PRs #90–#107). The rebuild was proven against the artifact rather
than against config: **16 asar markers each read present in the new binary and
absent in the round-1 one**, the FILE-03 stub string `Template selection coming
soon` is **gone**, and `resources/templates/` now ships the template files that
were **missing from every round-1 installer**.
**Automated baseline:** unit 1121 · integration 182 passed / 0 failed / 19 skipped
· e2e 282 passed / 9 failed / 2 skipped
**Governed by:** `docs/testing/UAT_STRATEGY.md`,
`docs/governance/phases/phase-7-ecosystem-future-growth-amendment-03.md`

---

## How to read this plan

This plan is the **source of truth**. The HTML matrix at
`docs/testing/uat/matrices/uat_matrix_v1.0.0-r2_2026-07-31.html` is generated from
it and exists only to execute it. If the two disagree, the plan is right and the
matrix is a bug.

### ⭐ What is different about round 2

**Use the round-2 matrix, not the round-1 one**, and not any copy saved to your
Desktop on 27 July. Three things changed:

1. **Your round-1 verdicts will not reappear.** The matrix stores results under a
   key derived from the round id, and round 2 uses a new one (`v1_0_0_r2`). Had
   it reused round 1's, your 66 old marks would have loaded straight back in and
   the acceptance chip would have been computed from verdicts you never re-made.
2. **Every card now shows a faded previous-round dot** — what you marked in round
   1. That is what makes a regression visible: a card that was green and is now
      red is a regression, and it is the reason §3.6 asks for a full re-run.
3. **Cards carry a status badge.** `fixed — recheck` means a defect you raised is
   claimed fixed on `main`; look at it hard. `was skipped — now runnable` means
   round 1 could not run it because something else was broken. `ruled not a
defect` means the owner judged the round-1 fail to be correct behaviour.

⚠ **One card is neither fixed nor skipped: `CLIP-03` carries `recheck — was
blocked by CANVAS-06`.** You marked it High in round 1, but every step told you
to right-click — and right-click was dead on every card (CANVAS-06). So its
failure was probably a **consequence** of that, not an independent defect. The
right-click fix is merged and verified in code; nobody has re-tested CLIP-03
since. **Please run it deliberately.** If it passes, a High closes. If it fails,
it is a real, independent defect that has been hiding behind another one.

**Every step is an action you perform in the running packaged application.** No
step asks you to run a command, inspect a file, or reason about code. Where an
automated spec already proves the underlying logic, the card says so in
_Automated coverage confirms_ and the steps then verify only what that spec
cannot see.

### Test types

| Type            | Meaning                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **gate**        | An automated spec proves the logic. You verify the observable behaviour it cannot see.                                       |
| **edge**        | No automated coverage exists. Your steps are the only evidence.                                                              |
| **interaction** | A live application workflow — packaging, windows, menus, native dialogs.                                                     |
| **fidelity**    | Does the config HAVDM produced render correctly in Home Assistant, and does HAVDM honestly mark what it could not translate? |

### Severity, when you mark a Fail

Set it on the card. **High** — data loss, a blocked core workflow, a crash or
blank render, invalid YAML presented as valid, or an unrequested write reaching
Home Assistant. **Medium** — wrong output, a silently lossy translation, wrong
undo behaviour, a stale dialog, a missing or misleading error. **Low** —
cosmetic, wording, a missing convenience with a working alternative.

⭐ Data loss is **always** High, however unlikely the path.

### Before you start

- [ ] `./tools/checks` green — verified 2026-07-31 on `199c8f6`, REAL_EXIT=0, all
      four steps ran (lint 0 errors / 145 warnings, format clean, typecheck 0,
      unit 1121 passed / 88 files)
- [ ] Suites captured and triaged — e2e 282/9/2 on 293, integration 182/0/19
- [ ] `npm run make -- --platform=win32 --arch=x64` succeeds — verified
      2026-07-31, exit 0, and the installer proven by a paired marker probe
- [ ] All milestone PRs merged — **#107 merged as `199c8f6`, no open PRs**
- [ ] `docs/testing/SKIPPED_TESTS_REGISTER.md` current — 3 documented skips

**This round runs on Windows.** Launch
`out/HA Visual Dashboard Maker-win32-x64/HA Visual Dashboard Maker.exe`. **Do not
test a dev build** — proving the packaged artifact works is one of the three
reasons this round exists. ⚠ **And do not reuse the round-1 binary**, which is
archived beside it as `HA Visual Dashboard Maker-win32-x64-ROUND1-2026-07-27`;
that one predates every fix you are here to re-test.

The build is produced from WSL with
**`npm run make -- --platform=win32 --arch=x64`**. ⭐ Note this is `make`, not
`package`: `package` produces only the unpacked folder, while `make` also builds
the Squirrel installer at
`out/make/squirrel.windows/x64/HA Visual Dashboard Maker-0.7.5-beta.10 Setup.exe`.
Either artifact is valid to test — the folder is enough, and avoids an install.
Copy the whole `HA Visual Dashboard Maker-win32-x64` folder to a real Windows
drive before testing — running it in place over `\\wsl.localhost` works but is
noticeably slower to start, and startup responsiveness is something SHELL-01 asks
you to judge.

⚠ **The installer is UNSIGNED**, so if you run `Setup.exe` Windows SmartScreen
will show "Windows protected your PC". That is expected and is not a defect —
code signing is a known open item. Choose _More info → Run anyway_, or test the
unpacked folder instead and avoid the question entirely.

### ⭐ Connect to Home Assistant FIRST — round-2 change

**Before running any group, connect to your Home Assistant instance once**
(**Settings → Home Assistant → Connect**, `<HA_HOST>` or `<HA_HOST_IP>`),
let the entity list load, and then carry on. You may disconnect afterwards.

⚠ **This is a round-2 correction, and it comes from round 1's own evidence.**
CANVAS-02 passed but its note read _"Not connected to HA so no entities cached.
Need to update test case sequence to connect to HA first."_ Several cards across
Groups 3, 5 and 8 need entities to exist before they can be judged, and running
them cold turns an **environment fact into a product defect** — PROPS-03,
PROPS-05 and EXPORT-04 were all marked Fail partly for that reason.

⭐ Connecting once populates the **offline cache**, so the entity pickers keep
working after you disconnect. That is deliberate product behaviour, and testing
it is one of the things Group 11 exists for — it is not a way of avoiding the
never-connected state. If a card explicitly says _"never connected"_, use a
fresh profile for it.

⚠ **Two Windows-only prerequisites, so you do not log false defects:**

- **Group 10 needs `git` installed and on Windows' `PATH`.** Without it every
  version-control card fails for an environmental reason rather than a product
  one. If git genuinely is absent, VCS-01 still has a correct answer — the panel
  should say so plainly instead of erroring, and slice E treats git-absent as a
  first-class state. Note which situation you are in.
- **Group 11 needs `<HA_HOST>` to resolve from Windows.** If it does not,
  use the IP `<HA_HOST_IP>` in the connection dialog instead. A hostname that
  will not resolve is a network fact about your machine, not a HAVDM defect.

### ⚠ Live Home Assistant rules — read before Group 11

`<HA_HOST>` is VPP-enrolled via Amber Electric SmartShift. Amendment-03 §4
grants UAT one bounded exception and nothing wider:

- **Permitted** — a HAVDM **temporary** dashboard (Live Preview creates it, Close
  deletes it), and — authorised for this round — one **throwaway** dashboard at
  url key `havdm-uat-temp` created through the Deploy dialog and deleted by you
  before the round closes.
- **Required** — teardown is a numbered step on the card. The summary report is
  not generated until both are confirmed gone; the matrix blocks the button until
  you confirm it.
- **Forbidden** — writing to **any** existing dashboard; the **Deploy to
  Production** button inside Live Preview (it writes back to the dashboard the
  design was downloaded from); any Modbus, inverter, VPP or Remote-EMS surface;
  any automation, script or helper change.

⚠ **HA-08 and HA-09 each name a specific button you must not press.** They are
called out on the cards, and they run last in the group so teardown is the last
thing you do.

---

## Tests

### Group 1 — Application Shell & First Run

#### SHELL-01: The packaged application launches and presents the welcome screen

| Field          | Value                                                           |
| -------------- | --------------------------------------------------------------- |
| Type           | interaction                                                     |
| Auto covered   | Y (`tests/e2e/app-launch.spec.ts`)                              |
| Pre-conditions | The Windows build copied to a local drive; never run this round |

**Automated coverage confirms:**
`tests/e2e/app-launch.spec.ts` asserts the window opens at the right dimensions,
the main UI components mount and no critical console errors appear — but it
drives a **development** build through Playwright, so it has never once launched
the artifact a user installs.

**Steps:**

1. Launch `HA Visual Dashboard Maker.exe` from the copied
   `HA Visual Dashboard Maker-win32-x64` folder.
2. Wait for the window to finish painting.
3. Read the window title bar and the header.
4. Look at the left sidebar and the connection badge in the top right.

**Expected:**

- A single window opens and stays open; nothing flashes blank or white.
- The header reads **HA Visual Dashboard Maker**.
- The welcome screen offers **New Dashboard**, **Open Local File** and **Browse
  HA Dashboards**.
- The **Card Palette** sidebar is present on the left.
- The badge in the top right reads **Not Connected**.

#### SHELL-02: The application menu exposes every top-level operation

| Field          | Value                         |
| -------------- | ----------------------------- |
| Type           | interaction                   |
| Auto covered   | Y (`tests/unit/menu.spec.ts`) |
| Pre-conditions | App launched (SHELL-01)       |

**Automated coverage confirms:**
`tests/unit/menu.spec.ts` asserts the File menu carries an **Export for Home
Assistant...** item wired to its own channel, and that Save and Save As... remain
distinct raw actions. It builds the menu structure in memory; it never opens a
real native menu in a packaged window.

**Steps:**

1. Open the **File** menu and read every item.
2. Open the **Edit**, **View**, **Window** and **Help** menus in turn.
3. In the File menu, hover **Recent Files**.
4. Close the menu with `Esc`.

**Expected:**

- File contains: Open Dashboard..., Save, Save As..., **Export for Home
  Assistant...**, **Version Control...**, Recent Files, and a quit/close item.
- Edit contains Undo, Redo, Cut, Copy, Paste.
- View contains Reload, Toggle Developer Tools, zoom items and **Toggle Theme**.
- Help contains Documentation, View on GitHub, Report Issue, About.
- Recent Files shows either previous files or a disabled **No recent files**.
- Every menu opens and dismisses without the window freezing.

#### SHELL-03: Theme toggle switches the interface and survives a restart

| Field          | Value        |
| -------------- | ------------ |
| Type           | edge         |
| Auto covered   | N            |
| Pre-conditions | App launched |

**Steps:**

1. Note whether the interface is currently light or dark.
2. Press `Ctrl+T`.
3. Read the confirmation message that appears.
4. Press `Ctrl+T` again, then once more so a theme change is the last thing you did.
5. Close the application completely and relaunch `HA Visual Dashboard Maker.exe`.

**Expected:**

- The interface switches between light and dark on each press, immediately.
- A message names the theme that was switched to.
- After relaunching, the application opens in the theme that was active when you
  closed it.

#### SHELL-04: The Settings dialog opens and all three tabs render

| Field          | Value                            |
| -------------- | -------------------------------- |
| Type           | gate                             |
| Auto covered   | Y (`tests/e2e/settings.spec.ts`) |
| Pre-conditions | App launched                     |

**Automated coverage confirms:**
`tests/e2e/settings.spec.ts` drives the settings surface and its persistence
against a dev build. It cannot tell you whether the controls are legible, whether
the dialog fits the packaged window, or whether the diagnostics copy actually
reaches your clipboard.

**Steps:**

1. Click the gear icon at the top right of the header.
2. Read the **Appearance** tab.
3. Switch to the **Connection** tab.
4. Switch to the **Diagnostics** tab.
5. Change **Logging Level** to `Debug`.
6. Click **Copy Diagnostics**, then paste into any text field in the app (for
   example the Card Palette search box) to see what was copied. Clear it after.
7. Close the dialog, re-open it, and return to **Diagnostics**.

**Expected:**

- The dialog opens on **Appearance** and all three tabs are reachable.
- Diagnostics shows Logging Level, Copy Diagnostics, a verbose debug overlay
  toggle, Haptic Feedback and UI Sounds controls.
- Copy Diagnostics places readable diagnostic text on the clipboard.
- On re-opening, Logging Level still reads `Debug` — the setting persisted.
- No control is clipped or cut off by the dialog edge.

---

### Group 2 — Creating, Opening & Saving Dashboards

#### FILE-01: Create a blank dashboard

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| Type           | gate                                         |
| Auto covered   | Y (`tests/e2e/dashboard-operations.spec.ts`) |
| Pre-conditions | App launched, no dashboard open              |

**Automated coverage confirms:**
`tests/e2e/dashboard-operations.spec.ts` covers dashboard creation and the store
state that follows. It cannot judge whether the resulting canvas is a usable
starting point for a person.

**Steps:**

1. Click **New Dashboard** on the welcome screen.
2. In the **New Dashboard** dialog, click **Blank Dashboard**.
3. Look at the canvas area and the view tab strip.
4. Read the heading above the canvas.

**Expected:**

- The dialog offers four choices: Blank Dashboard, Sections View, From Template,
  From Entity Type.
- Choosing Blank Dashboard closes the dialog and shows an empty canvas.
- One view tab exists and is selected.
- The toolbar now shows New, Open, Download, Edit YAML, Visual/Split, Save,
  Deploy, Remap and Live Preview.

#### FILE-02: Create a Sections-view dashboard

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| Type           | gate                                    |
| Auto covered   | Y (`tests/e2e/sections-canvas.spec.ts`) |
| Pre-conditions | App launched                            |

**Automated coverage confirms:**
`tests/e2e/sections-canvas.spec.ts` renders imported sections views and asserts
section-addressed selection and editing. It starts from a fixture; it does not
create a sections dashboard from the New Dashboard dialog.

**Steps:**

1. Click **New** in the toolbar (or **New Dashboard** on the welcome screen).
2. Click **Sections View**.
3. Look at the canvas.
4. Find the **Columns wide** control on the sections toolbar.

**Expected:**

- A sections canvas appears, visually distinct from the flat grid canvas.
- At least one section is present, with a heading field and an **Add section**
  control.
- The **Columns wide** control is present and shows a number.
- Nothing on the canvas overlaps or renders on top of itself.

#### FILE-03: Create a dashboard from a template

| Field          | Value                             |
| -------------- | --------------------------------- |
| Type           | gate                              |
| Auto covered   | Y (`tests/e2e/templates.spec.ts`) |
| Pre-conditions | App launched                      |

**Automated coverage confirms:**
`tests/e2e/templates.spec.ts` now drives the real dialog: it asserts all seven
shipped templates are offered by readable name and category, that loading one
produces exactly the number of cards the template declares, that no two cards
overlap, and that clicking two different cards re-targets the Properties panel
each time. It cannot say whether the resulting layout looks like a dashboard
someone would want to start from.

⚠ Round 1 cited this same spec while it was three placeholder tests — every name
containing "pending" — that never loaded a template and never asked the app
anything. The coverage claim above is the rewritten spec, not the old one.

ⓘ The seven templates now ship with the installer (`extraResource` in
`forge.config.ts`). Before that fix they were present in a development checkout and
absent from every packaged build, so a template that fails to load here is a real
defect and not an expected packaging gap.

**Steps:**

1. Click **New Dashboard** on the welcome screen — or **New** in the toolbar if a
   dashboard is already open — then **From Template**.
2. Pick any offered template.
3. Look at the cards that appear on the canvas.
4. Click one of them.

**Expected:**

- A list of templates is offered with readable names.
- Selecting one produces a populated canvas, not an empty one.
- Cards are laid out without overlapping each other.
- Clicking a card selects it and the Properties panel targets that card.

#### FILE-04: Open an existing dashboard YAML file from disk

| Field          | Value                                                       |
| -------------- | ----------------------------------------------------------- |
| Type           | interaction                                                 |
| Auto covered   | Y (`tests/e2e/file-operations.spec.ts`)                     |
| Pre-conditions | A `.yaml` dashboard file exists somewhere you can browse to |

**Automated coverage confirms:**
`tests/e2e/file-operations.spec.ts` covers the keyboard shortcuts and the title
bar's dirty marker, but explicitly leaves the **native file dialog unautomated** —
opening a real file through the OS picker has no automated coverage at all.

**Steps:**

1. Choose **File → Open Dashboard...** (or press `Ctrl+O`).
2. In the native file picker, navigate to a dashboard `.yaml` file and open it.
3. Read the heading and the path line beneath it.
4. Look at the view tabs and the canvas.

**Expected:**

- A native OS file dialog opens and accepts `.yaml` / `.yml`.
- The dashboard loads; the heading shows its title and the line beneath shows the
  file path you chose.
- Every view in the file appears as a tab.
- Cards render on the canvas rather than as error tiles.

#### FILE-05: Save writes the file, clears the dirty marker and leaves a backup

| Field          | Value                                    |
| -------------- | ---------------------------------------- |
| Type           | edge                                     |
| Auto covered   | Y (`tests/e2e/save-and-backup.spec.ts`)  |
| Pre-conditions | A dashboard opened from a file (FILE-04) |

**Automated coverage confirms:**
`tests/e2e/save-and-backup.spec.ts` drives all four expectations against the
bytes on disk, from the **toolbar button**, the **menu** and **Ctrl+S**
separately — a handler reachable from three controls is three wirings and each
needs its own evidence — and asserts the backup holds the _previous_ content.
Round 1's reported symptom ("No dashboard loaded to save") was the stale-menu-
closure defect fixed in PR #90 and no longer reproduces on any of the three.
The native **File → Open Dashboard...** dialog in step 6 is still unautomated,
so re-opening through the OS picker remains a human-only check.

**Steps:**

1. With a file-backed dashboard open, drag any card to a different position.
2. Look at the heading — note the orange asterisk.
3. Note that **Save** is now enabled.
4. Click **Save** in the toolbar. Also try **File → Save** and `Ctrl+S` — these
   are three separate wirings and any of them could fail alone.
5. Read the confirmation message and look at the heading again.
6. Choose **File → Open Dashboard...** and re-open the same file.

**Expected:**

- The asterisk appears as soon as the dashboard is modified and **Save** becomes
  enabled.
- Saving reports success and the asterisk disappears.
- Re-opening the file shows the moved card in its **new** position — the change
  was actually written.
- ⭐ A backup of the previous content exists in a **hidden `.backup` folder
  beside the file**, named `<filename>.<timestamp>.backup`, and the save message
  says so. **On Windows you must enable "Hidden items" in Explorer to see it** —
  it is not visible beside the file by default. Only the newest 5 are kept.
  If the file already existed and no backup was created, that is
  data-safety-relevant: mark Fail and note it.
  ⓘ A **first** save of a brand-new file correctly creates no backup — there is
  nothing to preserve — and the message does not claim one in that case.

#### FILE-06: Save As... writes a new file and it appears in Recent Files

| Field          | Value            |
| -------------- | ---------------- |
| Type           | interaction      |
| Auto covered   | N                |
| Pre-conditions | A dashboard open |

**Steps:**

1. Choose **File → Save As...** (or `Ctrl+Shift+S`).
2. In the native dialog, save to a new filename such as `uat-scratch.yaml`.
3. Read the path line beneath the dashboard heading.
4. Open the **File → Recent Files** submenu.
5. Choose a different dashboard, then return via **Recent Files → uat-scratch.yaml**.

**Expected:**

- The native save dialog opens and accepts the new name.
- After saving, the path line shows the **new** path, not the old one.
- `uat-scratch.yaml` appears in Recent Files.
- Re-opening it from Recent Files loads the same dashboard.

---

### Group 3 — Card Authoring on the Canvas

#### CANVAS-01: The Card Palette lists, categorises and searches the card types

| Field          | Value                                |
| -------------- | ------------------------------------ |
| Type           | gate                                 |
| Auto covered   | Y (`tests/e2e/card-palette.spec.ts`) |
| Pre-conditions | A dashboard open                     |

**Automated coverage confirms:**
`tests/e2e/card-palette.spec.ts` proves the palette renders its categories and
filters on search. It cannot tell you whether a card's description makes sense to
someone who has not read the source.

**Steps:**

1. Look at the Card Palette sidebar and expand each category in turn.
2. Type `button` into **Search cards...**.
3. Clear the search and type `zzzz`.
4. Clear the search again and hover any card to read its tooltip.
5. Find a HACS card — for example **Button Card**, **Mushroom Light** or
   **ApexCharts** — and look at how the palette marks it as a custom card.

**Expected:**

- Five categories are present: **Layout**, **Sensors & Display**, **Controls**,
  **Media**, **Information**.
- ⭐ Cards are filed by **what they do**, not by where they came from. There is
  no "Custom Cards" category — a custom card sits with the built-in cards that
  do the same job, and carries a **Custom** badge instead.
- ⭐ No single category holds most of the palette; the counts on the category
  headers are of comparable size rather than one bucket holding the majority.
- Searching `button` narrows the list to button-like cards.
- Searching `zzzz` yields an empty result without an error or a blank sidebar.
- Tooltips describe what the card is in plain language.

#### CANVAS-02: Add a Button card and give it an entity

| Field          | Value                                    |
| -------------- | ---------------------------------------- |
| Type           | gate                                     |
| Auto covered   | Y (`tests/e2e/properties-panel.spec.ts`) |
| Pre-conditions | A blank dashboard open                   |

**Automated coverage confirms:**
`tests/e2e/properties-panel.spec.ts` proves a form edit reaches the card model
and the YAML. It cannot judge whether the card **looks** like a button card on
the canvas once configured.

**Steps:**

1. From **Controls** in the palette, add the **Button** card to the canvas.
2. Click the new card to select it.
3. In the Properties panel **Form** tab, set **Entity** to any entity id, for
   example `light.kitchen`.
4. Set the card's **Name** to `UAT Button`.
5. Look at the card on the canvas.

**Expected:**

- The card appears on the canvas immediately when added.
- Selecting it targets the Properties panel at that card.
- After setting the entity and name, the card on the canvas shows `UAT Button`.
- The card renders as a button — an icon and a label — not as an error tile or an
  empty box.

#### CANVAS-03: Drag a card to a new position and the position sticks

| Field          | Value                          |
| -------------- | ------------------------------ |
| Type           | gate                           |
| Auto covered   | Y (`tests/e2e/layout.spec.ts`) |
| Pre-conditions | At least two cards on a view   |

**Automated coverage confirms:**
`tests/e2e/layout.spec.ts` asserts the grid geometry the store records after a
programmatic layout change. It cannot tell you whether dragging with a mouse
feels right, or whether the card lands where you dropped it.

**Steps:**

1. Drag a card from its position to an empty area of the grid.
2. Release, and watch where the card settles.
3. Drag a second card so it would overlap the first.
4. Switch to another view tab and back.

**Expected:**

- The card follows the cursor and drops where you released it.
- Cards reflow rather than stacking on top of one another.
- No card is left half-off the canvas or behind another.
- Returning to the view shows both cards in their new positions.

#### CANVAS-04: Resize a card

| Field          | Value                                             |
| -------------- | ------------------------------------------------- |
| Type           | edge                                              |
| Auto covered   | Y (`tests/e2e/canvas-resize-and-nesting.spec.ts`) |
| Pre-conditions | At least one card on a view                       |

**Automated coverage confirms:**
`tests/e2e/canvas-resize-and-nesting.spec.ts` asserts the resize handle is the
**topmost element at its own centre** (the round-1 defect was hit-testing, not
visibility — the handle was revealed correctly on hover but the card body was
painted over it) and that a real drag actually widens the card. It cannot tell
you whether the card's **content** reflows gracefully, which is steps 3–4 below.

**Steps:**

1. Hover the bottom-right corner of a card until a resize handle appears.
2. Drag it to make the card roughly twice as wide.
3. Release and look at the card's content.
4. Drag the same handle to make the card very small.

**Expected:**

- A resize handle is discoverable by hovering.
- The card grows and shrinks as you drag, and other cards reflow around it.
- Card content reflows to the new size rather than being clipped or overflowing.
- At a very small size the card degrades gracefully — no content escapes its
  border.

#### CANVAS-05: Selecting a card targets the Properties panel at it

| Field          | Value                                             |
| -------------- | ------------------------------------------------- |
| Type           | gate                                              |
| Auto covered   | Y (`tests/integration/selection-history.spec.ts`) |
| Pre-conditions | At least two different card types on a view       |

**Automated coverage confirms:**
`tests/integration/selection-history.spec.ts` asserts that selection is tracked
correctly and does not pollute the undo history. It cannot judge whether the
panel that appears is the **right** panel for the card you clicked.

**Steps:**

1. Click a Button card.
2. Read the Properties panel heading and the fields it offers.
3. Click a card of a different type — a Gauge or a Markdown card.
4. Read the panel again.
5. Click an empty area of the canvas.

**Expected:**

- The panel changes to match the selected card each time.
- The fields offered are appropriate to that card type, not a generic set.
- The previously selected card's values do not linger in the new card's fields.
- Clicking empty canvas deselects, and the panel reflects that.

#### CANVAS-06: Delete a card from the right-click context menu

| Field          | Value                        |
| -------------- | ---------------------------- |
| Type           | edge                         |
| Auto covered   | N                            |
| Pre-conditions | At least two cards on a view |

**Steps:**

1. Right-click a card on the canvas.
2. Read the menu items offered.
3. Choose **Delete**.
4. Look at the canvas.

**Expected:**

- The context menu offers **Cut**, **Copy**, **Paste** and **Delete**.
- Delete removes only the card you right-clicked.
- Remaining cards stay where they were — deleting one does not scramble the
  layout.
- The dashboard is marked modified (asterisk in the heading).

#### CANVAS-07: Undo and redo restore in single, predictable steps

| Field          | Value                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------ |
| Type           | gate                                                                                       |
| Auto covered   | Y (`tests/e2e/keyboard-undo-focus.spec.ts`, `tests/integration/selection-history.spec.ts`) |
| Pre-conditions | A dashboard with at least two cards                                                        |

**Automated coverage confirms:**
`tests/integration/selection-history.spec.ts` proves the store records one
history entry per real change and that merely selecting a card records none —
but it drives undo through the store hook, not the keyboard, so it cannot see a
shortcut that never reaches the app. `tests/e2e/keyboard-undo-focus.spec.ts`
presses the real `Ctrl+Z` with focus in the Card Palette search box (the round-1
failure) and checks that Delete still edits text there rather than deleting a
card. Neither can tell you how many presses it **feels** like it takes.

**Steps:**

1. Move a card. Add a card. Delete a different card. Note the order.
2. Press `Ctrl+Z` once and look at the canvas.
3. Press `Ctrl+Z` twice more, checking the canvas after each press.
4. Press `Ctrl+Y` three times, checking after each.
5. Click a card, click empty canvas, click another card, then press `Ctrl+Z` once.
6. ⭐ Delete a card. Then click into the **Card Palette search box**, type
   `button`, and press `Ctrl+Z` **without clicking anywhere else first**.

**Expected:**

- Each `Ctrl+Z` reverses exactly one of your three actions, in reverse order.
- Three presses return the dashboard to its original state.
- Three redo presses restore it fully.
- ⭐ Step 5: the undo reverses your last **edit**, not a selection — clicking
  around does not consume undo steps.
- ⭐ Step 6: the deleted **card comes back** and your typed search text is left
  alone. Search text being edited while the card stays deleted is a **fail**.
- The Undo and Redo buttons — the two icon buttons in the **header**, beside
  **Entities** — disable when there is nothing left to do.

---

### Group 4 — Clipboard, Multi-Select & State Safety

#### CLIP-01: Copy and paste a card

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| Type           | gate                                    |
| Auto covered   | Y (`tests/e2e/bulk-operations.spec.ts`) |
| Pre-conditions | A configured card on the canvas         |

**Automated coverage confirms:**
`tests/e2e/bulk-operations.spec.ts` covers the bulk copy, cut-move and delete
flows through the DSL. It cannot tell you whether the pasted card lands somewhere
sensible on screen.

**Steps:**

1. Select a card you have configured (name, entity).
2. Right-click it and choose **Copy**.
3. Right-click empty canvas and choose **Paste**.
4. Compare the two cards.

**Expected:**

- A second card appears, carrying the same configuration.
- It lands in a visible free position, not underneath the original.
- Both cards render correctly.
- The dashboard is marked modified.

#### CLIP-02: ⭐ A pasted card is genuinely independent of its source

| Field          | Value                                    |
| -------------- | ---------------------------------------- |
| Type           | gate                                     |
| Auto covered   | Y (`tests/unit/card-clone.spec.ts`)      |
| Pre-conditions | CLIP-01 completed — two copies of a card |

**Automated coverage confirms:**
`tests/unit/card-clone.spec.ts` proves the clipboard transforms deep-clone nested
branches, and carries a characterisation block demonstrating that the previous
shallow spread **aliased** them. It proves the transform in isolation; you are
checking that the guarantee survives the whole running application — the copy,
the paste, the store, the form and the YAML.

**Steps:**

1. Select the **pasted** copy from CLIP-01.
2. Change its **Name** to `UAT Copy Edited`.
3. In the Properties panel, change something **nested** — a tap action, or a
   style/colour value.
4. Now select the **original** card.
5. Read its name and the nested value you just changed on the copy.
6. Click **Edit YAML** and read both cards' entries.

**Expected:**

- The original still shows its own name, unchanged.
- ⭐ The nested value on the original is **unchanged**. If editing the copy
  changed the original, that is silent cross-card corruption — mark Fail and
  rate it **High**.
- The YAML shows two independent card entries, not a shared fragment.

#### CLIP-03: Cut removes the original and paste re-homes it

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| Type           | gate                                    |
| Auto covered   | Y (`tests/e2e/bulk-operations.spec.ts`) |
| Pre-conditions | A view with at least three cards        |

**Automated coverage confirms:**
`tests/e2e/bulk-operations.spec.ts` asserts the cut-move flow through the DSL.
It cannot tell you whether a card ever visibly disappears and fails to come back.

**Steps:**

1. Note the appearance of a specific card.
2. Right-click it and choose **Cut**.
3. Confirm it has left the canvas.
4. Right-click an empty area and choose **Paste**.
5. Compare the pasted card to what you noted in step 1.

**Expected:**

- The card disappears on Cut.
- Paste brings it back with its configuration intact.
- ⭐ At no point does the card vanish with no way to get it back. If a cut card
  cannot be pasted, that is data loss — **High**.
- `Ctrl+Z` after the cut also restores it.

#### CLIP-04: Multi-select and bulk property edit

| Field          | Value                                           |
| -------------- | ----------------------------------------------- |
| Type           | gate                                            |
| Auto covered   | Y (`tests/integration/bulk-operations.spec.ts`) |
| Pre-conditions | Three cards of the same type on one view        |

**Automated coverage confirms:**
`tests/integration/bulk-operations.spec.ts` proves a bulk property edit reaches
every selected card and preserves undo granularity. It cannot tell you whether
the multi-selection is **visible** — whether you can see what you are about to
change.

**Steps:**

1. Click the first card, then `Ctrl+Click` the second and third.
2. Look at the canvas — how are the selected cards indicated?
3. Read the Properties panel heading.
4. Change one shared property, for example an icon or a colour.
5. Look at all three cards.

**Expected:**

- All three cards are visibly marked as selected — you can tell at a glance.
- The Properties panel indicates it is editing multiple cards.
- The change applies to **all three**, not just the last-clicked one.
- Cards not selected are untouched.

#### CLIP-05: A bulk edit is a single undo step

| Field          | Value                                           |
| -------------- | ----------------------------------------------- |
| Type           | gate                                            |
| Auto covered   | Y (`tests/integration/bulk-operations.spec.ts`) |
| Pre-conditions | CLIP-04 completed                               |

**Automated coverage confirms:**
`tests/integration/bulk-operations.spec.ts` asserts the store records one history
entry per bulk edit — a spec that was `fixme` for months on a belief that turned
out to be wrong twice over. It asserts the store; you are asserting the keyboard.

**Steps:**

1. With the bulk edit from CLIP-04 applied, press `Ctrl+Z` **once**.
2. Look at all three cards.
3. Read the Properties panel without clicking anything else.
4. Press `Ctrl+Y` once.

**Expected:**

- ⭐ One press reverts **all three** cards together. If it takes three presses,
  mark Fail — **Medium**.
- ⭐ The Properties panel shows the **reverted** values, not the values you typed.
  A form still showing the edited value after an undo is the stale-form defect
  class — mark Fail, **Medium**.
- One redo press reapplies the edit to all three.

#### CLIP-06: Paste a card into a different view

| Field          | Value                              |
| -------------- | ---------------------------------- |
| Type           | edge                               |
| Auto covered   | N                                  |
| Pre-conditions | A dashboard with two or more views |

**Steps:**

1. On view 1, select a configured card and **Copy** it.
2. Switch to view 2.
3. Right-click empty canvas and choose **Paste**.
4. Switch back to view 1.
5. Edit the name of the card on view 2, then check view 1 again.

**Expected:**

- The card appears on view 2 with its configuration intact.
- The original is still on view 1 — copy does not move it.
- ⭐ Editing the view-2 copy leaves the view-1 original unchanged.
- Both views render correctly when switched between.

---

### Group 5 — Card Properties & Configuration

#### PROPS-01: Form edits reach the card immediately

| Field          | Value                                    |
| -------------- | ---------------------------------------- |
| Type           | gate                                     |
| Auto covered   | Y (`tests/e2e/properties-panel.spec.ts`) |
| Pre-conditions | A card selected                          |

**Automated coverage confirms:**
`tests/e2e/properties-panel.spec.ts` proves a form field change propagates to the
card model. It cannot tell you whether the canvas repaints promptly or whether
the app stalls while you type.

**Steps:**

1. Select a Button card.
2. Type a new **Name** and watch the canvas as you type.
3. Change the **Icon** to `mdi:lightbulb`.
4. Change a colour value.
5. Keep typing in a text field for several seconds.

**Expected:**

- The canvas card updates to match, without needing a save or a refresh.
- The icon changes to the one you chose.
- ⭐ The application stays responsive while you type — no freeze, no blank
  render. A blank canvas here is **High**.

#### PROPS-02: The Properties panel YAML tab shows and round-trips the card

| Field          | Value                                 |
| -------------- | ------------------------------------- |
| Type           | gate                                  |
| Auto covered   | Y (`tests/unit/yaml-service.spec.ts`) |
| Pre-conditions | A configured card selected            |

**Automated coverage confirms:**
`tests/unit/yaml-service.spec.ts` proves card-to-YAML and YAML-to-card
serialisation. It works on objects; you are checking the editor a person actually
uses.

**Steps:**

1. With a configured card selected, open the Properties panel **YAML** tab.
2. Read the YAML and compare it to what you set in the Form tab.
3. Change one value directly in the YAML.
4. Return to the **Form** tab.
5. Look at the canvas card.

**Expected:**

- The YAML reflects every property you set in the form.
- ⭐ No `_havdm_layout`, `_isSpacer` or other HAVDM-internal key that would
  confuse someone reading it — or if internal keys are shown here, they are
  clearly marked as HAVDM-only.
- Editing the YAML updates the form and the canvas.
- The two tabs never disagree about the card.

#### PROPS-03: The entity picker searches and completes real entity ids

| Field          | Value                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------- |
| Type           | gate                                                                                     |
| Auto covered   | Y (`tests/unit/EntityPicker.offline.spec.ts`, `tests/e2e/entity-picker-sources.spec.ts`) |
| Pre-conditions | A card with an Entity field selected. Works both connected and not.                      |

**Automated coverage confirms:**
`tests/unit/EntityPicker.offline.spec.tsx` proves the picker's source resolution
across live, cached and **never-connected** states, and now proves that with no
connection and no cache the field is a real text input that **accepts a
hand-typed entity id**. `tests/e2e/entity-picker-sources.spec.ts` drives the same
thing through the packaged renderer.
⚠ **A correction to this card's previous citation, worth reading before trusting
any `auto_covered` flag.** It used to cite `tests/unit/entityPickerSource.spec.ts`
and conceded only that the specs "cannot tell you whether typing into it feels
usable". The real gap was narrower and worse: the sibling spec asserted that the
**"Not Connected" hint appears** with an empty cache, and passed for the entire
life of the defect — because the hint was never the problem. One layer down, that
branch rendered an **empty `Select` with no options and no search**, so a
never-connected user could not enter an id at all. **A spec that asserts a
message beside a dead end certifies the message and says nothing about the dead
end.**

**Steps:**

1. Select a card with an **Entity** field.
2. Click the field and type `light`.
3. Read the suggestions offered.
4. Pick one from the list.
5. Clear the field and type a full entity id that does not exist, e.g.
   `sensor.definitely_not_real`.
6. ⭐ Now try it **with no Home Assistant connection at all** — ideally on a
   profile that has never connected, so there is no cached entity list either.
   Type `sensor.hand_typed_entity` into the field.

**Expected:**

- Typing filters the suggestions as you go, and **the words may be typed in any
  order** — "battery kia" finds "Kia EV6 Battery Level".
- A suggestion can be chosen with the mouse or the keyboard.
- The chosen id lands in the field and reaches the card.
- ⭐ A non-existent id is **accepted** — HAVDM is permissive when not connected —
  but is marked or warned about rather than silently treated as valid.
- ⭐ With no connection **and** no cached entities, the field is still **typable**
  and says plainly that it cannot validate. An empty, un-typable dropdown is a
  **fail**: it makes the card's own "works both connected and not" pre-condition
  impossible to satisfy.

#### PROPS-04: Configure a tap action

| Field          | Value                                                                           |
| -------------- | ------------------------------------------------------------------------------- |
| Type           | gate                                                                            |
| Auto covered   | Y (`tests/e2e/smart-actions.spec.ts`, `tests/unit/CardActionControls.spec.tsx`) |
| Pre-conditions | A Button card selected. No HA connection required.                              |

**Automated coverage confirms:**
`tests/e2e/smart-actions.spec.ts` drives the manual pickers from the form and
asserts the YAML bytes; `tests/unit/CardActionControls.spec.tsx` pins the option
list, the adaptive sub-fields and the sub-field pruning;
`tests/unit/smartActions.spec.ts` pins the resolution precedence. None of them
can judge whether the options presented make sense to a dashboard author.

**Steps:**

1. Select a Button card and find the **Actions** section in the Properties panel.
2. Switch **Use Smart Defaults** **off** — the manual Tap / Hold / Double-Tap
   pickers appear beneath it.
3. Read the options offered on **Tap Action**.
4. Choose **Toggle**, and check the YAML tab.
5. Change it to **Navigate** and look at what additional fields appear.
6. Change it to **Call Service**.
7. Change it back to **Not set (use Smart Defaults)**.

**Expected:**

- With Smart Defaults off, three pickers are offered: Tap, Hold and Double-Tap.
- Options include None, More Info, Toggle, Call Service, Navigate, URL, Popup.
- Choosing Toggle writes a toggle tap action into the YAML.
- Choosing Navigate reveals a navigation-path field; Call Service reveals a
  service field. The form adapts to the choice.
- Changing the action type does **not** leave the previous type's field behind in
  the YAML — switching Navigate → Call Service drops `navigation_path`.
- Choosing **Not set** removes the action from the YAML entirely, so Smart
  Defaults can apply again. The first choice is not a one-way door.
- No option leaves the form in a half-configured state with no way to complete it.

#### PROPS-05: Build a conditional-visibility rule and see it previewed

| Field          | Value                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------- |
| Type           | gate                                                                                     |
| Auto covered   | Y (`tests/e2e/conditional-visibility.spec.ts`, `tests/e2e/round1-final-honesty.spec.ts`) |
| Pre-conditions | A card selected. Use a card with **no entity set** for step 1.                           |

**Automated coverage confirms:**
`tests/e2e/conditional-visibility.spec.ts` proves a state-based rule applies,
updates live and persists to YAML; `tests/unit/conditionalVisibility.spec.ts`
covers the rule logic. Neither can judge whether the rule builder is
comprehensible.

⚠ **Round 1's coverage claim was FALSE and is corrected here.** That spec
assigns an entity to the card (`initialParsed.entity = 'light.living_room'`)
before opening the controls — so it **manufactured the exact precondition the
defect depended on** and could never have caught it. The controls were hidden
outright on a card with no entity, which is what "no conditions option for
Button card" meant. `tests/e2e/round1-final-honesty.spec.ts` now covers both the
no-entity case and choosing a condition entity with **no HA connection**.

**Steps:**

1. Add a **Button** card and select it **without setting an entity**, then find
   the conditional-visibility controls. They must be present — a visibility rule
   is about some _other_ entity's state, so the card needs no entity of its own.
2. Add a root condition.
3. Set it to a state condition on any entity, e.g. `light.kitchen` is `on`.
4. Read the preview area.
5. Add a **group** with a second condition inside it.
6. Check the card's YAML.

**Expected:**

- A condition can be added, configured and removed without the panel breaking.
- The preview states plainly whether the card would currently be visible.
- Nested groups are visually distinguishable from root-level conditions.
- The YAML carries the condition in Home Assistant's `visibility` form.

#### PROPS-06: Card spacing and layout gap controls

| Field          | Value                                                                          |
| -------------- | ------------------------------------------------------------------------------ |
| Type           | gate                                                                           |
| Auto covered   | Y (`tests/e2e/spacing.spec.ts`, `tests/e2e/canvas-resize-and-nesting.spec.ts`) |
| Pre-conditions | A stack or grid card on the canvas                                             |

**Automated coverage confirms:**
`tests/e2e/spacing.spec.ts` and `tests/unit/card-spacing.spec.ts` prove the
spacing values reach the config — but they perform **no drags at all**, which is
why they could not see the round-1 failure, where step 1 itself was impossible.
`tests/e2e/canvas-resize-and-nesting.spec.ts` now covers step 1: a palette card
dropped onto a stack must nest **inside** it rather than landing beside it on the
canvas. None of them can tell you whether the spacing you chose is what you see.

**Steps:**

1. Add a **Vertical Stack** card, then drag two cards from the palette **onto the
   stack itself** to nest them inside it. (Dropping onto empty canvas instead
   adds them beside the stack — that is the correct behaviour for an empty-canvas
   drop, not a nesting failure.)
2. Select the stack and find the layout gap control.
3. Choose a preset gap and watch the canvas.
4. Switch to the custom gap field and enter a clearly different value, e.g. `40px`.
5. Add a **Grid** card and set its row and column gaps separately.

**Expected:**

- The preset gap visibly changes the spacing between the nested cards.
- A custom value takes effect and is visibly different from the preset.
- Grid row and column gaps can be set independently and both take effect.
- Spacing on the canvas is proportionate to the value you entered.

#### PROPS-07: ⚠ The properties form is not stale after an undo

| Field          | Value                                           |
| -------------- | ----------------------------------------------- |
| Type           | gate                                            |
| Auto covered   | Y (`tests/integration/bulk-operations.spec.ts`) |
| Pre-conditions | A configured card selected                      |

**Automated coverage confirms:**
The unskipped bulk-operations integration test covers exactly this class: antd's
form `setFieldsValue` **merges**, so a key the reverted card no longer has was
once never cleared. That spec covers the bulk path; this card checks the single-card
path a person actually uses most.

**Steps:**

1. Select a Button card that has **no** name set.
2. Type `Temporary Name` into the **Name** field.
3. Press `Ctrl+Z`.
4. **Without clicking anything else**, read the Name field.
5. Click a different card, then click back to the first one and read Name again.

**Expected:**

- ⭐ After the undo, the Name field is **empty** — the value you typed is gone
  from the form, not just from the card. A form still showing `Temporary Name`
  is the stale-form defect — mark Fail, **Medium**.
- The canvas card also shows no name.
- Clicking away and back shows the same (empty) value.

---

### Group 6 — Views, Sections & Layout

#### VIEWS-01: Add a view

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| Type           | gate                                    |
| Auto covered   | Y (`tests/e2e/view-management.spec.ts`) |
| Pre-conditions | A dashboard open                        |

**Automated coverage confirms:**
`tests/e2e/view-management.spec.ts` covers view creation and switching. It cannot
tell you whether the new tab is usable or where focus lands.

**Steps:**

1. Click **Add view** at the right of the view tab strip.
2. Look at the tab strip.
3. Add a card to the new view.
4. Switch back to the first view and then forward again.

**Expected:**

- A new tab appears and becomes the active view.
- The new view's canvas is empty and ready for cards.
- Cards added to it stay on it — they do not appear on other views.
- Switching between views is immediate and keeps each view's contents.

#### VIEWS-02: Edit a view's title, path and icon

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| Type           | gate                                   |
| Auto covered   | Y (`tests/e2e/view-authoring.spec.ts`) |
| Pre-conditions | A dashboard with at least two views    |

**Automated coverage confirms:**
`tests/e2e/view-authoring.spec.ts` proves view metadata edits persist. It cannot
tell you whether re-opening the dialog shows current values — the defect class
that bit `ViewSettingsDialog` before.

**Steps:**

1. Select a view and click **Edit view**.
2. Set **Title** to `UAT View`, **Path** to `uat-view`, **Icon** to `mdi:home`.
3. Click **Save**.
4. Look at the view tab.
5. ⭐ Click **Edit view** again and read all three fields.
6. Change the title again, save, and re-open once more.

**Expected:**

- The tab label updates to `UAT View`.
- ⭐ Step 5: the dialog shows `UAT View`, `uat-view` and `mdi:home` — the
  **current** values, not the values from when the dialog first opened. Stale
  values here are **Medium**.
- The second edit is reflected on the third opening too.

#### VIEWS-03: Change a view's type, and see the warning before it happens

| Field          | Value                                       |
| -------------- | ------------------------------------------- |
| Type           | gate                                        |
| Auto covered   | Y (`tests/e2e/view-type-authoring.spec.ts`) |
| Pre-conditions | A view with a few cards on it               |

**Automated coverage confirms:**
`tests/e2e/view-type-authoring.spec.ts` covers view-type changes and the
conversion warning. It cannot judge whether the warning is understandable enough
to stop someone losing work.

**Steps:**

1. Open **Edit view** on a view that has cards.
2. Read the **Type** options offered.
3. Choose a different view type and read any warning shown **before** you save.
4. Save, then look at the canvas.
5. Press `Ctrl+Z`.

**Expected:**

- The type list offers HA's real view types plus the layout-card grid option.
- ⭐ If the change is lossy, a warning says so **before** saving, in plain
  language a non-expert would follow.
- After saving, the cards are still present — no card disappears silently. Cards
  lost without warning is **High**.
- Undo restores the previous view type and layout.

#### VIEWS-04: Author a sections view — add, rename, reorder, delete

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| Type           | gate                                    |
| Auto covered   | Y (`tests/e2e/sections-canvas.spec.ts`) |
| Pre-conditions | A Sections-view dashboard (FILE-02)     |

**Automated coverage confirms:**
`tests/e2e/sections-canvas.spec.ts` proves section-addressed selection, adding
palette cards into the selected section, multi-select delete and cut/paste
between sections. It cannot tell you whether dragging a section by its handle
works with a real mouse.

**Steps:**

1. On a sections dashboard, click **Add section**.
2. Type `Living Room` into the new section's heading field.
3. Add a card into that section from the palette.
4. Drag the section by its reorder handle to a different position.
5. Add a second section, then delete the first with its delete control.

**Expected:**

- Sections can be added, and each has its own heading field.
- A card added while a section is selected lands **in that section**, not
  elsewhere.
- Dragging by the handle reorders sections, and the cards travel with them.
- Deleting a section removes it and its cards, and does not disturb other
  sections.

#### VIEWS-05: Resize a card inside a section

| Field          | Value                             |
| -------------- | --------------------------------- |
| Type           | edge                              |
| Auto covered   | N                                 |
| Pre-conditions | A section with at least two cards |

**Steps:**

1. Hover the right edge of a card inside a section until a width handle appears.
2. Drag it wider, then release.
3. Hover the bottom edge and drag the card taller.
4. Change the section's **Columns wide** value.

**Expected:**

- Width and height handles are separately discoverable.
- Resizing snaps to the section's column grid rather than to arbitrary pixels.
- Other cards in the section reflow around the resized card.
- Changing **Columns wide** re-lays-out the section without losing any card.

#### VIEWS-06: Convert an ordinary view into a sections view

| Field          | Value                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| Type           | fidelity                                                                          |
| Auto covered   | Y (`tests/unit/sectionsLayout.spec.ts`, `tests/e2e/round1-final-honesty.spec.ts`) |
| Pre-conditions | A masonry/flat view with several **positioned** cards                             |

**Automated coverage confirms:**
`tests/unit/sectionsLayout.spec.ts` proves the sections geometry model. The known
limitation is that **convert-to-sections does not translate the original grid
geometry** — you are checking that HAVDM is honest about that rather than
pretending the layout survived.

⚠⚠ **ROUND-1 CORRECTION: step 2 named a control that does not exist here.** The
"Convert to Sections view" **banner on the canvas appears only when the view is
EMPTY**, so on a populated view there is nothing to click and the old step could
not be followed. Converting a populated view is done through **Edit view →
Type → Sections**, and that is the only path on which geometry is actually lost.
⭐ The dialog warns _before_ you save; round 1's real gap was that nothing
restated it _afterwards_ — the app said only "View updated".

**Steps:**

1. On a flat view with several positioned cards, note where each card sits.
2. Open **Edit view**, change **Type** to **Sections**, and read the warning
   shown before you save.
3. Save, then read the confirmation message.
4. Look at the resulting sections layout.
5. Press `Ctrl+Z`.

**Expected:**

- Every card from the flat view is present after the conversion — **none is
  lost**. A lost card is **High**.
- ⭐ The layout is **not** expected to be preserved exactly. What is expected is
  that HAVDM says so **twice**: the dialog warns before you save, and the
  confirmation afterwards names how many cards moved and that their positions
  were not carried over, pointing at `Ctrl+Z`. Silent geometric loss with no
  notice is **Medium**.
- Undo restores the original flat view and its positions.

#### VIEWS-07: Mark a view as a subview with a back path

| Field          | Value                                |
| -------------- | ------------------------------------ |
| Type           | gate                                 |
| Auto covered   | Y (`tests/unit/viewsLayout.spec.ts`) |
| Pre-conditions | A dashboard with two or more views   |

**Automated coverage confirms:**
`tests/unit/viewsLayout.spec.ts` and the view-key export contract prove
`subview` and `back_path` survive to the exported YAML — they were silently
dropped before slice F. You are checking the authoring surface, not the contract.

**Steps:**

1. Open **Edit view** on the second view.
2. Enable the **subview** toggle.
3. Set **Back path** to `/lovelace/0`.
4. Save, then re-open **Edit view**.
5. Click **Edit YAML** on the toolbar and find that view.

**Expected:**

- The subview toggle and back-path field are both present and editable.
- Re-opening shows both values as you set them.
- The dashboard YAML carries `subview: true` and the back path for that view.
- ⭐ Neither key is silently dropped. A dropped key here is **Medium** — it is
  exactly the data-loss class slice F removed.

#### VIEWS-08: The layout-card grid editor accepts raw CSS grid values

| Field          | Value                                       |
| -------------- | ------------------------------------------- |
| Type           | gate                                        |
| Auto covered   | Y (`tests/e2e/layout-card-editor.spec.ts`)  |
| Pre-conditions | A dashboard with at least one ordinary view |

**Automated coverage confirms:**
`tests/e2e/layout-card-editor.spec.ts` proves the grid editor appears only for a
real layout-card view, that edits round-trip, that converting warns first, and
that re-opening shows current values. It cannot judge whether raw CSS strings are
a reasonable thing to ask of a person.

**Steps:**

1. Open **Edit view** on an ordinary masonry view — confirm **no** grid editor
   is offered.
2. Change **Type** to the layout-card grid option, read the warning, and save.
3. Re-open **Edit view** — the grid editor should now be present.
4. Set **columns** to `repeat(3, 1fr)`, **rows** to `repeat(auto-fill, 56px)`,
   **gap** to `12px`. Save.
5. Re-open **Edit view** and read the three fields.
6. Enter deliberate nonsense in **columns**, e.g. `not-a-grid`, and save.
   ⚠ **Accepting it verbatim with no message is a PASS** — see the Expected
   below. Round 1 marked this Fail for "nonsense was accepted (no rejected
   message)", and the owner ruled that **not a defect**: the grid fields are raw
   CSS passed through to Home Assistant untouched, and silently rewriting what
   you typed is the thing this card is guarding against. Only mark Fail if the
   value comes back **changed**.

**Expected:**

- The grid editor is absent for a masonry view and present for a layout-card view.
- A warning appears before the type conversion.
- The three values round-trip exactly as typed — `repeat(3, 1fr)` is **not**
  rewritten or normalised. Named areas and `1fr 2fr 1fr` must survive verbatim.
- Nonsense input is either rejected with a clear message or accepted verbatim —
  but never silently rewritten into something you did not type.

---

### Group 7 — The YAML Editor & Split View

#### YAML-01: The Edit YAML dialog opens with the current dashboard

| Field          | Value                               |
| -------------- | ----------------------------------- |
| Type           | gate                                |
| Auto covered   | Y (`tests/e2e/yaml-editor.spec.ts`) |
| Pre-conditions | A dashboard with several cards      |

**Automated coverage confirms:**
`tests/e2e/yaml-editor.spec.ts` proves the entry point exists and the editor
renders. It cannot judge whether the Monaco editor is readable and scrollable at
the packaged window's real size.

**Steps:**

1. Click **Edit YAML** in the toolbar.
2. Read the dialog title and the editor contents.
3. Scroll to the bottom of the YAML.
4. Confirm syntax highlighting is applied.
5. Close the dialog without applying.

**Expected:**

- The dialog is titled **Edit Dashboard YAML** and shows the whole dashboard.
- The YAML matches what is on the canvas — every view and card is present.
- Highlighting is applied; the text is legible in the current theme.
- Closing without applying leaves the canvas untouched.

#### YAML-02: Invalid YAML is flagged and cannot be applied

| Field          | Value                                         |
| -------------- | --------------------------------------------- |
| Type           | gate                                          |
| Auto covered   | Y (`tests/integration/monaco-editor.spec.ts`) |
| Pre-conditions | The Edit YAML dialog open                     |

**Automated coverage confirms:**
`tests/integration/monaco-editor.spec.ts` and
`tests/unit/advanced-yaml-editor.spec.ts` prove validation fires on bad input.
They cannot tell you whether the error message helps you fix it.

**Steps:**

1. In the Edit YAML dialog, break the YAML — e.g. delete a colon from a key line,
   or add a stray `[`.
2. Read the validation indicator.
3. Try to click **Apply**.
4. Fix the YAML and read the indicator again.

**Expected:**

- An error indicator appears promptly and says what is wrong, ideally with a line.
- ⭐ **Apply is blocked while the YAML is invalid.** If broken YAML can be
  applied, that is invalid config presented as valid — **High**.
- Fixing the error clears the indicator and re-enables Apply.

#### YAML-03: Apply & Reload Canvas updates the dashboard

| Field          | Value                                           |
| -------------- | ----------------------------------------------- |
| Type           | gate                                            |
| Auto covered   | Y (`tests/integration/yaml-operations.spec.ts`) |
| Pre-conditions | The Edit YAML dialog open on a valid dashboard  |

**Automated coverage confirms:**
`tests/integration/yaml-operations.spec.ts` proves YAML parses back into the
dashboard model. It cannot tell you whether the canvas actually redraws.

**Steps:**

1. In the Edit YAML dialog, change a card's `name` to `From YAML`.
2. Click **Apply**.
3. Read the confirmation prompt and confirm.
4. Look at the canvas.
5. Select the changed card and read the Properties panel.

**Expected:**

- A confirmation prompt appears before the canvas is replaced.
- The canvas redraws and the card shows `From YAML`.
- The Properties panel form agrees with the YAML you applied.
- No other card changes.

#### YAML-04: Split view keeps canvas and YAML in step

| Field          | Value                                                              |
| -------------- | ------------------------------------------------------------------ |
| Type           | edge                                                               |
| Auto covered   | Y (`tests/e2e/split-view-yaml-sync.spec.ts`)                       |
| Pre-conditions | A dashboard with several cards **of at least two different types** |

**Automated coverage confirms:**
`tests/e2e/split-view-yaml-sync.spec.ts` drives the real Split mode and asserts
the highlighted YAML block by **line number and content** — selecting a card in a
mixed-type view highlights that card, a top-level card never resolves to one
nested inside a `vertical-stack`, focus stays on the canvas, and a palette drop
reaches the YAML pane with no manual refresh.
`tests/unit/yamlCardLocator.spec.ts` pins the locator itself, including its
"return nothing rather than guess" fail mode.
⚠ Neither can judge whether the two panes are **comfortable to work in** at the
packaged window size — expectation 1 is still human-only.

**Steps:**

1. Set the Visual/Split control to **Split**.
2. Look at the layout — canvas on one side, YAML on the other.
3. Select a card on the canvas and watch the YAML pane. ⚠ Use a view whose cards
   are **not all the same type**, and select the **second and third** cards, not
   only the first — the round-1 defect was invisible on the first card and on
   any view whose cards all shared one type.
4. Move a card on the canvas and watch the YAML pane again. ⚠ **Do not click
   "Sync from Visual"** — that button is a manual refresh, and the point of this
   step is that none should be needed.
5. Switch back to **Visual**.

**Expected:**

- Both panes are visible and usable at the packaged window's size.
- Selecting a card highlights **that card's** block in the YAML pane, whatever
  mix of card types the view holds. ⚠ A highlight left sitting on the
  previously-selected card is a **fail** — the round-1 symptom was a stale
  highlight, not a missing one.
- Selecting a card leaves the keyboard focus on the canvas; the cursor does not
  jump into the YAML editor.
- Moving a card updates the YAML pane **without** clicking "Sync from Visual".
- Switching back to Visual keeps every change made in Split mode.

#### YAML-05: Insert an entity id at the cursor from the entity browser

| Field          | Value                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| Type           | gate                                                                                                              |
| Auto covered   | Y (`tests/integration/yaml-entity-insert.spec.ts`, `tests/unit/entityInsertion.spec.ts`)                          |
| Pre-conditions | Entity list available (connected, or cached). Steps 1–5 use the **Edit YAML dialog**; step 6 uses **Split** view. |

**Automated coverage confirms:**
`tests/integration/yaml-entity-insert.spec.ts` drives both routes and asserts the
id lands **on the cursor's own line** — not merely that it appears somewhere in
the document. `tests/unit/entityInsertion.spec.ts` covers the refusal logic.
⚠ The round-1 citation (`tests/integration/entity-browser.spec.ts`) was **honest
but could not fail**: its one insert test places the cursor at the **end** of the
document, where "inserted at the cursor" and "appended at the end" produce
identical text, and it asserted only that the id appeared somewhere. That spec is
also the one **load-sensitive** integration spec in the suite.

⚠⚠ **Round-1 note — this card changed.** It was failed with "the entity browser
did not appear", and the screenshot showed the tester was in **Split view**, which
had **no entity-insert control at all**. Split view now has one, and step 6
exercises it deliberately. **Do not test this card from Split view for steps 1–5.**

**Steps:**

1. Open the **Edit YAML** dialog from the toolbar. ⚠ Make sure you are in the
   dialog — a modal titled "Edit Dashboard YAML" — and **not** in Split view.
2. **Without clicking into the editor first**, click **Insert Entity** — the
   left-most button in the row at the **bottom** of the dialog, beside Cancel and
   Apply Changes. Pick any entity, then look at the YAML.
3. Now click into the editor and place the cursor inside a card's `entity:` value.
4. Click **Insert Entity** again.
5. Search for and select an entity, then look at where the id landed.
6. Close the dialog, set the Visual/Split control to **Split**, click into the
   YAML pane to place a cursor, and use that pane's **Insert Entity** button.

**Expected:**

- The entity browser opens from within the YAML dialog.
- ⚠ **Step 2 — with no cursor ever placed, HAVDM refuses and says why** (it asks
  you to place the cursor first) and **the YAML is left completely unchanged**.
  Silently inserting the id at the top of the document is a **fail**, and it is a
  worse one than doing nothing: it overwrites the dashboard's `title:` line and
  the result is still _valid_ YAML, so nothing downstream flags it.
- The selected id is inserted **at the cursor**, not appended at the end or at
  the top.
- The YAML remains valid after the insertion.
- The dialog does not lose your other edits when the browser opens and closes.
- ⚠ **Step 6 — Split view has its own Insert Entity button** and it inserts at the
  cursor in the YAML pane. Its absence is a **fail**.

---

### Group 8 — Export Fidelity & Honest Marking

⭐ This group tests the product vision directly: HAVDM is a **superset design
tool** that translates what it can and honestly marks what it cannot. A card here
fails not only when output is wrong, but when output is quietly lossy.

#### EXPORT-01: Export for Home Assistant writes a YAML file

| Field          | Value                          |
| -------------- | ------------------------------ |
| Type           | interaction                    |
| Auto covered   | Y (`tests/unit/menu.spec.ts`)  |
| Pre-conditions | A dashboard with several cards |

**Automated coverage confirms:**
`tests/unit/menu.spec.ts` proves the File menu item exists and is wired to its
own channel, distinct from Save. It never opens the native save dialog or writes
a file.

**Steps:**

1. Choose **File → Export for Home Assistant...**.
2. In the native save dialog, save as `uat-export.yaml`.
3. Read the confirmation message.
4. Open the exported file — use **File → Open Dashboard...** to load it back into
   HAVDM.

**Expected:**

- A native save dialog opens with a sensible default filename.
- Export reports success.
- The exported file loads back into HAVDM without an error.
- Every view and card is present in the re-loaded dashboard.

#### EXPORT-02: HAVDM-internal keys do not reach the exported YAML

| Field          | Value                                                   |
| -------------- | ------------------------------------------------------- |
| Type           | fidelity                                                |
| Auto covered   | Y (`tests/unit/haExportContract.spec.ts`)               |
| Pre-conditions | A dashboard with positioned cards, exported (EXPORT-01) |

**Automated coverage confirms:**
`tests/unit/haExportContract.spec.ts` and `tests/unit/exportSelfCheck.spec.ts`
classify every card and view key as translate / strip / canvas-only, with a
compile-time guard that fails the build on an unclassified key. They assert
against the contract; you are reading the file a person would paste into Home
Assistant.

**Steps:**

1. Load `uat-export.yaml` from EXPORT-01 back into HAVDM.
2. Open **Edit YAML** and read the whole document.
3. Search the text for `_havdm`.
4. Search for `custom:grid-layout` on views you did not deliberately make
   layout-card views.

**Expected:**

- ⭐ No key beginning `_havdm` appears anywhere in the exported YAML.
- No `_isSpacer` or `_expanderDepth` key appears.
- HAVDM's own canvas scaffold view type does **not** leak — views you created
  normally should export as ordinary HA views.
- Everything remaining is a key Home Assistant would recognise.

#### EXPORT-03: A canvas-only card becomes a "Card Not Available" placeholder

| Field          | Value                                            |
| -------------- | ------------------------------------------------ |
| Type           | fidelity                                         |
| Auto covered   | Y (`tests/unit/CardPalette.canvasOnly.spec.tsx`) |
| Pre-conditions | A dashboard open                                 |

**Automated coverage confirms:**
`tests/unit/CardPalette.canvasOnly.spec.tsx` proves every canvas-only type is
flagged in the palette — including the `native-graph-card` regression, not just
`popup-card`. It cannot tell you what the **exported** file does with one.

**Steps:**

1. From **Layout** in the palette, add the **Popup Card (HAVDM-only)**.
2. Look at how the palette marked it before you added it.
3. Note the card's position and size on the canvas.
4. Choose **File → Export for Home Assistant...** and save as
   `uat-canvas-only.yaml`.
5. Load that file back in and find where the popup card was.

**Expected:**

- The palette marks the card as HAVDM canvas-only **before** you add it, with a
  plain-language tooltip.
- The card renders on the HAVDM canvas as a design-time concept.
- ⭐ In the export, it has become a **markdown** card reading "Card Not
  Available" — an HA-native card that will actually render.
- ⭐ It is **not** exported as `type: spacer` or as `custom:popup-card`, either of
  which would give Home Assistant an "Unknown type encountered" error tile. That
  outcome is **Medium**.
- The placeholder holds roughly the original slot, so the surrounding layout is
  not disturbed.

#### EXPORT-04: The palette marks unavailable cards honestly

| Field          | Value                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| Type           | fidelity                                                                                     |
| Auto covered   | Y (`tests/unit/CardPalette.availability.spec.tsx`, `tests/e2e/round1-final-honesty.spec.ts`) |
| Pre-conditions | ⚠ **Connected to Home Assistant** — steps 2 and 4 cannot be done otherwise.                  |

**Automated coverage confirms:**
`tests/unit/CardPalette.availability.spec.tsx` and
`tests/unit/capabilityProfile.spec.ts` prove the availability logic and its
permissive never-connected default. They cannot judge whether the marking is
comprehensible to a non-expert.

⚠⚠ **ROUND-1 CORRECTION — READ THIS BEFORE MARKING.** This card previously said
"Works connected or not", which was **wrong**, and round 1 was marked Fail with
"No cards marked Not Installed". With **no** connection HAVDM cannot know what
you have installed, so by design it shows every real card as available
(ratified vision answer 5 — a fresh or offline user is never blocked). **Nothing
being marked "Not Available" while disconnected is CORRECT, not a defect.**
⭐ What round 1 legitimately exposed is that the palette never _said_ so. It now
prints a plain-language notice in its footer when HAVDM has never connected.
⭐ **Canvas-only cards are marked regardless of connection** — that set is
profile-independent — so step 3 works either way.

**Steps:**

1. Open **Sensors & Display** in the palette. (Custom cards are filed by what
   they do and carry a **Custom** badge — there is no "Custom Cards" category.)
2. Hover a card marked **Not Available** and read the tooltip. ⚠ Requires a
   connection; if you are disconnected, read the palette footer notice instead
   and confirm it explains why nothing is marked.
3. Hover a card marked HAVDM canvas-only and read that tooltip.
4. Add a not-installed card to the canvas anyway.
5. Look for any banner or marking on the card once placed.

**Expected:**

- Not-installed and canvas-only cards are marked **differently** — they are
  different situations.
- Tooltips explain in plain language, naming HACS where relevant, without
  requiring the reader to know HAVDM's internals.
- ⭐ A not-installed card can still be **added and authored** — HAVDM does not
  hard-disable it. Blocking authoring here contradicts the product vision.
- Once placed, the card carries a visible "won't render on your instance" style
  marking.

#### EXPORT-05: Layout-card view keys survive the export

| Field          | Value                                     |
| -------------- | ----------------------------------------- |
| Type           | fidelity                                  |
| Auto covered   | Y (`tests/unit/layoutCardParser.spec.ts`) |
| Pre-conditions | The layout-card view from VIEWS-08        |

**Automated coverage confirms:**
`tests/unit/layoutCardParser.spec.ts` and `tests/unit/yaml-service.spec.ts` prove
`layout` and `layout_type` are carried only for real layout-card view types and
stripped for HAVDM's own scaffold. You are checking the file.

**Steps:**

1. Open the dashboard containing the layout-card view from VIEWS-08.
2. Choose **File → Export for Home Assistant...**, save as `uat-layout.yaml`.
3. Load that file back into HAVDM.
4. Open **Edit YAML** and find that view.
5. Open **Edit view** on it and read the grid editor.

**Expected:**

- The exported view keeps its `custom:...-layout` type and its `layout` block.
- The grid values are exactly what you typed in VIEWS-08 — `repeat(3, 1fr)` and
  the rest, character for character.
- Ordinary views in the same file carry no `layout` block.
- Re-opening the grid editor shows the same values.

#### EXPORT-06: A full round-trip loses nothing

| Field          | Value                                           |
| -------------- | ----------------------------------------------- |
| Type           | fidelity                                        |
| Auto covered   | Y (`tests/integration/yaml-operations.spec.ts`) |
| Pre-conditions | A dashboard with several views and varied cards |

**Automated coverage confirms:**
`tests/integration/yaml-operations.spec.ts` and
`tests/unit/yaml-service.spec.ts` prove parse and serialise round-trip at the
service level. ⭐ Slice F's lesson was that a round-trip claim needs a round-trip
test through the **real** path — this card is that test, performed by a person on
the packaged app.

**Steps:**

1. Build or open a dashboard with at least: two views, a stack card containing
   two cards, a card with a tap action, and a card with a conditional-visibility
   rule.
2. Note what each of those four things is set to.
3. Export for Home Assistant as `uat-roundtrip.yaml`.
4. Close the dashboard and open `uat-roundtrip.yaml`.
5. Check each of the four things you noted.
6. Export again as `uat-roundtrip-2.yaml` and open that too.

**Expected:**

- All views and cards survive both round-trips.
- The stack still contains both nested cards, in order.
- The tap action is intact.
- The visibility rule is intact.
- ⭐ The second round-trip is **stable** — nothing further degrades. Progressive
  loss across round-trips is **High**.

### Group 9 — Themes & Preset Marketplace

⭐ **No Home Assistant connection is required for any card in this group.**
Themes and presets are **local content**. HAVDM ships built-in themes and a
built-in preset catalog, and both are available with the app never connected.
Connecting to HA _adds_ that instance's themes alongside the built-ins; it is
never a precondition. In round 1 all four cards were Skipped because the product
gated this local content behind a connection — that was the defect (RC5), not the
environment. **These cards are deliberately NOT `needsHA` and stay in group 9.**

#### THEME-01: Theme Settings applies a theme and a light/dark mode

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| Type           | gate                                         |
| Auto covered   | Y (`tests/e2e/theme-manager.spec.ts`)        |
| Pre-conditions | A dashboard open. No HA connection required. |

**Automated coverage confirms:**
`tests/e2e/theme-manager.spec.ts` covers the import/export/load and per-view
override workflows. It cannot judge whether the theme actually looks applied.

**Steps:**

1. Open the Theme Settings dialog.
2. On the **Settings** tab, pick a theme from **Active Theme**.
3. Switch **Mode** between Light and Dark.
4. Look at the canvas cards as you switch.
5. Close and re-open the dialog.

**Expected:**

- A theme can be chosen and the canvas visibly reflects it.
- Light and Dark are both applied and visibly different.
- Card text stays legible against card backgrounds in both modes.
- Re-opening the dialog shows the theme and mode you selected.

#### THEME-02: Save a named theme and load it back

| Field          | Value                                                  |
| -------------- | ------------------------------------------------------ |
| Type           | gate                                                   |
| Auto covered   | Y (`tests/unit/theme-service.spec.ts`)                 |
| Pre-conditions | Theme Settings dialog open. No HA connection required. |

**Automated coverage confirms:**
`tests/unit/theme-service.spec.ts` proves the theme storage and retrieval logic.
It cannot tell you whether the manager tab is usable.

**Steps:**

1. On the **Manager** tab, type `UAT Theme` into the save-name field and save.
2. Change the active theme to something clearly different.
3. Select `UAT Theme` in **Saved Themes** and load it.
4. Look at the canvas.
5. Delete `UAT Theme`.

**Expected:**

- The saved name appears in the Saved Themes list.
- Loading it restores the appearance you saved.
- Deleting it removes it from the list.
- No confirmation step is missing before a delete that would lose a saved theme.

#### THEME-03: Per-view theme override

| Field          | Value                                                  |
| -------------- | ------------------------------------------------------ |
| Type           | gate                                                   |
| Auto covered   | Y (`tests/integration/theme-integration.spec.ts`)      |
| Pre-conditions | A dashboard with two views. No HA connection required. |

**Automated coverage confirms:**
`tests/integration/theme-integration.spec.ts` proves a per-view override is
stored and resolved. It cannot tell you whether you can see which view is
overridden.

**Steps:**

1. Select view 1 and set a per-view theme override in Theme Settings.
2. Switch to view 2.
3. Switch back to view 1.
4. Clear the override on view 1.

**Expected:**

- View 1 renders with the override; view 2 renders with the global theme.
- Switching between them applies the right theme each time, with no flash of the
  wrong one.
- The dialog indicates which view currently has an override.
- Clearing it returns view 1 to the global theme.

#### THEME-04: Browse, preview and import a preset

| Field          | Value                                        |
| -------------- | -------------------------------------------- |
| Type           | gate                                         |
| Auto covered   | Y (`tests/e2e/preset-marketplace.spec.ts`)   |
| Pre-conditions | A dashboard open. No HA connection required. |

**Automated coverage confirms:**
`tests/e2e/preset-marketplace.spec.ts` covers the browse → preview → import
workflow, and `tests/unit/preset-service.spec.ts` the catalog logic. Neither can
judge whether a preset is worth importing once you see it.

**Steps:**

1. In the **main toolbar at the top of the window** (not inside Theme Settings),
   click **Download** — or **Browse HA Dashboards** on the welcome screen — then
   switch to the **Preset Marketplace** tab in the dialog that opens.
2. Look at the preset list.
3. Select a preset and read the preview.
4. Click the refresh control.
5. Import the preset and look at the canvas.

**Expected:**

- Presets are listed with readable names.
- The preview shows enough to decide — a title and a representation of what you
  would get.
- Refresh does not clear or corrupt the list.
- Import adds the preset's cards to the dashboard without disturbing existing
  cards, and the result is undoable with `Ctrl+Z`.

---

### Group 10 — Version Control (read-only)

⭐ Slice E shipped six **read** operations. There is deliberately no commit,
stage, push or pull. A control that would write is a defect, not a gap.

⚠ **Windows: this group needs `git` installed and on `PATH`.** Without it the
cards below fail for an environmental reason, not a product one — except VCS-01,
which has a correct answer either way: HAVDM treats git-absent as a first-class
state and should say so plainly rather than erroring. Record which case you are in.

#### VCS-01: The Version Control dialog opens and explains itself

| Field          | Value                                    |
| -------------- | ---------------------------------------- |
| Type           | gate                                     |
| Auto covered   | Y (`tests/e2e/version-control.spec.ts`)  |
| Pre-conditions | App launched. ⚠ `git` on Windows' `PATH` |

**Automated coverage confirms:**
`tests/e2e/version-control.spec.ts` proves the panel is inert until opened, then
offers repository selection, explains itself before a repo is chosen, closes
cleanly and unmounts, and leaves the canvas and selection untouched. It cannot
judge whether the explanation is convincing.

**Steps:**

1. Choose **File → Version Control...**.
2. Read what the panel says before you have chosen a repository.
3. Close the dialog.
4. Re-open it.

**Expected:**

- The dialog opens from the menu.
- Before a repository is chosen it explains what the panel is for and offers a
  repository-selection control.
- ⭐ It states on screen that it never writes to your repository.
- Closing and re-opening starts fresh rather than showing stale state.

#### VCS-02: Designate a repository and read its branch and status

| Field          | Value                                                                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type           | gate                                                                                                                                                           |
| Auto covered   | Y (`tests/integration/version-control.spec.ts`)                                                                                                                |
| Pre-conditions | A git repository on a **Windows-visible** path with at least one uncommitted change. A repo under `\\wsl.localhost` works but is slow; a local clone is better |

**Automated coverage confirms:**
`tests/integration/version-control.spec.ts` proves validation failures return
typed errors and never reach git, and that the version-control write surface is
empty. It cannot run the native folder picker.

**Steps:**

1. In the Version Control dialog, click the repository-selection control.
2. In the native folder dialog, choose a git repository directory.
3. Read the repository path, branch name and working-tree status shown.
4. Make a change to a file in that repository outside HAVDM, then click the
   refresh control.

**Expected:**

- A native folder dialog opens; only a directory can be chosen.
- The panel shows the repository root, the current branch, and the changed files.
- Refresh picks up the change you made outside the app.
- The status is accurate — it matches what the repository actually looks like.

#### VCS-03: Read history and a file diff

| Field          | Value                                                               |
| -------------- | ------------------------------------------------------------------- |
| Type           | gate                                                                |
| Auto covered   | Y (`tests/unit/version-control-service.spec.ts`)                    |
| Pre-conditions | VCS-02 completed; a dashboard file open from inside that repository |

**Automated coverage confirms:**
`tests/unit/version-control-service.spec.ts` (70 tests) proves the argv builders,
the containment checks and the revision validation — most of it by asserting
**refusals**. It never invokes git.

**Steps:**

1. With a dashboard file open from inside the designated repository, look at the
   history table.
2. Read a few entries — hash, author, date, message.
3. Look at the diff area for the currently-open file.
4. Select a different commit in the history.

**Expected:**

- History lists real commits from that repository in a readable form.
- The diff shows the current file's changes, not another file's.
- Selecting a commit updates what is shown.
- Nothing hangs — if a command is slow it fails or completes, it does not leave
  the dialog spinning forever.

#### VCS-04: ⭐ The panel offers no way to write, and can forget the repository

| Field          | Value            |
| -------------- | ---------------- |
| Type           | edge             |
| Auto covered   | N                |
| Pre-conditions | VCS-02 completed |

**Steps:**

1. Read every control in the Version Control dialog.
2. Look specifically for anything offering to commit, stage, push, pull, fetch,
   checkout, reset or discard.
3. Click the forget-repository control.
4. Read what the panel shows afterwards.
5. Close the app entirely, relaunch, and re-open Version Control.

**Expected:**

- ⭐ **No control writes to the repository.** Any commit/push/stage/discard
  control present is a scope breach — mark Fail and rate it **High**, since it
  puts a user's repository at risk.
- Forgetting the repository returns the panel to its initial explain-yourself
  state.
- After a relaunch, a repository you designated and did not forget is remembered;
  one you forgot is not.

---

### Group 11 — ⚠ Live Home Assistant

⚠⚠ **Read the live-HA rules at the top of this plan before starting this group.**
`<HA_HOST>` is VPP-enrolled. The last two cards — **HA-08** and **HA-09** —
each name a button you must **not** press, and each carries teardown as a
numbered step. They run last deliberately, so the round ends with the instance
back the way it started. The matrix will not let you generate the summary report
until you confirm both are torn down.

If no Home Assistant instance is available, **Skip this whole group with the
reason "no HA instance available this sitting"** — every other group completes
without it.

#### HA-01: Connect to Home Assistant

| Field          | Value                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| Type           | interaction                                                                                                   |
| Auto covered   | Y (`tests/e2e/ha-connection.spec.ts`)                                                                         |
| Needs HA       | **Yes**                                                                                                       |
| Pre-conditions | HA URL and a long-lived access token to hand. Use `<HA_HOST_IP>` if `<HA_HOST>` does not resolve from Windows |

**Automated coverage confirms:**
`tests/e2e/ha-connection.spec.ts` drives the connection dialog against a mock.
⭐ **No automated layer in HAVDM has ever connected to a real Home Assistant
instance** — this card is the first real evidence that the connection path works.

**Steps:**

1. Click **Connect to HA**.
2. Enter the HA URL and the long-lived access token.
3. Tick the option to save the connection and give it a name, e.g. `UAT HA`.
4. Connect, and read the badge in the header.
5. Click **Disconnect**, then reconnect using the **saved connection** dropdown.

**Expected:**

- The dialog accepts a URL and a token, with the token masked.
- On success the badge changes to **Connected**. ⚠ The theme selector is present
  in the header whether or not you are connected (RC5 — HAVDM ships built-in
  themes); what changes on connect is that the instance's own themes join the
  list.
- The saved connection appears in the dropdown and reconnects without retyping
  the token.
- ⭐ A **wrong** token produces a clear error rather than a silent failure or a
  hang.

#### HA-02: Browse, search and select real entities

| Field          | Value                                                                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type           | gate                                                                                                                                                                                      |
| Auto covered   | Y (`tests/integration/entity-browser.spec.ts`, `tests/integration/entity-registry-picker.spec.ts`, `tests/unit/entityRegistry.spec.ts`, `tests/unit/haWebSocketService.registry.spec.ts`) |
| Needs HA       | **Yes**                                                                                                                                                                                   |
| Pre-conditions | Connected (HA-01)                                                                                                                                                                         |

**Automated coverage confirms:**
`tests/integration/entity-browser.spec.ts` covers the browser and its insert
path against fixture data. `tests/integration/entity-registry-picker.spec.ts`
adds integration grouping, the diagnostic/config cut, its reversibility and its
survival across a restart. `tests/unit/haWebSocketService.registry.spec.ts`
asserts the `config/entity_registry/list` **wire frame** against rows captured
from a real instance, because an IPC-layer mock cannot see a wrong command name.
⚠ None of them has seen a real instance's ~725 entities.

⚠ **THIS CARD PASSED IN ROUND 1 AND ITS BEHAVIOUR HAS DELIBERATELY CHANGED
TWICE — once before this round, and again now.** Nothing below is a regression:
(a) the browser now prefers the **live** connection and falls back to the cached
list, where it previously read the cache **only** — so a freshly-added entity
appears without a manual refresh;
(b) search is now **multi-token and order-independent**, where it previously
required every word to appear contiguously inside one field;
(c) ⭐ **NEW: the tab strip has a "Group by: Domain | Integration" switch, and
entities Home Assistant marks `diagnostic` or `config` are HIDDEN BY DEFAULT**
behind a "Show diagnostic & config" tick-box.
**Steps 3, 5 and 7 exercise these on purpose.** Judge the card against the
Expected below, not against how round 1 behaved.

**Steps:**

1. Click **Entities** in the header.
2. Read the entity count and the domain filter tabs. ⭐ Note the
   **"Showing N of M"** text beside the tick-box — on a large instance M is much
   larger than N.
3. Type `light` into the search box. ⭐ Then type two words from a single
   entity's friendly name **in the wrong order** — e.g. for "Kia EV6 Battery
   Level", type `battery kia`.
4. Switch to a specific domain tab, e.g. `sensor`.
5. ⭐ **NEW: set _Group by_ to _Integration_.** Read the tab strip, then pick one
   integration's tab.
6. Select an entity and click the select/confirm button.
7. ⭐ **NEW: tick _Show diagnostic & config_, then untick it again.**
8. Click the refresh control.

**Expected:**

- Real entities from the instance are listed, with id, friendly name, state and
  domain.
- The count is plausible for the instance (hundreds, not a handful). ⓘ It is now
  **smaller than round 1** because diagnostic and config entities are hidden by
  default — the "Showing N of M" text must say so rather than leaving the
  difference unexplained.
- Search narrows the list responsively even with hundreds of rows.
- ⭐ Words typed in **any order** still find the entity. `battery kia` must match
  "Kia EV6 Battery Level".
- Domain tabs filter correctly and show per-domain counts.
- ⭐ **Grouping by Integration produces one tab per integration**, named readably
  (e.g. "Bureau Of Meteorology", not `bureau_of_meteorology`) with a count,
  biggest first — and the `sensor` haystack is visibly broken up. Selecting an
  integration tab shows only that integration's entities.
- ⭐ **Ticking "Show diagnostic & config" brings the hidden entities back, and
  unticking hides them again.** A cut you cannot reverse is a **fail**, and so is
  an entity that disappears without the count admitting it.
- Refresh re-fetches without emptying or duplicating the list.
- ⓘ Entities Home Assistant's registry does not know about — on a typical
  instance `sun.sun`, `zone.home` and YAML template sensors — must **still be
  listed**, under "Not in the entity registry" when grouped by integration. Any
  of them going missing is a **fail**.

#### HA-03: Download an existing dashboard from Home Assistant

| Field          | Value                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Type           | interaction                                                                                           |
| Auto covered   | Y (`tests/unit/dashboardLoadDiagnostics.spec.ts`, `tests/integration/dashboard-load-honesty.spec.ts`) |
| Needs HA       | **Yes** — read-only                                                                                   |
| Pre-conditions | Connected                                                                                             |

**Automated coverage confirms:**
`tests/unit/dashboardLoadDiagnostics.spec.ts` pins the plain-language wording of
every load failure, including the default-dashboard case, and
`tests/integration/dashboard-load-honesty.spec.ts` drives the real load seam and
proves a refused dashboard reports the refusal and leaves the canvas intact.

⚠ **Round-1 correction.** This card previously cited
`tests/e2e/live-preview-deploy.spec.ts` as its coverage. That file is **26 tests
of `expect(true).toBe(true)` with 85 TODOs and zero real assertions**, so HA-03
in fact had **no** automated coverage while being marked `auto_covered: Y` —
which silently exempted it from amendment-03 §7. Neither spec above reads a real
storage-mode dashboard; that still needs a human.

⚠ **This card only reads.** Do not save, deploy or modify the dashboard you
download.

**Steps:**

1. Click **Download** (or **Browse HA Dashboards**).
2. Read the list of dashboards and their metadata.
3. ⭐ **Try the "Overview" entry tagged _Default_ first.** On most instances
   Home Assistant still generates this dashboard automatically and stores no
   copy, so HAVDM cannot download it — the point of this step is to check that
   it says so clearly.
4. Now choose a **different** dashboard and download it.
5. Look at the canvas, the view tabs and the heading.
6. Scan the canvas for cards that failed to render.

**Expected:**

- Real dashboards from the instance are listed, with titles and any admin-only
  marking.
- ⭐ **Step 3:** if "Overview" cannot be downloaded, HAVDM says so in plain
  language — naming the dashboard, explaining that Home Assistant builds it
  automatically, and telling you to use **"Take control"** in Home Assistant
  first. A raw Home Assistant error such as _"No config found."_ is a **fail**.
  ⓘ If your Overview dashboard has already been taken control of, it will simply
  download like any other — that is also a pass.
- Downloading one loads it onto the canvas.
- ⭐ **A dashboard that cannot be loaded is never reported as loaded.** A green
  "loaded successfully" message over an empty or unchanged canvas is **High**.
  A refused dashboard must leave whatever was already open untouched.
- ⭐ Cards that HAVDM cannot render show a **marked** placeholder, not a crash
  and not a blank space. A blank canvas here is **High**.
- HACS cards installed on the instance (Bubble, apexcharts, mushroom, button-card,
  card-mod, mini-graph-card and the rest) render as something recognisable.
- Nothing is written back to Home Assistant.

#### HA-04: Detect and remap missing entities

| Field          | Value                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------- |
| Type           | gate                                                                                        |
| Auto covered   | Y (`tests/e2e/entity-remapping.spec.ts`)                                                    |
| Needs HA       | **Yes** — read-only                                                                         |
| Pre-conditions | Connected; a dashboard referencing at least one entity that does not exist on this instance |

**Automated coverage confirms:**
`tests/e2e/entity-remapping.spec.ts` and `tests/unit/entityRemapping.spec.ts`
prove auto-mapping updates the YAML. They work against fixture entity lists, not
a real instance's naming.
`tests/e2e/entity-picker-sources.spec.ts` proves the remap path reads the
**persisted offline cache** and that entities present in the entity list are
**not** reported missing.
⚠ Round 1's failure had **one** root cause behind all three of its symptoms: the
remap path was the only one of HAVDM's four entity pickers that never read the
offline cache, so with no live connection it saw **zero** entities — and
`detectMissing` treats an empty list as "nothing exists" rather than "I do not
know what exists", so it reported **every** referenced entity as missing, then
offered "No data" as each replacement and had nothing for Auto-map to do.

**Steps:**

1. Open a dashboard, then edit one card's entity to something that does not
   exist, e.g. `light.does_not_exist_uat`.
2. Click **Remap** in the toolbar.
3. Read what the dialog reports as missing.
4. Choose a replacement entity from the dropdown for that entity.
5. Apply, then check the card on the canvas and in the YAML.
6. Look at the **History** tab of the remapping dialog.
7. ⭐ Now **disconnect from Home Assistant** (or start from a profile that has
   connected before, so a cached entity list exists) and click **Remap** again on
   a dashboard whose entities all really do exist.

**Expected:**

- The missing entity is detected and listed.
- Real entities from the instance populate the replacement dropdown.
- Applying updates the card and the YAML to the new entity id.
- The history tab records the remap.
- ⭐ Entities that **do** exist are not touched.
- ⭐ Disconnected but with a cached entity list, the dialog still offers real
  replacement entities. **"No data" in the replacement dropdown is a fail.**
- ⭐⭐ Disconnected, entities that exist are **not** listed as missing. HAVDM
  claiming your entities are gone when it simply cannot see your instance is a
  **fail**, and a worse one than an empty dropdown — it is a false statement about
  the user's Home Assistant, and remapping on the strength of it would rewrite a
  working config.

#### HA-05: Card availability reflects what is actually installed

| Field          | Value                                     |
| -------------- | ----------------------------------------- |
| Type           | fidelity                                  |
| Auto covered   | Y (`tests/unit/hacsRepositories.spec.ts`) |
| Needs HA       | **Yes** — read-only                       |
| Pre-conditions | Connected                                 |

**Automated coverage confirms:**
`tests/unit/hacsRepositories.spec.ts` and `tests/unit/capabilityProfile.spec.ts`
prove the HACS repository parsing and the capability profile resolution against
fixtures. They have never queried a real HACS installation.

**Steps:**

1. While connected, expand the Card Palette categories. (Custom cards are filed
   by what they do — **Layout**, **Sensors & Display**, **Controls**, **Media**
   — and carry a **Custom** badge, so there is no "Custom Cards" category.)
2. Find a card you know **is** installed on the instance — for example
   Bubble Card, apexcharts, mushroom, button-card, card-mod or mini-graph-card.
3. Find a card you know is **not** installed — for example layout-card,
   expander/accordion, gauge-card-pro or power-flow-card.
4. Compare how the two are marked.
5. Disconnect, and look at the same two cards again.

**Expected:**

- An installed card is shown as available, with no "not installed" marking.
- A card that is genuinely absent from the instance is marked as not installed,
  in plain language mentioning HACS.
- ⭐ The marking matches reality. A card marked available that is not installed
  would let someone deploy a dashboard that will not render — **Medium**.
- ⭐ After disconnecting, the marking is **permissive** again — HAVDM does not
  claim knowledge it no longer has.

#### HA-06: Themes are fetched from the instance

| Field          | Value                                                    |
| -------------- | -------------------------------------------------------- |
| Type           | gate                                                     |
| Auto covered   | Y (`tests/integration/theme-integration-mocked.spec.ts`) |
| Needs HA       | **Yes** — read-only                                      |
| Pre-conditions | Connected                                                |

**Automated coverage confirms:**
`tests/integration/theme-integration-mocked.spec.ts` proves theme fetching and
selection against a mocked WebSocket. It has never read a real instance's theme
list.

**Steps:**

1. While connected, open the theme selector in the header.
2. Read the list of themes offered.
3. Select one and look at the canvas.
4. Click the theme refresh control (**Reload Themes from HA**).
5. Disconnect and look at the header again.

**Expected:**

- Real themes from the Home Assistant instance are listed **in addition to**
  HAVDM's own built-in themes (the ones prefixed `HAVDM`). Seeing only built-ins
  while connected means the fetch failed.
- Selecting one applies it visibly to the canvas.
- Refresh re-fetches without emptying the list.
- ⭐ After disconnecting, the selector **remains** and still offers the built-in
  themes — it is no longer gated on the connection (RC5). What must go is the
  instance's own themes, and **Reload Themes from HA** becomes disabled with a
  tooltip explaining why. The app does not error.

---

#### HA-07: The Deploy dialog states what was adjusted for Home Assistant

| Field          | Value                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------- |
| Type           | fidelity                                                                                    |
| Auto covered   | Y (`tests/unit/DeployDialog.spec.tsx`)                                                      |
| Needs HA       | **Yes** — read-only, you cancel                                                             |
| Pre-conditions | Connected; a dashboard containing at least one canvas-only card or a HAVDM-only styling key |

**Automated coverage confirms:**
`tests/unit/DeployDialog.spec.tsx` proves the export summary renders when
warnings exist and is absent when they do not, and
`tests/unit/exportWarningSummary.spec.ts` covers the wording. Neither can judge
whether the summary would stop a person deploying something they did not mean to.

⚠ **This card does not deploy.** You open the dialog, read it, and cancel.

**Steps:**

1. Ensure the dashboard contains a canvas-only card (from EXPORT-03).
2. Click **Deploy** in the toolbar.
3. Read the banner headed **"This design was adjusted for Home Assistant"**.
4. Read each line in it.
5. Click **Cancel** — **do not deploy**.

**Expected:**

- The summary banner appears and lists the adjustments.
- Each line is plain language — it names what was changed and why, without
  referring to HAVDM internals or key names a user would not recognise.
- The banner is styled as a warning when something was genuinely lost, rather
  than as neutral information.
- Cancelling closes the dialog and writes nothing.

---

#### HA-08: ⚠ Live Preview creates a temporary dashboard — and Close deletes it

| Field          | Value                                          |
| -------------- | ---------------------------------------------- |
| Type           | interaction                                    |
| Auto covered   | Y (`tests/unit/livePreviewDeploy.spec.ts`)     |
| Needs HA       | **Yes — creates a temporary dashboard**        |
| Pre-conditions | Connected; a dashboard with several cards open |

**Automated coverage confirms:**
`tests/unit/livePreviewDeploy.spec.ts` proves the deploy target resolution never
silently defaults to `lovelace` and that the confirmation names the destination.
It resolves targets in memory; it never creates anything in Home Assistant.

⚠⚠ **DO NOT PRESS "Deploy to Production" inside Live Preview.** That writes the
temporary dashboard back over the production dashboard the design came from,
which amendment-03 §4 forbids. Use **Close** only.

**Steps:**

1. With a dashboard open and connected, click **Live Preview**.
2. Read the message about the temporary dashboard being created.
3. Look at the embedded Home Assistant view — compare it to the HAVDM canvas.
4. Switch between views using the preview's view switcher, and toggle between
   **Edit Mode** and **Preview Mode**.
5. **Click Close to exit Live Preview.** Read the confirmation.
6. **Teardown — required:** in a browser, open Home Assistant → **Settings →
   Dashboards** and confirm **no HAVDM temporary dashboard remains**. If one
   does, delete it there.

**Expected:**

- Live Preview reports creating a temporary dashboard and enters preview mode.
- ⭐ The embedded Home Assistant render is recognisably the dashboard you
  designed — this is the single most valuable observation in the round. Note any
  card that renders differently from the HAVDM canvas.
- The view switcher moves between views, and the Edit Mode / Preview Mode
  toggle switches between arranging cards and previewing — neither state
  leaves the embedded view blank.
- Close reports the temporary dashboard was deleted.
- ⭐ Step 6 confirms it: **no temporary dashboard is left behind.** One left
  behind is **High** — it is an unrequested persistent write to Home Assistant.

#### HA-09: ⚠ Deploy to a throwaway dashboard, verify it, then delete it

| Field          | Value                                                               |
| -------------- | ------------------------------------------------------------------- |
| Type           | interaction                                                         |
| Auto covered   | Y (`tests/unit/DeployDialog.spec.tsx`)                              |
| Needs HA       | **Yes — creates a throwaway dashboard**                             |
| Pre-conditions | Connected; a dashboard with several cards, at least one view titled |

**Automated coverage confirms:**
`tests/unit/DeployDialog.spec.tsx` proves the dialog sends the sanitised config
object unchanged bar the title, and errors clearly when there is no config. It
mocks the WebSocket entirely — nothing has ever reached a real instance.

⚠⚠ **Use "Create New Dashboard" mode only, with URL key `havdm-uat-temp`. Never
"Update Existing Dashboard".** Authorised for this round as a bounded extension
of amendment-03 §4; teardown at step 8 is mandatory.

**Steps:**

1. Click **Deploy** in the toolbar.
2. Select **Create New Dashboard**.
3. Set **Dashboard Title** to `HAVDM UAT Temp`, **URL Key** to `havdm-uat-temp`,
   **Icon** to `mdi:test-tube`.
4. Read the export-summary banner if one is shown, then deploy.
5. Watch the progress steps and read the completion message.
6. In a browser, open Home Assistant and navigate to the new dashboard.
7. Compare what Home Assistant renders against the HAVDM canvas.
8. **Teardown — required:** in Home Assistant, go to **Settings → Dashboards**,
   find **HAVDM UAT Temp**, and **delete it**. Confirm it is gone from the
   sidebar.

**Expected:**

- The URL key field rejects an invalid key (try `Bad Key!` first) with a clear
  message naming the allowed characters.
- The deploy runs through its progress steps and reports success.
- The dashboard exists in Home Assistant at `havdm-uat-temp` with the title and
  icon you set.
- ⭐ The rendered dashboard matches the HAVDM canvas — same views, same cards,
  laid out recognisably. Note every difference; this is the core fidelity
  observation of the round.
- ⭐ No card shows "Unknown type encountered" in Home Assistant. If one does,
  HAVDM exported a type HA cannot render — **Medium**, or **High** if the card is
  one HAVDM claimed was available.
- ⭐ Step 8 completes: **the throwaway dashboard is deleted.** Any existing
  dashboard being modified instead of a new one being created is **High**.

## Closing the round

1. Every card carries a verdict. **No card is left Untested** — a card you chose
   not to run is a **Skip with a reason**, which is a decision.
2. Every Fail has a severity, an observed-vs-expected note and a screenshot.
3. ⚠ Confirm both live-HA artifacts are gone: the Live Preview temporary
   dashboard (HA-08) and `havdm-uat-temp` (HA-09). The matrix blocks the summary
   report until you confirm this.
4. Click **Generate Test Summary Report** → commit to `docs/testing/uat/reports/`.
5. Click **Export JSON** → commit to `docs/testing/uat/sessions/`. This populates
   the previous-round dots next round.

### The pass bar — amendment-03 §3.1, fixed before the round ran

1. **Zero open High-severity defects.** No exceptions.
2. Every Medium either fixed or explicitly accepted **in writing** in
   `docs/releases/RELEASE_NOTES_v1.0.0.md` under Known Issues.
3. Lows recorded; deferral permitted.
4. Every defect that failed a card marked `auto_covered: false` gains automated
   coverage as part of its fix.
5. No card left Untested.

Meeting it releases v1.0.0. Missing it keeps the version at `0.7.5-beta.10` until
the remediation list clears.

---

## Round composition

| Group                                      | Cards  |
| ------------------------------------------ | ------ |
| 1 — Application Shell & First Run          | 4      |
| 2 — Creating, Opening & Saving Dashboards  | 6      |
| 3 — Card Authoring on the Canvas           | 7      |
| 4 — Clipboard, Multi-Select & State Safety | 6      |
| 5 — Card Properties & Configuration        | 7      |
| 6 — Views, Sections & Layout               | 8      |
| 7 — The YAML Editor & Split View           | 5      |
| 8 — Export Fidelity & Honest Marking       | 6      |
| 9 — Themes & Preset Marketplace            | 4      |
| 10 — Version Control (read-only)           | 4      |
| 11 — ⚠ Live Home Assistant                 | 9      |
| **Total**                                  | **66** |

| Type        | Cards |
| ----------- | ----- |
| gate        | 41    |
| interaction | 9     |
| edge        | 8     |
| fidelity    | 8     |

| Property                                              | Cards                                            |
| ----------------------------------------------------- | ------------------------------------------------ |
| `auto_covered: true` (each names a real spec file)    | 57                                               |
| `auto_covered: false` (the card is the only evidence) | 9                                                |
| `needsHA: true` (all in group 11)                     | 9                                                |
| Creates something in Home Assistant                   | 2 — HA-08 and HA-09, both with numbered teardown |

⭐ 57 of 66 cards are `auto_covered`. That is the point of the ratio, not a
weakness of it: the automated suites already prove the logic, so most of this
round is a human checking the **observable product** the suites cannot see — the
packaged artifact, the real Home Assistant path, and whether the output is
correct rather than merely well-formed.

**Previous round:** none. This is round 1, so `PREV` is empty and every
previous-round dot is grey.
