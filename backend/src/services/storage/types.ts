export interface StoredFile {
  /** Path or URL used to retrieve the file later */
  path: string;
  fileName: string;
}

export interface StorageProvider {
  save(buffer: Buffer, originalName: string): Promise<StoredFile>;
  /** Returns an absolute path/URL the rest of the app can use to read the file */
  resolve(path: string): string;
}
