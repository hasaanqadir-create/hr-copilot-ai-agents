import { env } from '../../config/env';
import { StorageProvider } from './types';
import { LocalStorageProvider } from './localStorageProvider';

let cached: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (cached) return cached;

  switch (env.storageProvider) {
    case 'local':
      cached = new LocalStorageProvider();
      break;
    case 'cloudinary':
      // Phase enhancement: implement CloudinaryStorageProvider here when ready.
      throw new Error(
        'Cloudinary storage not yet implemented. Set STORAGE_PROVIDER=local or add CloudinaryStorageProvider.'
      );
    default:
      throw new Error(`Unknown STORAGE_PROVIDER: ${env.storageProvider}`);
  }

  return cached;
}
