import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { env } from '../../config/env';
import { StorageProvider, StoredFile } from './types';

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), env.uploadDir);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async save(buffer: Buffer, originalName: string): Promise<StoredFile> {
    const ext = path.extname(originalName);
    const fileName = `${uuid()}${ext}`;
    const fullPath = path.join(this.uploadDir, fileName);
    await fs.promises.writeFile(fullPath, buffer);
    return { path: fileName, fileName: originalName };
  }

  resolve(storedPath: string): string {
    return path.join(this.uploadDir, storedPath);
  }
}
