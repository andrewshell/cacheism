const { describe, it } = require('node:test');
const assert = require('assert');

const { Cacheism } = require('../dist/index.cjs');

describe('Data.parse()', function() {

  describe('with version 2 cache format', function() {

    it('should upgrade version 2 to version 3', function() {
      const v2Json = JSON.stringify({
        version: 2,
        cacheName: 'test/cache',
        created: '2024-01-15T12:00:00.000Z',
        data: { foo: 'bar' },
        etag: '"abc123"'
      });

      const data = Cacheism.Data.parse(v2Json);

      assert.strictEqual(data.version, 3);
      assert.strictEqual(data.type, Cacheism.Type.hit);
      assert.strictEqual(data.cacheName, 'test/cache');
      assert.deepStrictEqual(data.data, { foo: 'bar' });
      assert.strictEqual(data.etag, '"abc123"');
      assert.ok(data.created instanceof Date);
      assert.strictEqual(data.created.toISOString(), '2024-01-15T12:00:00.000Z');
    });

    it('should set default values for v3-only fields', function() {
      const v2Json = JSON.stringify({
        version: 2,
        cacheName: 'test/cache',
        created: '2024-01-15T12:00:00.000Z',
        data: 'test data',
        etag: '"def456"'
      });

      const data = Cacheism.Data.parse(v2Json);

      assert.strictEqual(data.error, null);
      assert.strictEqual(data.errorTime, null);
      assert.strictEqual(data.consecutiveErrors, 0);
    });

    it('should produce a valid Hit when response() is called', function() {
      const v2Json = JSON.stringify({
        version: 2,
        cacheName: 'test/cache',
        created: '2024-01-15T12:00:00.000Z',
        data: 'cached value',
        etag: '"etag789"'
      });

      const data = Cacheism.Data.parse(v2Json);
      const response = data.response();

      assert.ok(response instanceof Cacheism.Hit);
      assert.strictEqual(response.isHit, true);
      assert.strictEqual(response.isMiss, false);
      assert.strictEqual(response.data, 'cached value');
      assert.strictEqual(response.etag, '"etag789"');
      assert.strictEqual(response.cached, true);
      assert.strictEqual(response.consecutiveErrors, 0);
    });

  });

  describe('with version 3 cache format', function() {

    it('should parse version 3 Hit correctly', function() {
      const v3Json = JSON.stringify({
        version: 3,
        type: 'Hit',
        cacheName: 'test/cache',
        created: '2024-01-15T12:00:00.000Z',
        data: { value: 123 },
        error: null,
        errorTime: null,
        consecutiveErrors: 0,
        etag: '"v3etag"'
      });

      const data = Cacheism.Data.parse(v3Json);

      assert.strictEqual(data.version, 3);
      assert.strictEqual(data.type, Cacheism.Type.hit);
      assert.strictEqual(data.cacheName, 'test/cache');
      assert.deepStrictEqual(data.data, { value: 123 });
      assert.strictEqual(data.etag, '"v3etag"');
      assert.strictEqual(data.error, null);
      assert.strictEqual(data.errorTime, null);
      assert.strictEqual(data.consecutiveErrors, 0);
    });

    it('should parse version 3 Miss correctly', function() {
      const v3Json = JSON.stringify({
        version: 3,
        type: 'Miss',
        cacheName: 'test/cache',
        created: '2024-01-15T12:00:00.000Z',
        data: null,
        error: 'Error: Network failure',
        errorTime: '2024-01-15T12:00:00.000Z',
        consecutiveErrors: 3,
        etag: null
      });

      const data = Cacheism.Data.parse(v3Json);

      assert.strictEqual(data.version, 3);
      assert.strictEqual(data.type, Cacheism.Type.miss);
      assert.strictEqual(data.data, null);
      assert.strictEqual(data.error, 'Error: Network failure');
      assert.ok(data.errorTime instanceof Date);
      assert.strictEqual(data.consecutiveErrors, 3);
      assert.strictEqual(data.etag, null);
    });

  });

  describe('Data.response()', function() {

    it('should return a Miss when type is Miss', function() {
      const v3Json = JSON.stringify({
        version: 3,
        type: 'Miss',
        cacheName: 'test/cache',
        created: '2024-01-15T12:00:00.000Z',
        data: null,
        error: 'Error: Something failed',
        errorTime: '2024-01-15T12:05:00.000Z',
        consecutiveErrors: 2,
        etag: null
      });

      const data = Cacheism.Data.parse(v3Json);
      const response = data.response();

      assert.ok(response instanceof Cacheism.Miss);
      assert.strictEqual(response.isHit, false);
      assert.strictEqual(response.isMiss, true);
      assert.strictEqual(response.data, null);
      assert.strictEqual(response.error, 'Error: Something failed');
      assert.strictEqual(response.consecutiveErrors, 2);
      assert.ok(response.errorTime instanceof Date);
    });

    it('should handle Miss with null errorTime', function() {
      const v3Json = JSON.stringify({
        version: 3,
        type: 'Miss',
        cacheName: 'test/cache',
        created: '2024-01-15T12:00:00.000Z',
        data: null,
        error: 'Error: Something failed',
        errorTime: null,
        consecutiveErrors: 1,
        etag: null
      });

      const data = Cacheism.Data.parse(v3Json);
      const response = data.response();

      assert.ok(response instanceof Cacheism.Miss);
      assert.ok(response.errorTime instanceof Date);
    });

  });

  describe('with unknown version', function() {

    it('should throw an error for version 1', function() {
      const v1Json = JSON.stringify({
        version: 1,
        cacheName: 'test/cache',
        created: '2024-01-15T12:00:00.000Z',
        data: 'old data'
      });

      assert.throws(() => {
        Cacheism.Data.parse(v1Json);
      }, /Unknown cache version number: 1/);
    });

    it('should throw an error for version 4', function() {
      const v4Json = JSON.stringify({
        version: 4,
        cacheName: 'test/cache',
        created: '2024-01-15T12:00:00.000Z',
        data: 'future data'
      });

      assert.throws(() => {
        Cacheism.Data.parse(v4Json);
      }, /Unknown cache version number: 4/);
    });

  });

});
