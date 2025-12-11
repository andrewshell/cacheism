/*!
 * etag
 * Copyright(c) 2014-2016 Douglas Christopher Wilson
 * MIT Licensed
 */

import { createHash } from 'node:crypto';
import { Stats } from 'node:fs';

export interface EtagOptions {
  weak?: boolean;
}

/**
 * Generate an entity tag.
 */
function entitytag(entity: string | Buffer): string {
  if (entity.length === 0) {
    // fast-path empty
    return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';
  }

  // compute hash of entity
  const hashObj = createHash('sha1');
  if (typeof entity === 'string') {
    hashObj.update(entity, 'utf8');
  } else {
    hashObj.update(entity);
  }
  const hash = hashObj.digest('base64').substring(0, 27);

  // compute length of entity
  const len = typeof entity === 'string'
    ? Buffer.byteLength(entity, 'utf8')
    : entity.length;

  return '"' + len.toString(16) + '-' + hash + '"';
}

/**
 * Determine if object is a Stats object.
 */
function isstats(obj: unknown): obj is Stats {
  // genuine fs.Stats
  if (typeof Stats === 'function' && obj instanceof Stats) {
    return true;
  }

  // quack quack
  return obj != null && typeof obj === 'object' &&
    'ctime' in obj && Object.prototype.toString.call((obj as Stats).ctime) === '[object Date]' &&
    'mtime' in obj && Object.prototype.toString.call((obj as Stats).mtime) === '[object Date]' &&
    'ino' in obj && typeof (obj as Stats).ino === 'number' &&
    'size' in obj && typeof (obj as Stats).size === 'number';
}

/**
 * Generate a tag for a stat.
 */
function stattag(stat: Stats): string {
  const mtime = stat.mtime.getTime().toString(16);
  const size = stat.size.toString(16);

  return '"' + size + '-' + mtime + '"';
}

/**
 * Create a simple ETag.
 */
export function etag(entity: string | Buffer | Stats, options?: EtagOptions): string {
  if (entity == null) {
    throw new TypeError('argument entity is required');
  }

  // support fs.Stats object
  const isStats = isstats(entity);
  const weak = options && typeof options.weak === 'boolean'
    ? options.weak
    : isStats;

  // validate argument
  if (!isStats && typeof entity !== 'string' && !Buffer.isBuffer(entity)) {
    throw new TypeError('argument entity must be string, Buffer, or fs.Stats');
  }

  // generate entity tag
  const tag = isStats
    ? stattag(entity)
    : entitytag(entity);

  return weak
    ? 'W/' + tag
    : tag;
}

export default etag;
