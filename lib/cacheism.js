const common = require('./common');

function _sanitize(string) {
  return string.replaceAll(new RegExp('[^a-z0-9]+', 'ig'), '-');
}

function Cacheism(store) {
    this.store = store;
    this.status = common.Status;
}

Cacheism.prototype.go = async function (cacheDomain, cachePath, status, callback) {
    let response, name = this.cacheName(cacheDomain, cachePath);

    try {

        let existing = new common.Miss(name, new Error('Missing cache'));
        let hasCache = await this.store.isset(name);

        if (hasCache) {
            existing = await this.store.get(name);
        }

        if (status >= this.status.preferCache && hasCache) {
            response = existing;
        } else if (status === this.status.onlyCache) {
            throw new Error('Missing cache');
        } else {
            response = await callback(existing);
            if (!(response instanceof common.Hit)) {
                response = new common.Hit(name, response);
            }
            await this.store.set(response);
        }

    } catch (err) {

        if (status >= this.status.cacheOnFail && await this.store.isset(name)) {
            response = await this.store.get(name);
            response.error = err;
        } else {
            response = new common.Miss(name, err);
        }

    }

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

Cacheism.store = {
    filesystem: require('./store-filesystem'),
    memory: require('./store-memory'),
};

module.exports = Cacheism;
