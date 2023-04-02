# cacheism
Simple caching library 

## Overview

The goal of cacheism is to wrap an async function with caching logic where we
can easily specify under what circumstances we want to return the cache or fetch
the live data.

Your callback will get passed to it a Hit if there is an existing cache stored
or a Miss if there is no existing cache.

```js
const Cacheism = require('@andrewshell/cacheism');

const datadir = __dirname + '/data';
const cache = new Cacheism(Cacheism.store.filesystem({ datadir }));

async function run() {
    let result = await cache.go('-internal', 'hoopla', Cacheism.Status.cacheOnFail, async (existing) => {
        if (Math.random() < 0.5) {
            throw Error('Death');
        }
        return { message: 'Hoopla!' };
    });

    if (result.isHit) {
        console.dir(result.data);
    }

    if (result.error) {
        console.error(result.error);
    }
}

run().catch(err => console.error(err));
```

## Statuses

### Only Fresh

The onlyFresh status is for times where we never want to use the cache, but we
want to fetch the fresh data and store it in the cache for other requests.

### Cache on Fail

The cacheOnFail status is for times where we want to try to fetch fresh data,
but if an error is thrown, use the cache if present.

### Prefer Cache

The preferCache status is for times where we want to use the cache if available
and only fetch fresh if the cache is not available.

### Only Cache

The onlyCache status if for times where we don't want to attempt to fetch fresh
data and only return the cache if present.

## Results

The cache.go function will always return either a Hit or a Miss object.

### Hit

A hit is returned when we have good data. The `cached` param will be `true` if
the data was fetched from cache versus fresh data.

```
Hit {
  version: 3,
  cacheName: '-internal/hoopla',
  cached: true,
  created: 2022-04-22T21:05:14.094Z,
  data: { message: 'Hoopla!' },
  error: Error: Death
      at /Users/andrewshell/code/personal/test-cacheism/index.js:8:15
      at Cacheism.go (/Users/andrewshell/code/personal/cacheism/lib/cacheism.js:29:30)
      at async run (/Users/andrewshell/code/personal/test-cacheism/index.js:7:13),
  errorTime: 2022-04-22T21:30:56.275Z,
  consecutiveErrors: 1,
  etag: '"15-QcHvuZdyxCmLJ4zoYIPsP6pkNoM"',
  isHit: true,
  isMiss: false
}
```

In the case of Cache on Fail, the error param may be set which is the error
thrown while fetching fresh data.

### Miss

A miss is returned when we don't have good data. For instance, if there wasn't
cached data and an error was thrown while fetching fresh data. You'll also get a
miss if you fetch with the onlyCache status and there isn't a cache.

```
Miss {
  version: 3,
  cacheName: '-internal/hoopla',
  cached: false,
  created: 2022-04-22T21:30:56.275Z,
  data: null,
  error: Error: Missing cache
      at Cacheism.go (/Users/andrewshell/code/personal/cacheism/lib/cacheism.js:27:19)
      at async run (/Users/andrewshell/code/personal/test-cacheism/index.js:7:18),
  errorTime: 2022-04-22T21:30:56.275Z,
  consecutiveErrors: 1,
  etag: null,
  isHit: false,
  isMiss: true
}
```
