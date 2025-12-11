import path from 'node:path';
import fs from 'node:fs';
import { readFile, writeFile, rm } from 'node:fs/promises';
import { Data } from './common.js';
import type { Store } from './store-memory.js';

export interface FilesystemStoreConfig {
  datadir: string;
}

function mkdir(dirpath: string): void {
  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath, { recursive: true });
  }
}

export function createFilesystemStore(config: FilesystemStoreConfig): Store {
  mkdir(config.datadir);

  return {
    async get(cacheName: string): Promise<Data> {
      const filename = path.resolve(config.datadir, `${cacheName}.json`);
      const data = await readFile(filename, 'utf8');
      return Data.parse(data);
    },

    async set(data: Data): Promise<void> {
      const filename = path.resolve(config.datadir, `${data.cacheName}.json`);
      mkdir(path.dirname(filename));
      await writeFile(filename, data.stringify(), 'utf8');
    },

    async isset(cacheName: string): Promise<boolean> {
      const filename = path.resolve(config.datadir, `${cacheName}.json`);
      return fs.existsSync(filename);
    },

    async unset(cacheName: string): Promise<void> {
      const filename = path.resolve(config.datadir, `${cacheName}.json`);
      await rm(filename, { force: true });
    }
  };
}

export default createFilesystemStore;
