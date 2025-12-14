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
   * Save file with dialog
   */
  async saveFileAs(content: string, defaultPath?: string): Promise<boolean> {
    const filePath = await this.saveFileDialog(defaultPath);

    if (!filePath) {
      return false;
    }

    const result = await this.writeFile(filePath, content);

    if (!result.success) {
      throw new Error(result.error || 'Failed to write file');
    }

    return true;
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
