const generateEtag = require('etag');

class Status {}

Status.onlyFresh = 0;
Status.cacheOnFail = 1;
Status.preferCache = 2;
Status.onlyCache = 3;

class Type {}

Type.hit = 'Hit';
Type.miss = 'Miss';

Object.freeze(Status);

class Hit {
    constructor(name, data, etag) {
        this.version = 3;
        this.cacheName = name;
        this.cached = false;
        this.created = new Date();
        this.data = data;
        this.error = null;
        this.errorTime = null;
        this.consecutiveErrors = 0;
        this.etag = null == etag ? generateEtag(JSON.stringify(data)) : etag;
        this.isHit = true;
        this.isMiss = false;
    }
}

class Miss {
    constructor(name, error, consecutiveErrors) {
        this.version = 3;
        this.cacheName = name;
        this.cached = false;
        this.created = new Date();
        this.data = null;
        this.error = error;
        this.errorTime = new Date(this.created);
        this.consecutiveErrors = consecutiveErrors;
        this.etag = null;
        this.isHit = false;
        this.isMiss = true;
    }
}

class Data {
    constructor(version, type, name, created, data, error, errorTime, consecutiveErrors, etag) {
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

    response() {
        if (3 !== this.version) {
            throw new Error(`Unknown cache version number: ${this.version}`);
        }

        let response;

        if (this.type === Type.hit) {
            response = new Hit(this.cacheName, this.data, this.etag);
            response.cached = true;
            response.created = this.created;
        } else {
            response = new Miss(this.cacheName, this.error, this.consecutiveErrors);
            response.cached = true;
            response.created = this.created;
            response.errorTime = this.errorTime;
        }

        return response;
    }

    stringify() {
        return JSON.stringify({
            version: this.version,
            type: this.type,
            cacheName: this.cacheName,
            created: this.created,
            data: this.data,
            error: null == this.error ? null : this.error.toString(),
            errorTime: this.errorTime,
            consecutiveErrors: this.consecutiveErrors,
            etag: this.etag,
        }, null, 2);
    }

    static fromResponse(response) {
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

    static parse(value) {
        const parsed = JSON.parse(value);

        if (2 === parsed.version) {
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

        if (3 === parsed.version) {
            return new Data(
                3,
                parsed.type,
                parsed.cacheName,
                new Date(parsed.created),
                parsed.data,
                parsed.error,
                null === parsed.errorTime ? null : new Date(parsed.errorTime),
                parsed.consecutiveErrors,
                parsed.etag
            );
        }

        throw new Error(`Unknown cache version number: ${parsed.version}`);
    }
}

module.exports = { Hit, Miss, Data, Status, Type };
