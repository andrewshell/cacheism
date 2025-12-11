const assert = require('assert');
const mockdate = require('mockdate');

const { Cacheism } = require('../dist/index.cjs');
const cache = new Cacheism(Cacheism.store.memory());

const helpers = require('./helpers.cjs');

describe('memory', function() {

  beforeEach(function() {
    // runs before each test in this block
    cache.store.data = {};
  });

  it('should export as a function', function() {
    assert.strictEqual(typeof cache.go, 'function');
  });

  describe('when status=onlyFresh', async function () {

    describe('and no existing cache', async function () {

      it('should return a Hit (live value) on success', async function () {
        const c = await cache.go('-internal', 'cache', Cacheism.Status.onlyFresh, async () => {
          return 'live';
        });

        helpers.expectCacheHit(c, false, 'live');
        helpers.expectCacheNoErrors(c);

        assert.strictEqual(await cache.store.isset('-internal/cache'), true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataHit(d, 'live', c.etag);
        helpers.expectDataNoErrors(d);
      });

      it('should return a Miss on error', async function () {
        let c, d, e;
        for (e = 1; e < 3; e++) {
          c = await cache.go('-internal', 'cache', Cacheism.Status.onlyFresh, async () => {
            throw Error('cache error');
          });

          helpers.expectCacheMiss(c, false, null);
          helpers.expectCacheErrors(c, 'Error: cache error', e);

          assert.strictEqual(await cache.store.isset('-internal/cache'), true);
          d = await cache.store.get('-internal/cache');

          helpers.expectDataMiss(d, null, null);
          helpers.expectDataErrors(d, 'Error: cache error', e);
        }
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

        assert.strictEqual(await cache.store.isset('-internal/cache'), true);
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

        let c, d, e;
        for (e = 1; e < 3; e++) {
          c = await cache.go('-internal', 'cache', Cacheism.Status.onlyFresh, async () => {
            throw Error('cache error');
          });

          helpers.expectCacheMiss(c, false, null);
          helpers.expectCacheErrors(c, 'Error: cache error', e);

          assert.strictEqual(await cache.store.isset('-internal/cache'), true);
          d = await cache.store.get('-internal/cache');

          helpers.expectDataMiss(d, null, null);
          helpers.expectDataErrors(d, 'Error: cache error', e);
        }
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

        assert.strictEqual(await cache.store.isset('-internal/cache'), true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataHit(d, 'live', c.etag);
        helpers.expectDataNoErrors(d);
      });

      it('should return a Miss on error', async function () {
        let c, d, e;
        for (e = 1; e < 3; e++) {
          c = await cache.go('-internal', 'cache', Cacheism.Status.cacheOnFail, async () => {
            throw Error('cache error');
          });

          helpers.expectCacheMiss(c, false, null);
          helpers.expectCacheErrors(c, 'Error: cache error', e);

          assert.strictEqual(await cache.store.isset('-internal/cache'), true);
          d = await cache.store.get('-internal/cache');

          helpers.expectDataMiss(d, null, c.etag);
          helpers.expectDataErrors(d, 'Error: cache error', e);
        }
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

        assert.strictEqual(await cache.store.isset('-internal/cache'), true);
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

        let c, d, e;
        for (e = 1; e < 3; e++) {
          c = await cache.go('-internal', 'cache', Cacheism.Status.cacheOnFail, async () => {
            throw Error('cache error');
          });

          helpers.expectCacheHit(c, true, 'cached');
          helpers.expectCacheErrors(c, 'Error: cache error', e);

          assert.strictEqual(await cache.store.isset('-internal/cache'), true);
          d = await cache.store.get('-internal/cache');

          helpers.expectDataHit(d, 'cached', c.etag);
          helpers.expectDataErrors(d, 'Error: cache error', e);
        }
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

        assert.strictEqual(await cache.store.isset('-internal/cache'), true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataHit(d, 'live', c.etag);
        helpers.expectDataNoErrors(d);
      });

      it('should return a Miss on error', async function () {
        let c, d, e;
        for (e = 1; e < 3; e++) {
          c = await cache.go('-internal', 'cache', Cacheism.Status.preferCache, async () => {
            throw Error('cache error');
          });

          helpers.expectCacheMiss(c, false, null);
          helpers.expectCacheErrors(c, 'Error: cache error', e);

          assert.strictEqual(await cache.store.isset('-internal/cache'), true);
          d = await cache.store.get('-internal/cache');

          helpers.expectDataMiss(d, null, c.etag);
          helpers.expectDataErrors(d, 'Error: cache error', e);
        }
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

        assert.strictEqual(await cache.store.isset('-internal/cache'), true);
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

        let c, d, e;
        for (e = 1; e < 3; e++) {
          c = await cache.go('-internal', 'cache', Cacheism.Status.preferCache, async () => {
            throw Error('cache error');
          });

          helpers.expectCacheHit(c, true, 'cached');
          helpers.expectCacheNoErrors(c);

          assert.strictEqual(await cache.store.isset('-internal/cache'), true);
          d = await cache.store.get('-internal/cache');

          helpers.expectDataHit(d, 'cached', c.etag);
          helpers.expectDataNoErrors(d);
        }
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
        helpers.expectCacheErrors(c, 'Error: Missing cache', 1);

        assert.strictEqual(await cache.store.isset('-internal/cache'), true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataMiss(d, null, null);
        helpers.expectDataErrors(d, 'Error: Missing cache', 1);
      });

      it('should return a Miss on error', async function () {
        let c, d, e;
        for (e = 1; e < 3; e++) {
          c = await cache.go('-internal', 'cache', Cacheism.Status.onlyCache, async () => {
            throw Error('cache error');
          });

          helpers.expectCacheMiss(c, false, null);
          helpers.expectCacheErrors(c, 'Error: Missing cache', e);

          assert.strictEqual(await cache.store.isset('-internal/cache'), true);
          d = await cache.store.get('-internal/cache');

          helpers.expectDataMiss(d, null, null);
          helpers.expectDataErrors(d, 'Error: Missing cache', e);
        }
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

        assert.strictEqual(await cache.store.isset('-internal/cache'), true);
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

        assert.strictEqual(await cache.store.isset('-internal/cache'), true);
        const d = await cache.store.get('-internal/cache');

        helpers.expectDataHit(d, 'cached', c.etag);
        helpers.expectDataNoErrors(d);
      });

    });

  });
});
