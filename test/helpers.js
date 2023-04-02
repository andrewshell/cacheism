const expect = require('expect.js');
const mockdate = require('mockdate');

const Cacheism = require('../lib/cacheism');

function expectCacheHit(c, cached, data) {
    expect(c).to.be.a(Cacheism.Hit);
    expect(c).to.have.property('version', 3);
    expect(c).to.have.property('cacheName', '-internal/cache');
    expect(c).to.have.property('cached', cached);
    expect(c).to.have.property('created');
    expect(c.created).to.be.a(Date);
    expect(c).to.have.property('data', data);
    expect(c).to.have.property('etag');
}

function expectCacheMiss(c, cached, data) {
    expect(c).to.be.a(Cacheism.Miss);
    expect(c).to.have.property('version', 3);
    expect(c).to.have.property('cacheName', '-internal/cache');
    expect(c).to.have.property('cached', cached);
    expect(c).to.have.property('created');
    expect(c.created).to.be.a(Date);
    expect(c).to.have.property('data', data);
    expect(c).to.have.property('etag', null);
}

function expectCacheNoErrors(c) {
    expect(c).to.have.property('error', null);
    expect(c).to.have.property('errorTime', null);
    expect(c).to.have.property('consecutiveErrors', 0);
}

function expectCacheErrors(c, error, errors) {
    expect(c).to.have.property('error');
    expect(c.error).to.be.an(Error);
    expect(c.error).to.have.property('message', error);
    expect(c).to.have.property('errorTime');
    expect(c.errorTime).to.be.a(Date);
    expect(c).to.have.property('consecutiveErrors', errors);
}

function expectDataHit(d, data, etag) {
    expect(d).to.be.a(Cacheism.Data);
    expect(d).to.have.property('version', 3);
    expect(d).to.have.property('type', Cacheism.Type.hit);
    expect(d).to.have.property('created');
    expect(d.created).to.be.a(Date);
    expect(d).to.have.property('data', data);
    expect(d).to.have.property('etag', etag);
}

function expectDataMiss(d, data, etag) {
    expect(d).to.be.a(Cacheism.Data);
    expect(d).to.have.property('version', 3);
    expect(d).to.have.property('type', Cacheism.Type.miss);
    expect(d).to.have.property('created');
    expect(d.created).to.be.a(Date);
    expect(d).to.have.property('data', data);
    expect(d).to.have.property('etag', etag);
}

function expectDataNoErrors(d) {
    expect(d).to.have.property('error', null);
    expect(d).to.have.property('errorTime', null);
    expect(d).to.have.property('consecutiveErrors', 0);
}


function expectDataErrors(d, error, errors) {
    expect(d).to.have.property('error', error);
    expect(d).to.have.property('errorTime');
    expect(d.errorTime).to.be.a(Date);
    expect(d).to.have.property('consecutiveErrors', errors);
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
