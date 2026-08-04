/**
 * File Service
 * Provides file operations using Electron IPC
 */

export interface FileResult {
  success: boolean;
  content?: string;
  error?: string;
}

export interface DialogResult {
  canceled: boolean;
  filePath?: string;
}

class FileService {
  /**
   * Open file dialog and return selected file path
   */
  async openFile(): Promise<string | null> {
    const result: DialogResult = await window.electronAPI.openFileDialog();

    if (result.canceled || !result.filePath) {
      return null;
    }

    return result.filePath;
  }

  /**
   * Open file dialog, read the file, and return its content
   */
  async openAndReadFile(): Promise<{ filePath: string; content: string } | null> {
    const filePath = await this.openFile();

    if (!filePath) {
      return null;
    }

    const result = await this.readFile(filePath);

    if (!result.success || !result.content) {
      throw new Error(result.error || 'Failed to read file');
    }

    return { filePath, content: result.content };
  }

  /**
   * Save file dialog and return selected file path
   */
  async saveFileDialog(defaultPath?: string): Promise<string | null> {
    const result: DialogResult = await window.electronAPI.saveFileDialog(defaultPath);

    if (result.canceled || !result.filePath) {
      return null;
    }

    return result.filePath;
  }

  /**
   * Read file content
   */
  async readFile(filePath: string): Promise<FileResult> {
    return await window.electronAPI.readFile(filePath);
  }

  /**
   * Write content to file
   */
  async writeFile(filePath: string, content: string): Promise<FileResult> {
    return await window.electronAPI.writeFile(filePath, content);
  }

  /**
   * Save file with dialog. Returns the path WRITTEN, or null if the user
   * cancelled the dialog.
   *
   * ⭐⭐ F7 / UAT defect FILE-06: THIS USED TO RETURN A BARE `boolean`, AND
   * THROWING THE PATH AWAY CAUSED BOTH HALVES OF THE DEFECT.
   *
   *  1. The caller could not register the file in Recent Files, because it was
   *     never told what the file was. `addRecentFile` consequently had exactly
   *     two call sites — File > Open and Open Recent — and **Save As never
   *     registered anything**, which is precisely what the tester reported.
   *  2. Worse, and not in the original triage: the caller could not RETARGET the
   *     document either. The store's `filePath` is written only by
   *     `loadDashboard`, so after "Save As B.yaml" the document still pointed at
   *     A.yaml — and the next Ctrl+S wrote the user's edits back to **A**.
   *
   * Returning the path is the whole fix for both. ⚠ Callers that save something
   * which is NOT the document under edit (the HA export, gradient presets) take
   * the path and deliberately ignore it — see their own comments.
   */
  async saveFileAs(content: string, defaultPath?: string): Promise<string | null> {
    const filePath = await this.saveFileDialog(defaultPath);

    if (!filePath) {
      return null;
    }

    const result = await this.writeFile(filePath, content);

    if (!result.success) {
      throw new Error(result.error || 'Failed to write file');
    }

    return filePath;
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    const result = await window.electronAPI.fileExists(filePath);
    return result.exists;
  }
}

// Export singleton instance
export const fileService = new FileService();
