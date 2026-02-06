export interface EntityContextVariable {
  raw: string;
  expression: string;
  start: number;
  end: number;
}

export interface EntityContextFilter {
  name: string;
  args?: string[];
}
