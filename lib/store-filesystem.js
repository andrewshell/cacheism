const common = require('./common');
const storeFilesystem = { };
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');

module.exports = function (config) {
    function _mkdir(dirpath) {
      if (false === fs.existsSync(dirpath)) {
        fs.mkdirSync(dirpath, { recursive: true });
      }
    }

    _mkdir(config.datadir);

    storeFilesystem.get = async (cacheName) => {
        const filename = path.resolve(config.datadir, `${cacheName}.json`);
        const data = await fsPromises.readFile(filename, 'utf8');
        return common.Data.parse(data);
    }

    storeFilesystem.set = async (data) => {
        const filename = path.resolve(config.datadir, `${data.cacheName}.json`);
        _mkdir(path.dirname(filename));
        await fsPromises.writeFile(filename, data.stringify(), 'utf8');
    }

    storeFilesystem.isset = async (cacheName) => {
        const filename = path.resolve(config.datadir, `${cacheName}.json`);
        return fs.existsSync(filename);
    }

    storeFilesystem.unset = async (cacheName) => {
        const filename = path.resolve(config.datadir, `${cacheName}.json`);
        await fsPromises.rm(filename, { force: true });
    }

    return storeFilesystem;
}
