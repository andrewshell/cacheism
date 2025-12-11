import { etag as generateEtag } from './etag.js';

export enum Status {
  onlyFresh = 0,
  cacheOnFail = 1,
  preferCache = 2,
  onlyCache = 3,
}
Object.freeze(Status);

export enum Type {
  hit = 'Hit',
  miss = 'Miss',
}
Object.freeze(Type);

export class Hit {
  readonly version = 3;
  readonly cacheName: string;
  cached = false;
  created: Date;
  data: unknown;
  error: string | null = null;
  errorTime: Date | null = null;
  consecutiveErrors = 0;
  etag: string;
  readonly isHit = true;
  readonly isMiss = false;

  constructor(name: string, data: unknown, existingEtag?: string) {
    this.cacheName = name;
    this.created = new Date();
    this.data = data;
    this.etag = existingEtag ?? generateEtag(JSON.stringify(data));
  }
}

export class Miss {
  readonly version = 3;
  readonly cacheName: string;
  cached = false;
  created: Date;
  readonly data = null;
  error: string;
  errorTime: Date;
  consecutiveErrors: number;
  readonly etag = null;
  readonly isHit = false;
  readonly isMiss = true;

  constructor(name: string, error: string, consecutiveErrors: number) {
    this.cacheName = name;
    this.created = new Date();
    this.error = error;
    this.errorTime = new Date(this.created);
    this.consecutiveErrors = consecutiveErrors;
  }
}

interface ParsedData {
  version: number;
  type: string;
  cacheName: string;
  created: string;
  data: unknown;
  error: string | null;
  errorTime: string | null;
  consecutiveErrors: number;
  etag: string | null;
}

export class Data {
  version: number;
  type: Type;
  cacheName: string;
  created: Date;
  data: unknown;
  error: string | null;
  errorTime: Date | null;
  consecutiveErrors: number;
  etag: string | null;

  constructor(
    version: number,
    type: Type,
    name: string,
    created: Date,
    data: unknown,
    error: string | null,
    errorTime: Date | null,
    consecutiveErrors: number,
    etag: string | null
  ) {
    this.version = version;
    this.type = type;
    this.cacheName = name;
    this.created = created;
    this.data = data;
    this.error = error;
    this.errorTime = errorTime;
    this.consecutiveErrors = consecutiveErrors;
    this.etag = etag;
  }

  response(): Hit | Miss {
    if (this.version !== 3) {
      throw new Error(`Unknown cache version number: ${String(this.version)}`);
    }

    let response: Hit | Miss;

    if (this.type === Type.hit) {
      response = new Hit(this.cacheName, this.data, this.etag ?? undefined);
      response.cached = true;
      response.created = this.created;
      response.consecutiveErrors = this.consecutiveErrors;
    } else {
      response = new Miss(this.cacheName, this.error ?? '', this.consecutiveErrors);
      response.cached = false;
      response.created = this.created;
      response.errorTime = this.errorTime ?? new Date();
    }

    return response;
  }

  stringify(): string {
    return JSON.stringify({
      version: this.version,
      type: this.type,
      cacheName: this.cacheName,
      created: this.created,
      data: this.data,
      error: this.error,
      errorTime: this.errorTime,
      consecutiveErrors: this.consecutiveErrors,
      etag: this.etag,
    }, null, 2);
  }

  static fromResponse(response: Hit | Miss): Data {
    return new Data(
      response.version,
      response.isHit ? Type.hit : Type.miss,
      response.cacheName,
      response.created,
      response.data,
      response.error,
      response.errorTime,
      response.consecutiveErrors,
      response.etag
    );
  }

  static parse(value: string): Data {
    const parsed = JSON.parse(value) as ParsedData;

    if (parsed.version === 2) {
      return new Data(
        3,
        Type.hit,
        parsed.cacheName,
        new Date(parsed.created),
        parsed.data,
        null,
        null,
        0,
        parsed.etag
      );
    }

    if (parsed.version === 3) {
      return new Data(
        3,
        parsed.type as Type,
        parsed.cacheName,
        new Date(parsed.created),
        parsed.data,
        parsed.error,
        parsed.errorTime === null ? null : new Date(parsed.errorTime),
        parsed.consecutiveErrors,
        parsed.etag
      );
    }

    throw new Error(`Unknown cache version number: ${String(parsed.version)}`);
  }
}
