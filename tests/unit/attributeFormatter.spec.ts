import { describe, it, expect } from 'vitest';
import { formatAttributeValue, detectFormatType } from '../../src/services/attributeFormatter';

describe('attributeFormatter', () => {
  it('formats numbers with precision and unit', () => {
    const result = formatAttributeValue(97.4, { type: 'number', precision: 0, unit: '%' });
    expect(result).toBe('97 %');
  });

  it('formats booleans with custom labels', () => {
    const result = formatAttributeValue(true, { type: 'boolean', trueLabel: 'Yes', falseLabel: 'No' });
    expect(result).toBe('Yes');
  });

  it('formats strings with truncation', () => {
    const result = formatAttributeValue('This is a long string', { type: 'string', maxLength: 7 });
    expect(result).toBe('This is...');
  });

  it('formats timestamps with absolute mode', () => {
    const date = new Date('2025-01-01T12:30:00.000Z');
    const result = formatAttributeValue(date, { type: 'timestamp', timestampMode: 'absolute' }, new Date('2025-01-01T12:31:00.000Z'));
    expect(result).toContain('2025');
  });

  it('formats timestamps with relative mode', () => {
    const date = new Date('2025-01-01T12:30:00.000Z');
    const result = formatAttributeValue(date, { type: 'timestamp', timestampMode: 'relative' }, new Date('2025-01-01T12:30:30.000Z'));
    expect(result).toBe('30s ago');
  });

  it('formats arrays and objects as json', () => {
    const result = formatAttributeValue({ a: 1 }, { type: 'json' });
    expect(result).toContain('"a": 1');
  });

  it('detects type from raw values', () => {
    expect(detectFormatType('12.3')).toBe('number');
    expect(detectFormatType('2025-01-01T00:00:00.000Z')).toBe('timestamp');
    expect(detectFormatType(true)).toBe('boolean');
    expect(detectFormatType({})).toBe('json');
  });
});
