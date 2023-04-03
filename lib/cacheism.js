const common = require('./common');

function _sanitize(string) {
  return string.replaceAll(new RegExp('[^a-z0-9]+', 'ig'), '-');
}

function Cacheism(store) {
    this.store = store;
    this.status = common.Status;
    this.type = common.Type;
}

Cacheism.prototype.go = async function (cacheDomain, cachePath, status, callback) {
    let response, name = this.cacheName(cacheDomain, cachePath);

    let existing = new common.Miss(name, new Error('Missing cache'), 0);
    let hasCache = await this.store.isset(name);

    if (hasCache) {
        existing = (await this.store.get(name)).response();
    }

    try {

        if (status >= this.status.preferCache && hasCache && existing.isHit) {
            response = existing;
        } else if (status === this.status.onlyCache) {
            throw new Error('Missing cache');
        } else {
            response = await callback(existing);
            if (!(response instanceof common.Hit)) {
                response = new common.Hit(name, response);
            }
        }

    } catch (err) {

        if (status >= this.status.cacheOnFail && hasCache) {
            response = existing;
            response.error = err.toString();
            response.errorTime = new Date();
            response.consecutiveErrors++;
        } else {
            response = new common.Miss(
                name,
                err.toString(),
                existing.consecutiveErrors + 1
            );
        }

    }

    await this.store.set(common.Data.fromResponse(response));

    Object.freeze(response);
    return response;
}

Cacheism.prototype.cacheName = function (cacheDomain, cachePath) {
    return `${_sanitize(cacheDomain)}/${_sanitize(cachePath)}`;
}

Cacheism.prototype.setStore = function (store) {
    this.store = store;
}

Cacheism.prototype.hit = function (name, data, etag) {
    return new common.Hit(name, data, etag);
}

Cacheism.prototype.miss = function (name, error) {
    return new common.Miss(name, error);
}

Cacheism.Hit = common.Hit;
Cacheism.Miss = common.Miss;
Cacheism.Data = common.Data;
Cacheism.Status = common.Status;
Cacheism.Type = common.Type;

Cacheism.store = {
    filesystem: require('./store-filesystem'),
    memory: require('./store-memory'),
};

module.exports = Cacheism;
