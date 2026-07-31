import { describe, it, expect } from 'vitest';
import {
  SHORTCUT_PASSTHROUGH_ATTR,
  isTextEntryTarget,
  isUndoShortcut,
  isRedoShortcut,
  isSaveShortcut,
  isCopyShortcut,
  isCutShortcut,
  isPasteShortcut,
  shouldHandleGlobalShortcut,
} from '../../src/utils/keyboardShortcuts';

/**
 * CANVAS-07 (v1.0.0 UAT round 1, High). The rule under test is deliberately
 * narrow: undo/redo pass through an opted-in text field, and NOTHING ELSE does.
 * Most of these cases are control legs for that scoping — a fix that let every
 * shortcut through would satisfy the headline case and break text editing.
 */
const key = (init: Partial<KeyboardEvent> & { key: string }): KeyboardEvent =>
  ({
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    ...init,
  }) as KeyboardEvent;

const el = (html: string): HTMLElement => {
  const host = document.createElement('div');
  host.innerHTML = html;
  return host.firstElementChild as HTMLElement;
};

describe('keyboardShortcuts', () => {
  describe('isTextEntryTarget', () => {
    it('detects inputs, textareas and contentEditable', () => {
      expect(isTextEntryTarget(el('<input />'))).toBe(true);
      expect(isTextEntryTarget(el('<textarea></textarea>'))).toBe(true);
      const ce = el('<div></div>');
      Object.defineProperty(ce, 'isContentEditable', { value: true });
      expect(isTextEntryTarget(ce)).toBe(true);
    });

    it('is false for ordinary elements and for null', () => {
      expect(isTextEntryTarget(el('<div></div>'))).toBe(false);
      expect(isTextEntryTarget(el('<button></button>'))).toBe(false);
      expect(isTextEntryTarget(null)).toBe(false);
    });
  });

  describe('isUndoShortcut / isRedoShortcut', () => {
    it('recognises undo on both Ctrl and Cmd', () => {
      expect(isUndoShortcut(key({ key: 'z', ctrlKey: true }))).toBe(true);
      expect(isUndoShortcut(key({ key: 'Z', metaKey: true }))).toBe(true);
    });

    it('does not mistake redo for undo', () => {
      expect(isUndoShortcut(key({ key: 'z', ctrlKey: true, shiftKey: true }))).toBe(false);
      expect(isRedoShortcut(key({ key: 'z', ctrlKey: true, shiftKey: true }))).toBe(true);
      expect(isRedoShortcut(key({ key: 'y', ctrlKey: true }))).toBe(true);
    });

    it('requires a modifier — a bare z or y is typing', () => {
      expect(isUndoShortcut(key({ key: 'z' }))).toBe(false);
      expect(isRedoShortcut(key({ key: 'y' }))).toBe(false);
    });
  });

  /**
   * FILE-05. `event.key` is the CHARACTER PRODUCED, not the physical key, so
   * with Caps Lock on a real keyboard reports 'S' for Ctrl+S. App's handler
   * compared `event.key === 's'` inline and case-sensitively, so Save, Copy,
   * Cut and Paste silently did nothing in that state — while undo and redo kept
   * working, because their predicates already lowercased.
   */
  describe('isSaveShortcut / isCopyShortcut / isCutShortcut / isPasteShortcut', () => {
    const cases: Array<[string, (e: KeyboardEvent) => boolean, string]> = [
      ['save', isSaveShortcut, 's'],
      ['copy', isCopyShortcut, 'c'],
      ['cut', isCutShortcut, 'x'],
      ['paste', isPasteShortcut, 'v'],
    ];

    it.each(cases)('%s matches the lowercase key', (_name, predicate, letter) => {
      expect(predicate(key({ key: letter, ctrlKey: true }))).toBe(true);
    });

    // ⭐ THE DEFECT. Without lowercasing, every one of these is false.
    it.each(cases)('%s ALSO matches the uppercase key (Caps Lock)', (_name, predicate, letter) => {
      expect(predicate(key({ key: letter.toUpperCase(), ctrlKey: true }))).toBe(true);
    });

    // ⭐ CONTROL LEGS — the scoping. A fix that merely lowercased without
    // keeping the other conditions would newly bind Ctrl+Shift+V and bare
    // typing, so these are what stop the fix from over-reaching.
    it.each(cases)(
      '%s requires Ctrl — bare typing is not a shortcut',
      (_name, predicate, letter) => {
        expect(predicate(key({ key: letter }))).toBe(false);
      },
    );

    it.each(cases)('%s does NOT fire with Shift held', (_name, predicate, letter) => {
      expect(predicate(key({ key: letter, ctrlKey: true, shiftKey: true }))).toBe(false);
    });

    it.each(cases)('%s does not match a different letter', (_name, predicate, letter) => {
      const other = letter === 'q' ? 'w' : 'q';
      expect(predicate(key({ key: other, ctrlKey: true }))).toBe(false);
    });

    // ⚠ Deliberately Ctrl-only, unlike isUndoShortcut/isRedoShortcut which also
    // accept Cmd. Every call site listened for Ctrl alone before this change,
    // and binding Cmd+S/C/X/V on macOS would be a widening nothing here asked
    // for. Pinned so the asymmetry is a decision rather than an oversight.
    it.each(cases)('%s does NOT accept Cmd, by design', (_name, predicate, letter) => {
      expect(predicate(key({ key: letter, metaKey: true }))).toBe(false);
    });
  });

  describe('shouldHandleGlobalShortcut', () => {
    const plainInput = () => el('<input />');
    const passthroughInput = () => el(`<input ${SHORTCUT_PASSTHROUGH_ATTR} />`);
    const wrapped = () => {
      const host = document.createElement('div');
      host.innerHTML = `<div ${SHORTCUT_PASSTHROUGH_ATTR}><input /></div>`;
      return host.querySelector('input') as HTMLElement;
    };

    it('handles every shortcut outside a text field', () => {
      const div = el('<div></div>');
      expect(shouldHandleGlobalShortcut(key({ key: 'z', ctrlKey: true }), div)).toBe(true);
      expect(shouldHandleGlobalShortcut(key({ key: 'Delete' }), div)).toBe(true);
      expect(shouldHandleGlobalShortcut(key({ key: 'c', ctrlKey: true }), div)).toBe(true);
    });

    it('THE DEFECT: undo/redo pass through an opted-in field', () => {
      expect(shouldHandleGlobalShortcut(key({ key: 'z', ctrlKey: true }), passthroughInput())).toBe(
        true,
      );
      expect(shouldHandleGlobalShortcut(key({ key: 'y', ctrlKey: true }), passthroughInput())).toBe(
        true,
      );
    });

    it('finds the marker on an ANCESTOR, not just the input itself', () => {
      expect(shouldHandleGlobalShortcut(key({ key: 'z', ctrlKey: true }), wrapped())).toBe(true);
    });

    // ⭐ CONTROL LEGS — the scoping. Without these, a fix that simply removed
    // the guard would pass the case above and silently break text editing.
    it('does NOT pass through undo in an ordinary text field', () => {
      expect(shouldHandleGlobalShortcut(key({ key: 'z', ctrlKey: true }), plainInput())).toBe(
        false,
      );
      expect(shouldHandleGlobalShortcut(key({ key: 'z', ctrlKey: true }), el('<textarea/>'))).toBe(
        false,
      );
    });

    it('does NOT pass through Delete, clipboard or Save — even when opted in', () => {
      const opted = passthroughInput();
      expect(shouldHandleGlobalShortcut(key({ key: 'Delete' }), opted)).toBe(false);
      expect(shouldHandleGlobalShortcut(key({ key: 'c', ctrlKey: true }), opted)).toBe(false);
      expect(shouldHandleGlobalShortcut(key({ key: 'x', ctrlKey: true }), opted)).toBe(false);
      expect(shouldHandleGlobalShortcut(key({ key: 'v', ctrlKey: true }), opted)).toBe(false);
      expect(shouldHandleGlobalShortcut(key({ key: 's', ctrlKey: true }), opted)).toBe(false);
    });

    it('does not treat ordinary typing in an opted-in field as a shortcut', () => {
      expect(shouldHandleGlobalShortcut(key({ key: 'z' }), passthroughInput())).toBe(false);
      expect(shouldHandleGlobalShortcut(key({ key: 'a' }), passthroughInput())).toBe(false);
    });
  });
});
