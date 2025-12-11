import { Data } from './common.js';

export interface Store {
  get(cacheName: string): Promise<Data>;
  set(data: Data): Promise<void>;
  isset(cacheName: string): Promise<boolean>;
  unset(cacheName: string): Promise<void>;
}

export interface MemoryStore extends Store {
  data: Record<string, string>;
}

export interface MemoryStoreConfig {
  // Currently no config options, but allows future expansion
}

export function createMemoryStore(_config?: MemoryStoreConfig): MemoryStore {
  const storeMemory: MemoryStore = {
    data: {},

    async get(cacheName: string): Promise<Data> {
      return Data.parse(storeMemory.data[cacheName]);
    },

    async set(data: Data): Promise<void> {
      storeMemory.data[data.cacheName] = data.stringify();
    },

    async isset(cacheName: string): Promise<boolean> {
      return storeMemory.data[cacheName] != null;
    },

    async unset(cacheName: string): Promise<void> {
      delete storeMemory.data[cacheName];
    }
  };

  return storeMemory;
}

export default createMemoryStore;
