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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Future expansion
export interface MemoryStoreConfig {}

export function createMemoryStore(_config?: MemoryStoreConfig): MemoryStore {
  const storeMemory: MemoryStore = {
    data: {},

    get(cacheName: string): Promise<Data> {
      return Promise.resolve(Data.parse(storeMemory.data[cacheName]));
    },

    set(data: Data): Promise<void> {
      storeMemory.data[data.cacheName] = data.stringify();
      return Promise.resolve();
    },

    isset(cacheName: string): Promise<boolean> {
      return Promise.resolve(cacheName in storeMemory.data);
    },

    unset(cacheName: string): Promise<void> {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete storeMemory.data[cacheName];
      return Promise.resolve();
    }
  };

  return storeMemory;
}

export default createMemoryStore;
