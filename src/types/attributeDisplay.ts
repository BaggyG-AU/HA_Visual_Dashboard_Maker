export type AttributeFormatType = 'number' | 'boolean' | 'string' | 'timestamp' | 'json';

export type AttributeTimestampMode = 'relative' | 'absolute';

export interface AttributeFormatConfig {
  type: AttributeFormatType;
  precision?: number;
  unit?: string;
  trueLabel?: string;
  falseLabel?: string;
  maxLength?: number;
  timestampMode?: AttributeTimestampMode;
}

export interface AttributeDisplayItem {
  attribute: string;
  label?: string;
  format?: AttributeFormatConfig;
}

export type AttributeDisplayLayout = 'inline' | 'stacked' | 'table';
