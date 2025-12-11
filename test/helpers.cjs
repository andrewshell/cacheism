const assert = require('assert');

const { Cacheism } = require('../dist/index.cjs');

function expectCacheHit(c, cached, data) {
  assert.ok(c instanceof Cacheism.Hit);
  assert.strictEqual(c.version, 3);
  assert.strictEqual(c.cacheName, '-internal/cache');
  assert.strictEqual(c.cached, cached);
  assert.ok('created' in c);
  assert.ok(c.created instanceof Date);
  assert.strictEqual(c.data, data);
  assert.ok('etag' in c);
}

function expectCacheMiss(c, cached, data) {
  assert.ok(c instanceof Cacheism.Miss);
  assert.strictEqual(c.version, 3);
  assert.strictEqual(c.cacheName, '-internal/cache');
  assert.strictEqual(c.cached, cached);
  assert.ok('created' in c);
  assert.ok(c.created instanceof Date);
  assert.strictEqual(c.data, data);
  assert.strictEqual(c.etag, null);
}

function expectCacheNoErrors(c) {
  assert.strictEqual(c.error, null);
  assert.strictEqual(c.errorTime, null);
  assert.strictEqual(c.consecutiveErrors, 0);
}

function expectCacheErrors(c, error, errors) {
  assert.strictEqual(c.error, error);
  assert.ok('errorTime' in c);
  assert.ok(c.errorTime instanceof Date);
  assert.strictEqual(c.consecutiveErrors, errors);
}

function expectDataHit(d, data, etag) {
  assert.ok(d instanceof Cacheism.Data);
  assert.strictEqual(d.version, 3);
  assert.strictEqual(d.type, Cacheism.Type.hit);
  assert.ok('created' in d);
  assert.ok(d.created instanceof Date);
  assert.strictEqual(d.data, data);
  assert.strictEqual(d.etag, etag);
}

function expectDataMiss(d, data, etag) {
  assert.ok(d instanceof Cacheism.Data);
  assert.strictEqual(d.version, 3);
  assert.strictEqual(d.type, Cacheism.Type.miss);
  assert.ok('created' in d);
  assert.ok(d.created instanceof Date);
  assert.strictEqual(d.data, data);
  assert.strictEqual(d.etag, etag);
}

function expectDataNoErrors(d) {
  assert.strictEqual(d.error, null);
  assert.strictEqual(d.errorTime, null);
  assert.strictEqual(d.consecutiveErrors, 0);
}


function expectDataErrors(d, error, errors) {
  assert.strictEqual(d.error, error);
  assert.ok('errorTime' in d);
  assert.ok(d.errorTime instanceof Date);
  assert.strictEqual(d.consecutiveErrors, errors);
}

module.exports = {
  expectCacheHit,
  expectCacheMiss,
  expectCacheNoErrors,
  expectCacheErrors,
  expectDataHit,
  expectDataMiss,
  expectDataNoErrors,
  expectDataErrors,
};
