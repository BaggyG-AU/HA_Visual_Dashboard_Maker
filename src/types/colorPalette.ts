export interface ColorPalette {
  id: string;
  name: string;
  description?: string;
  colors: string[];
  createdAt: number;
  updatedAt: number;
  isDefault: boolean;
}

export interface ColorPaletteStorage {
  version: number;
  palettes: ColorPalette[];
  activePaletteId?: string;
}

export type PaletteImportResult = {
  added: number;
  errors: string[];
};
