const assert = require('assert');

const { Cacheism } = require('../dist/index.cjs');
const cache = new Cacheism(Cacheism.store.memory());

describe('input validation', function() {

  describe('cacheDomain', function() {

    it('should throw TypeError when cacheDomain is null', async function() {
      try {
        await cache.go(null, 'path', Cacheism.Status.onlyFresh, async () => 'data');
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'cacheDomain must be a string');
      }
    });

    it('should throw TypeError when cacheDomain is undefined', async function() {
      try {
        await cache.go(undefined, 'path', Cacheism.Status.onlyFresh, async () => 'data');
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'cacheDomain must be a string');
      }
    });

    it('should throw TypeError when cacheDomain is a number', async function() {
      try {
        await cache.go(123, 'path', Cacheism.Status.onlyFresh, async () => 'data');
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'cacheDomain must be a string');
      }
    });

    it('should throw TypeError when cacheDomain is an object', async function() {
      try {
        await cache.go({}, 'path', Cacheism.Status.onlyFresh, async () => 'data');
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'cacheDomain must be a string');
      }
    });

  });

  describe('cachePath', function() {

    it('should throw TypeError when cachePath is null', async function() {
      try {
        await cache.go('domain', null, Cacheism.Status.onlyFresh, async () => 'data');
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'cachePath must be a string');
      }
    });

    it('should throw TypeError when cachePath is undefined', async function() {
      try {
        await cache.go('domain', undefined, Cacheism.Status.onlyFresh, async () => 'data');
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'cachePath must be a string');
      }
    });

    it('should throw TypeError when cachePath is a number', async function() {
      try {
        await cache.go('domain', 123, Cacheism.Status.onlyFresh, async () => 'data');
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'cachePath must be a string');
      }
    });

    it('should throw TypeError when cachePath is an array', async function() {
      try {
        await cache.go('domain', [], Cacheism.Status.onlyFresh, async () => 'data');
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'cachePath must be a string');
      }
    });

  });

  describe('status', function() {

    it('should throw TypeError when status is negative', async function() {
      try {
        await cache.go('domain', 'path', -1, async () => 'data');
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'status must be a valid Status value (0-3)');
      }
    });

    it('should throw TypeError when status is greater than 3', async function() {
      try {
        await cache.go('domain', 'path', 4, async () => 'data');
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'status must be a valid Status value (0-3)');
      }
    });

    it('should throw TypeError when status is a string', async function() {
      try {
        await cache.go('domain', 'path', 'onlyFresh', async () => 'data');
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'status must be a valid Status value (0-3)');
      }
    });

    it('should throw TypeError when status is null', async function() {
      try {
        await cache.go('domain', 'path', null, async () => 'data');
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'status must be a valid Status value (0-3)');
      }
    });

    it('should throw TypeError when status is undefined', async function() {
      try {
        await cache.go('domain', 'path', undefined, async () => 'data');
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'status must be a valid Status value (0-3)');
      }
    });

  });

  describe('callback', function() {

    it('should throw TypeError when callback is null', async function() {
      try {
        await cache.go('domain', 'path', Cacheism.Status.onlyFresh, null);
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'callback must be a function');
      }
    });

    it('should throw TypeError when callback is undefined', async function() {
      try {
        await cache.go('domain', 'path', Cacheism.Status.onlyFresh, undefined);
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'callback must be a function');
      }
    });

    it('should throw TypeError when callback is a string', async function() {
      try {
        await cache.go('domain', 'path', Cacheism.Status.onlyFresh, 'not a function');
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'callback must be a function');
      }
    });

    it('should throw TypeError when callback is a number', async function() {
      try {
        await cache.go('domain', 'path', Cacheism.Status.onlyFresh, 123);
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'callback must be a function');
      }
    });

    it('should throw TypeError when callback is an object', async function() {
      try {
        await cache.go('domain', 'path', Cacheism.Status.onlyFresh, {});
        assert.fail('Expected TypeError to be thrown');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'callback must be a function');
      }
    });

  });

});
