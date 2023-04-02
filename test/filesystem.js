const expect = require('expect.js');
const mockdate = require('mockdate');

const fs = require('fs');
const path = require('path');
const datadir = path.resolve(__dirname, './cache-filesystem');

const Cacheism = require('../lib/cacheism');
const cache = new Cacheism(Cacheism.store.filesystem({ datadir }));

const helpers = require('./helpers');

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

    describe('and no existing cache', async function () {

      it('should return a Hit (live value) on success', async function () {
        const c = await cache.go('-internal', 'cache', Cacheism.Status.onlyFresh, async () => {
          return 'live';
        });

        helpers.expectCacheHit(c, false, 'live');
        helpers.expectCacheNoErrors(c);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataHit(d, 'live', c.etag);
        helpers.expectDataNoErrors(d);
      });

      it('should return a Miss on error', async function () {
        const c = await cache.go('-internal', 'cache', Cacheism.Status.onlyFresh, async () => {
          throw Error('cache error');
        });

        helpers.expectCacheMiss(c, false, null);
        helpers.expectCacheErrors(c, 'cache error', 1);
        expect(c.created).to.eql(c.errorTime);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataMiss(d, null);
        helpers.expectDataErrors(d, 'Error: cache error', 1);
        expect(d.created).to.eql(d.errorTime);
      });

    });

    describe('and having existing cache', async function () {

      it('should return a Hit (live value) on success', async function () {
        mockdate.set('2000-11-22');

        await cache.store.set(Cacheism.Data.fromResponse(
          new Cacheism.Hit('-internal/cache', 'cached')
        ));

        mockdate.reset();

        const c = await cache.go('-internal', 'cache', Cacheism.Status.onlyFresh, async () => {
          return 'live';
        });

        helpers.expectCacheHit(c, false, 'live');
        helpers.expectCacheNoErrors(c);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataHit(d, 'live', c.etag);
        helpers.expectDataNoErrors(d);
      });

      it('should return a Miss on error', async function () {
        mockdate.set('2000-11-22');

        await cache.store.set(Cacheism.Data.fromResponse(
          new Cacheism.Hit('-internal/cache', 'cached')
        ));

        mockdate.reset();

        const c = await cache.go('-internal', 'cache', Cacheism.Status.onlyFresh, async () => {
          throw Error('cache error');
        });

        helpers.expectCacheMiss(c, false, null);
        helpers.expectCacheErrors(c, 'cache error', 1);
        expect(c.created).to.eql(c.errorTime);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataMiss(d, null);
        helpers.expectDataErrors(d, 'Error: cache error', 1);
        expect(d.created).to.eql(d.errorTime);
      });

    });

  });

  describe('when status=cacheOnFail', function () {

    describe('and no existing cache', async function () {

      it('should return a Hit (live value) on success', async function () {
        const c = await cache.go('-internal', 'cache', Cacheism.Status.cacheOnFail, async () => {
          return 'live';
        });

        helpers.expectCacheHit(c, false, 'live');
        helpers.expectCacheNoErrors(c);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataHit(d, 'live', c.etag);
        helpers.expectDataNoErrors(d);
      });

      it('should return a Miss on error', async function () {
        const c = await cache.go('-internal', 'cache', Cacheism.Status.cacheOnFail, async () => {
          throw Error('cache error');
        });

        helpers.expectCacheMiss(c, false, null);
        helpers.expectCacheErrors(c, 'cache error', 1);
        expect(c.created).to.eql(c.errorTime);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataMiss(d, null, c.etag);
        helpers.expectDataErrors(d, 'Error: cache error', 1);
        expect(d.created).to.eql(d.errorTime);
      });

    });

    describe('and having existing cache', async function () {

      it('should return a Hit (live value) on success', async function () {
        mockdate.set('2000-11-22');

        await cache.store.set(Cacheism.Data.fromResponse(
          new Cacheism.Hit('-internal/cache', 'cached')
        ));

        mockdate.reset();

        const c = await cache.go('-internal', 'cache', Cacheism.Status.cacheOnFail, async () => {
          return 'live';
        });

        helpers.expectCacheHit(c, false, 'live');
        helpers.expectCacheNoErrors(c);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataHit(d, 'live', c.etag);
        helpers.expectDataNoErrors(d);
      });

      it('should return a Hit (cached value) on error', async function () {
        mockdate.set('2000-11-22');

        await cache.store.set(Cacheism.Data.fromResponse(
          new Cacheism.Hit('-internal/cache', 'cached')
        ));

        mockdate.reset();

        const c = await cache.go('-internal', 'cache', Cacheism.Status.cacheOnFail, async () => {
          throw Error('cache error');
        });

        helpers.expectCacheHit(c, true, 'cached');
        helpers.expectCacheErrors(c, 'cache error', 1);
        expect(c.created).not.to.eql(c.errorTime);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataHit(d, 'cached', c.etag);
        helpers.expectDataErrors(d, 'Error: cache error', 1);
        expect(d.created).not.to.eql(d.errorTime);
      });

    });

  });

  describe('when status=preferCache', function () {

    describe('and no existing cache', async function () {

      it('should return a Hit (live value) on success', async function () {
        const c = await cache.go('-internal', 'cache', Cacheism.Status.preferCache, async () => {
          return 'live';
        });

        helpers.expectCacheHit(c, false, 'live');
        helpers.expectCacheNoErrors(c);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataHit(d, 'live', c.etag);
        helpers.expectDataNoErrors(d);
      });

      it('should return a Miss on error', async function () {
        const c = await cache.go('-internal', 'cache', Cacheism.Status.preferCache, async () => {
          throw Error('cache error');
        });

        helpers.expectCacheMiss(c, false, null);
        helpers.expectCacheErrors(c, 'cache error', 1);
        expect(c.created).to.eql(c.errorTime);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataMiss(d, null, c.etag);
        helpers.expectDataErrors(d, 'Error: cache error', 1);
        expect(d.created).to.eql(d.errorTime);
      });

    });

    describe('and having existing cache', async function () {

      it('should return a Hit (cached value) on success', async function () {
        mockdate.set('2000-11-22');

        await cache.store.set(Cacheism.Data.fromResponse(
          new Cacheism.Hit('-internal/cache', 'cached')
        ));

        mockdate.reset();

        const c = await cache.go('-internal', 'cache', Cacheism.Status.preferCache, async () => {
          return 'live';
        });

        helpers.expectCacheHit(c, true, 'cached');
        helpers.expectCacheNoErrors(c);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataHit(d, 'cached', c.etag);
        helpers.expectDataNoErrors(d);
      });

      it('should return a Hit (cached value) on error', async function () {
        mockdate.set('2000-11-22');

        await cache.store.set(Cacheism.Data.fromResponse(
          new Cacheism.Hit('-internal/cache', 'cached')
        ));

        mockdate.reset();

        const c = await cache.go('-internal', 'cache', Cacheism.Status.preferCache, async () => {
          throw Error('cache error');
        });

        helpers.expectCacheHit(c, true, 'cached');
        helpers.expectCacheNoErrors(c);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataHit(d, 'cached', c.etag);
        helpers.expectDataNoErrors(d);
      });

    });

  });

  describe('when status=onlyCache', function () {

    describe('and no existing cache', async function () {

      it('should return a Miss on success', async function () {
        const c = await cache.go('-internal', 'cache', Cacheism.Status.onlyCache, async () => {
          return 'live';
        });

        helpers.expectCacheMiss(c, false, null);
        helpers.expectCacheErrors(c, 'Missing cache', 1);
        expect(c.created).to.eql(c.errorTime);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataMiss(d, null, null);
        helpers.expectDataErrors(d, 'Error: Missing cache', 1);
        expect(d.created).to.eql(d.errorTime);
      });

      it('should return a Miss on error', async function () {
        const c = await cache.go('-internal', 'cache', Cacheism.Status.onlyCache, async () => {
          throw Error('cache error');
        });

        helpers.expectCacheMiss(c, false, null);
        helpers.expectCacheErrors(c, 'Missing cache', 1);
        expect(c.created).to.eql(c.errorTime);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataMiss(d, null, null);
        helpers.expectDataErrors(d, 'Error: Missing cache', 1);
        expect(d.created).to.eql(d.errorTime);
      });

    });

    describe('and having existing cache', async function () {

      it('should return a Hit (cached value) on success', async function () {
        mockdate.set('2000-11-22');

        await cache.store.set(Cacheism.Data.fromResponse(
          new Cacheism.Hit('-internal/cache', 'cached')
        ));

        mockdate.reset();

        const c = await cache.go('-internal', 'cache', Cacheism.Status.onlyCache, async () => {
          return 'live';
        });

        helpers.expectCacheHit(c, true, 'cached');
        helpers.expectCacheNoErrors(c);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataHit(d, 'cached', c.etag);
        helpers.expectDataNoErrors(d);
      });

      it('should return a Hit (cached value) on error', async function () {
        mockdate.set('2000-11-22');

        await cache.store.set(Cacheism.Data.fromResponse(
          new Cacheism.Hit('-internal/cache', 'cached')
        ));

        mockdate.reset();

        const c = await cache.go('-internal', 'cache', Cacheism.Status.onlyCache, async () => {
          return 'live';
        });

        helpers.expectCacheHit(c, true, 'cached');
        helpers.expectCacheNoErrors(c);

        expect(await cache.store.isset('-internal/cache')).to.be(true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataHit(d, 'cached', c.etag);
        helpers.expectDataNoErrors(d);
      });

    });

  });
});
