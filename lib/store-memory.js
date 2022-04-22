const common = require('./common');

module.exports = function (config) {
    const storeMemory = { data: {} };

    storeMemory.get = async (cacheName) => {
        return common.Data.parse(storeMemory.data[cacheName]).hit();
    }

    storeMemory.set = async (hit) => {
        storeMemory.data[hit.cacheName] = common.Data.fromHit(hit).stringify();
    }

    storeMemory.isset = async (cacheName) => {
        return null != storeMemory.data[cacheName];
    }

    storeMemory.unset = async (cacheName) => {
        delete storeMemory.data[cacheName];
    }

    return storeMemory;
}
