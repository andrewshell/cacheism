const common = require('./common');

module.exports = function (config) {
    const storeMemory = { data: {} };

    storeMemory.get = async (cacheName) => {
        return common.Data.parse(storeMemory.data[cacheName]);
    }

    storeMemory.set = async (data) => {
        storeMemory.data[data.cacheName] = data.stringify();
    }

    storeMemory.isset = async (cacheName) => {
        return null != storeMemory.data[cacheName];
    }

    storeMemory.unset = async (cacheName) => {
        delete storeMemory.data[cacheName];
    }

    return storeMemory;
}
