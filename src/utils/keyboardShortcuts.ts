/**
 * Which keyboard shortcuts survive focus being inside a text field.
 *
 * App's global keydown handler used to bail out of EVERY shortcut whenever the
 * event target was an `<input>`, `<textarea>` or a contentEditable node. That is
 * right for the shortcuts a text field genuinely owns — Delete must remove a
 * character, Ctrl+C/X/V must be the text clipboard — but it is wrong for undo
 * and redo, which are APPLICATION-level history commands.
 *
 * The concrete failure (CANVAS-07, v1.0.0 UAT round 1, High): the user deleted a
 * card, typed in the Card Palette search box to find its replacement, pressed
 * Ctrl+Z, and got a character of their search text removed while the deleted
 * card stayed gone. The undo stack was healthy the whole time — the Undo button
 * in the header restored the card from that identical focus state. Only the
 * keystroke was being swallowed.
 *
 * ⚠ The distinction is NOT "input vs not an input". It is "does this field own a
 * document the user would expect Ctrl+Z to walk back?". A Card Palette search
 * box is a transient FILTER: its contents are not user data, nothing persists
 * it, and no one undoes their way back through a search term. A card property
 * field or the YAML editor is the opposite — there Ctrl+Z must keep meaning
 * "undo my typing".
 *
 * That is a judgement per call site, not something to infer from the DOM, so a
 * field opts IN explicitly by carrying `data-shortcut-passthrough`. Defaulting
 * to the safe behaviour means a new input added later keeps native text undo
 * until someone deliberately decides otherwise.
 */

/** Marks an input whose content is a transient filter, not an edited document. */
export const SHORTCUT_PASSTHROUGH_ATTR = 'data-shortcut-passthrough';

/** True when the event target is a text-entry surface of any kind. */
export const isTextEntryTarget = (target: HTMLElement | null): boolean => {
  if (!target) return false;
  return (
    target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable === true
  );
};

/** True for Ctrl/Cmd+Z (undo). Shift+Z is redo, not undo. */
export const isUndoShortcut = (event: KeyboardEvent): boolean =>
  (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z';

/** True for Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z (redo). */
export const isRedoShortcut = (event: KeyboardEvent): boolean => {
  if (!event.ctrlKey && !event.metaKey) return false;
  const key = event.key.toLowerCase();
  return key === 'y' || (event.shiftKey && key === 'z');
};

/**
 * Ctrl+<letter> matchers for the shortcuts App's global handler owns.
 *
 * ⚠⚠ WHY THESE EXIST AT ALL: the handler used to compare `event.key === 's'`
 * (and 'c' / 'x' / 'v') INLINE and CASE-SENSITIVELY. `event.key` carries the
 * CHARACTER PRODUCED, not the physical key — so with CAPS LOCK ON a real
 * keyboard reports 'S', the comparison failed, and Save, Copy, Cut and Paste
 * silently did nothing. Undo and redo were unaffected because
 * `isUndoShortcut` / `isRedoShortcut` above already lowercase the key, so the
 * app's behaviour under Caps Lock was inconsistent with itself.
 *
 * Found while writing FILE-05's coverage: `press('Control+S')` delivers
 * `key: 'S'`, which is exactly the Caps Lock case, and the save leg failed
 * against it while `press('Control+s')` passed.
 *
 * ⚠ DELIBERATELY `ctrlKey` ONLY, NOT `ctrlKey || metaKey`, even though the
 * undo/redo predicates accept both. Every one of these call sites listened for
 * Ctrl alone before this change; accepting Cmd would newly bind Cmd+S/C/X/V on
 * macOS, which is a behaviour widening this change was not asked to make and
 * nothing here tests. Recorded as an open item instead.
 */
const isCtrlLetter = (event: KeyboardEvent, letter: string): boolean =>
  event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === letter;

/** True for Ctrl+S (save). */
export const isSaveShortcut = (event: KeyboardEvent): boolean => isCtrlLetter(event, 's');

/** True for Ctrl+C (copy). */
export const isCopyShortcut = (event: KeyboardEvent): boolean => isCtrlLetter(event, 'c');

/** True for Ctrl+X (cut). */
export const isCutShortcut = (event: KeyboardEvent): boolean => isCtrlLetter(event, 'x');

/** True for Ctrl+V (paste). */
export const isPasteShortcut = (event: KeyboardEvent): boolean => isCtrlLetter(event, 'v');

/**
 * Should the app's global keydown handler process this event at all?
 *
 * Outside a text field: always. Inside one: only for undo/redo, and only when
 * that field has opted out of owning them via `data-shortcut-passthrough`.
 * Every other shortcut (Ctrl+S, Ctrl+C/X/V, Delete) stays guarded in ALL text
 * fields, including opted-in ones.
 */
export const shouldHandleGlobalShortcut = (
  event: KeyboardEvent,
  target: HTMLElement | null,
): boolean => {
  if (!isTextEntryTarget(target)) return true;
  if (!isUndoShortcut(event) && !isRedoShortcut(event)) return false;
  return target?.closest(`[${SHORTCUT_PASSTHROUGH_ATTR}]`) != null;
};
