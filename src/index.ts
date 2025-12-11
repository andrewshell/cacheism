import { Hit, Miss, Data, Status, Type } from './common.js';
import { createFilesystemStore } from './store-filesystem.js';
import { createMemoryStore, type Store } from './store-memory.js';

function sanitize(string: string): string {
  return string.replaceAll(/[^a-z0-9]+/gi, '-');
}

export class Cacheism {
  store: Store;
  status = Status;
  type = Type;

  constructor(store: Store) {
    this.store = store;
  }

  async go(
    cacheDomain: string,
    cachePath: string,
    status: number,
    callback: (existing: Hit | Miss) => Promise<unknown>
  ): Promise<Hit | Miss> {
    // Input validation
    if (typeof cacheDomain !== 'string') {
      throw new TypeError('cacheDomain must be a string');
    }
    if (typeof cachePath !== 'string') {
      throw new TypeError('cachePath must be a string');
    }
    if (typeof status !== 'number' || status < 0 || status > 3) {
      throw new TypeError('status must be a valid Status value (0-3)');
    }
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }

    const name = this.cacheName(cacheDomain, cachePath);
    let existing: Hit | Miss = new Miss(name, 'Missing cache', 0);
    const hasCache = await this.store.isset(name);

    if (hasCache) {
      existing = (await this.store.get(name)).response();
    }

    let response: Hit | Miss;

    try {
      if (status >= Status.preferCache && hasCache && existing.isHit) {
        response = existing;
      } else if (status === Status.onlyCache) {
        throw new Error('Missing cache');
      } else {
        const result = await callback(existing);
        if (result instanceof Hit) {
          response = result;
        } else {
          response = new Hit(name, result);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.toString() : String(err);

      if (status >= Status.cacheOnFail && hasCache && existing.isHit) {
        response = existing as Hit;
        response.error = errorMessage;
        response.errorTime = new Date();
        response.consecutiveErrors++;
      } else {
        response = new Miss(name, errorMessage, existing.consecutiveErrors + 1);
      }
    }

    await this.store.set(Data.fromResponse(response));
    Object.freeze(response);
    return response;
  }

  cacheName(cacheDomain: string, cachePath: string): string {
    return `${sanitize(cacheDomain)}/${sanitize(cachePath)}`;
  }

  setStore(store: Store): void {
    this.store = store;
  }

  hit(name: string, data: unknown, etag?: string): Hit {
    return new Hit(name, data, etag);
  }

  miss(name: string, error: string): Miss {
    return new Miss(name, error, 0);
  }

  // Static members for backward compatibility
  static Hit = Hit;
  static Miss = Miss;
  static Data = Data;
  static Status = Status;
  static Type = Type;

  static store = {
    filesystem: createFilesystemStore,
    memory: createMemoryStore,
  };
}

// Named exports for ESM users
export { Hit, Miss, Data, Status, Type };
export { createFilesystemStore, createMemoryStore };
export type { Store } from './store-memory.js';
export type { FilesystemStoreConfig } from './store-filesystem.js';
export type { MemoryStoreConfig, MemoryStore } from './store-memory.js';

// Default export for backward compatibility
export default Cacheism;
