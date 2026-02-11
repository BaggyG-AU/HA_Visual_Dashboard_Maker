import { describe, expect, it } from 'vitest';
import {
  getPopupModalDimensions,
  MAX_POPUP_DEPTH,
  normalizePopupConfig,
  popupStackService,
  resolvePopupFromAction,
} from '../../src/features/popup/popupService';

describe('popupService', () => {
  it('normalizes popup config defaults', () => {
    const config = normalizePopupConfig(undefined);
    expect(config.title).toBe('Popup');
    expect(config.size).toBe('medium');
    expect(config.close_on_backdrop).toBe(true);
    expect(config.backdrop_opacity).toBe(0.45);
    expect(config.show_header).toBe(true);
    expect(config.cards).toEqual([]);
  });

  it('clamps backdrop opacity and normalizes custom size', () => {
    const config = normalizePopupConfig({
      title: 'Room',
      size: 'custom',
      custom_size: { width: 801.9, height: 499.2 },
      backdrop_opacity: 2,
    });
    expect(config.backdrop_opacity).toBe(1);
    expect(config.custom_size).toEqual({ width: 801, height: 499 });
  });

  it('resolves popup action payload', () => {
    const resolved = resolvePopupFromAction({
      action: 'popup',
      popup_title: 'Controls',
      popup_size: 'small',
      popup_cards: [{ type: 'markdown', content: 'Hi' }],
    });
    expect(resolved).not.toBeNull();
    expect(resolved?.title).toBe('Controls');
    expect(resolved?.size).toBe('small');
    expect(resolved?.cards).toHaveLength(1);
  });

  it('returns null for non-popup action', () => {
    expect(resolvePopupFromAction({ action: 'toggle' })).toBeNull();
  });

  it('provides dimensions for all size modes', () => {
    const small = getPopupModalDimensions(normalizePopupConfig({ size: 'small' }));
    const fullscreen = getPopupModalDimensions(normalizePopupConfig({ size: 'fullscreen' }));
    const custom = getPopupModalDimensions(normalizePopupConfig({
      size: 'custom',
      custom_size: { width: 900, height: 600 },
    }));

    expect(small.width).toBe(480);
    expect(fullscreen.width).toBeUndefined();
    expect(custom.width).toBe(900);
    expect(custom.bodyMaxHeight).toContain('px');
  });

  it('enforces popup stack max depth', () => {
    popupStackService.clear();
    const ids: Array<string | null> = [];
    for (let i = 0; i < MAX_POPUP_DEPTH + 1; i += 1) {
      ids.push(popupStackService.open(normalizePopupConfig({ title: `Popup ${i + 1}` })));
    }
    const openedIds = ids.filter((id): id is string => typeof id === 'string');
    expect(openedIds).toHaveLength(MAX_POPUP_DEPTH);
    expect(ids[MAX_POPUP_DEPTH]).toBeNull();
    popupStackService.clear();
  });
});
