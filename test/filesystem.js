const expect = require('expect.js');
const fs = require('fs');
const path = require('path');
const datadir = path.resolve(__dirname, './cache-filesystem');

const Cacheism = require('../lib/cacheism');
const cache = new Cacheism(Cacheism.store.filesystem({ datadir }));

describe('filesystem', function() {

  beforeEach(function() {
    // runs before each test in this block
    if (fs.existsSync(datadir)) {
      fs.rmSync(datadir, { recursive: true, force: true });
    }
  });

  after(function() {
    // runs once after the last test in this block
    if (fs.existsSync(datadir)) {
      fs.rmSync(datadir, { recursive: true, force: true });
    }
  });

  it('should export as a function', function() {
    expect(cache.go).to.be.a('function');
  });

  describe('when status=onlyFresh', async function () {

    it('should return a Hit with the live value', async function () {
      const c = await cache.go('-internal', 'nocache', Cacheism.Status.onlyFresh, async () => {
        return 'live';
      });

      expect(c).to.be.a(Cacheism.Hit);
      expect(c).to.have.property('version', 2);
      expect(c).to.have.property('cacheName', '-internal/nocache');
      expect(c).to.have.property('cached', false);
      expect(c).to.have.property('created');
      expect(c.created).to.be.a(Date);
      expect(c).to.have.property('data', 'live');
      expect(c).to.have.property('error', null);
      expect(c).to.have.property('etag');
    });

    it('should return a Miss on error', async function () {
      const c = await cache.go('-internal', 'nocache', Cacheism.Status.onlyFresh, async () => {
        throw Error('cache error');
      });

      expect(c).to.be.a(Cacheism.Miss);
      expect(c).to.have.property('version', 2);
      expect(c).to.have.property('cacheName', '-internal/nocache');
      expect(c).to.have.property('error');
      expect(c.error).to.be.an(Error);
      expect(c.error).to.have.property('message', 'cache error');
    });

    it('should update cache with successful live value', async function () {
      const c = await cache.go('-internal', 'true', Cacheism.Status.onlyFresh, async () => {
        return 'live';
      });

      expect(c).to.be.a(Cacheism.Hit);
      expect(c).to.have.property('version', 2);
      expect(c).to.have.property('cacheName', '-internal/true');
      expect(c).to.have.property('cached', false);
      expect(c).to.have.property('created');
      expect(c.created).to.be.a(Date);
      expect(c).to.have.property('data', 'live');
      expect(c).to.have.property('error', null);
      expect(c).to.have.property('etag');

      expect(await cache.store.isset('-internal/true')).to.be(true);
    });

  });

  describe('when status=cacheOnFail', function () {

    it('should return a Miss on error with no cache', async function () {
      const c = await cache.go('-internal', 'nocache', Cacheism.Status.cacheOnFail, async () => {
        throw Error('cache error');
      });

      expect(c).to.be.a(Cacheism.Miss);
      expect(c).to.have.property('version', 2);
      expect(c).to.have.property('cacheName', '-internal/nocache');
      expect(c).to.have.property('error');
      expect(c.error).to.be.an(Error);
      expect(c.error).to.have.property('message', 'cache error');
    });

    it('should return a Hit on error with cache', async function () {
      await cache.store.set(new Cacheism.Hit('-internal/true', 'cached'));

      const c = await cache.go('-internal', 'true', Cacheism.Status.cacheOnFail, async () => {
        throw Error('cache error');
      });

      expect(c).to.be.a(Cacheism.Hit);
      expect(c).to.have.property('version', 2);
      expect(c).to.have.property('cacheName', '-internal/true');
      expect(c).to.have.property('cached', true);
      expect(c).to.have.property('created');
      expect(c.created).to.be.a(Date);
      expect(c).to.have.property('data', 'cached');
      expect(c).to.have.property('error');
      expect(c.error).to.be.an(Error);
      expect(c.error).to.have.property('message', 'cache error');
      expect(c).to.have.property('etag');
    });

    it('should return a Hit with the live value with cache', async function () {
      await cache.store.set(new Cacheism.Hit('-internal/true', 'cached'));

      const c = await cache.go('-internal', 'true', Cacheism.Status.cacheOnFail, async () => {
        return 'live';
      });

      expect(c).to.be.a(Cacheism.Hit);
      expect(c).to.have.property('version', 2);
      expect(c).to.have.property('cacheName', '-internal/true');
      expect(c).to.have.property('cached', false);
      expect(c).to.have.property('created');
      expect(c.created).to.be.a(Date);
      expect(c).to.have.property('data', 'live');
      expect(c).to.have.property('error', null);
      expect(c).to.have.property('etag');
    });

    it('should update cache with successful live value', async function () {
      await cache.store.set(new Cacheism.Hit('-internal/true', 'cached'));

      const c = await cache.go('-internal', 'true', Cacheism.Status.cacheOnFail, async () => {
        return 'live';
      });

      expect(c).to.be.a(Cacheism.Hit);
      expect(c).to.have.property('version', 2);
      expect(c).to.have.property('cacheName', '-internal/true');
      expect(c).to.have.property('cached', false);
      expect(c).to.have.property('created');
      expect(c.created).to.be.a(Date);
      expect(c).to.have.property('data', 'live');
      expect(c).to.have.property('error', null);
      expect(c).to.have.property('etag');
    });

  });

  describe('when status=preferCache', function () {

    it('should return a Miss on error with no cache', async function () {
      const c = await cache.go('-internal', 'nocache', Cacheism.Status.preferCache, async () => {
        throw Error('cache error');
      });

      expect(c).to.be.a(Cacheism.Miss);
      expect(c).to.have.property('version', 2);
      expect(c).to.have.property('cacheName', '-internal/nocache');
      expect(c).to.have.property('error');
      expect(c.error).to.be.an(Error);
      expect(c.error).to.have.property('message', 'cache error');
    });

    it('should return a Hit with the cached value with cache', async function () {
      await cache.store.set(new Cacheism.Hit('-internal/true', 'cached'));

      const c = await cache.go('-internal', 'true', Cacheism.Status.preferCache, async () => {
        return 'live';
      });

      expect(c).to.be.a(Cacheism.Hit);
      expect(c).to.have.property('version', 2);
      expect(c).to.have.property('cacheName', '-internal/true');
      expect(c).to.have.property('cached', true);
      expect(c).to.have.property('created');
      expect(c.created).to.be.a(Date);
      expect(c).to.have.property('data', 'cached');
      expect(c).to.have.property('error', null);
      expect(c).to.have.property('etag');
    });

    it('should return a Hit with the live value with no cache', async function () {
      const c = await cache.go('-internal', 'true', Cacheism.Status.preferCache, async () => {
        return 'live';
      });

      expect(c).to.be.a(Cacheism.Hit);
      expect(c).to.have.property('version', 2);
      expect(c).to.have.property('cacheName', '-internal/true');
      expect(c).to.have.property('cached', false);
      expect(c).to.have.property('created');
      expect(c.created).to.be.a(Date);
      expect(c).to.have.property('data', 'live');
      expect(c).to.have.property('error', null);
      expect(c).to.have.property('etag');
    });

  });

  describe('when status=onlyCache', function () {
    it('should return a Miss on error with no cache', async function () {
      const c = await cache.go('-internal', 'nocache', Cacheism.Status.onlyCache, async () => {
        throw Error('cache error');
      });

      expect(c).to.be.a(Cacheism.Miss);
      expect(c).to.have.property('version', 2);
      expect(c).to.have.property('cacheName', '-internal/nocache');
      expect(c).to.have.property('error');
      expect(c.error).to.be.an(Error);
      expect(c.error).to.have.property('message', 'Missing cache');
    });

    it('should return a Hit with the cached value with cache', async function () {
      await cache.store.set(new Cacheism.Hit('-internal/true', 'cached'));

      const c = await cache.go('-internal', 'true', Cacheism.Status.onlyCache, async () => {
        return 'live';
      });

      expect(c).to.be.a(Cacheism.Hit);
      expect(c).to.have.property('version', 2);
      expect(c).to.have.property('cacheName', '-internal/true');
      expect(c).to.have.property('cached', true);
      expect(c).to.have.property('created');
      expect(c.created).to.be.a(Date);
      expect(c).to.have.property('data', 'cached');
      expect(c).to.have.property('error', null);
      expect(c).to.have.property('etag');
    });

    it('should return a Miss with no cache', async function () {
      const c = await cache.go('-internal', 'nocache', Cacheism.Status.onlyCache, async () => {
        return 'live';
      });

      expect(c).to.be.a(Cacheism.Miss);
      expect(c).to.have.property('version', 2);
      expect(c).to.have.property('cacheName', '-internal/nocache');
      expect(c).to.have.property('error');
      expect(c.error).to.be.an(Error);
      expect(c.error).to.have.property('message', 'Missing cache');
    });

  });
});
