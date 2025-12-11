import path from 'node:path';
import fs from 'node:fs';
import { readFile, writeFile, rm } from 'node:fs/promises';
import { Data } from './common.js';
import type { Store } from './store-memory.js';

export interface FilesystemStoreConfig {
  datadir: string;
}

async function mkdir(dirpath: string): Promise<void> {
  await fs.promises.mkdir(dirpath, { recursive: true });
}

export function createFilesystemStore(config: FilesystemStoreConfig): Store {
  return {
    async get(cacheName: string): Promise<Data> {
      const filename = path.resolve(config.datadir, `${cacheName}.json`);
      const data = await readFile(filename, 'utf8');
      return Data.parse(data);
    },

    async set(data: Data): Promise<void> {
      const filename = path.resolve(config.datadir, `${data.cacheName}.json`);
      await mkdir(path.dirname(filename));
      await writeFile(filename, data.stringify(), 'utf8');
    },

    async isset(cacheName: string): Promise<boolean> {
      const filename = path.resolve(config.datadir, `${cacheName}.json`);
      try {
        await fs.promises.access(filename);
        return true;
      } catch {
        return false;
      }
    },

    async unset(cacheName: string): Promise<void> {
      const filename = path.resolve(config.datadir, `${cacheName}.json`);
      await rm(filename, { force: true });
    }
  };
}

export default createFilesystemStore;
