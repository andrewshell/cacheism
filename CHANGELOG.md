# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.1](https://github.com/andrewshell/cacheism/compare/v3.0.0...v3.0.1) (2026-06-28)


### Bug Fixes

* honor a Miss returned from the go() callback instead of wrapping it in a Hit ([26046bc](https://github.com/andrewshell/cacheism/commit/26046bcbc19b7d1489a3997ad6c0a5a46b8d7010))
* honor a Miss returned from the go() callback instead of wrapping it in a Hit ([c2fbce5](https://github.com/andrewshell/cacheism/commit/c2fbce55740a1f8bd841c2613e3ceef7edd7ae1d))

## [3.0.0](https://github.com/andrewshell/cacheism/compare/v2.0.0...v3.0.0) (2025-12-11)


### ⚠ BREAKING CHANGES

* The import syntax for CommonJS users has changed.

### Features

* add ESLint with TypeScript support ([a063aeb](https://github.com/andrewshell/cacheism/commit/a063aeb3a7ea6277ae62efa91f9a0a3c815db11f))
* add input validation to go() method ([7812519](https://github.com/andrewshell/cacheism/commit/7812519404d3b15a9bdbdaa74cf5a1843180d0a8))
* convert to ESM with TypeScript and dual CJS/ESM output ([9c2132a](https://github.com/andrewshell/cacheism/commit/9c2132a269a5f15ac204b502aaab6dc6ec1b9589))


### Bug Fixes

* avoid mutating frozen Hit objects in cacheOnFail path ([d57c7d8](https://github.com/andrewshell/cacheism/commit/d57c7d8c59fbd8f539c319d4a8d141f7a4d4f0d3))
* convert filesystem store to fully async operations ([b3bdd88](https://github.com/andrewshell/cacheism/commit/b3bdd884410b21267b9adfb65f2c65215be498d6))

## [2.0.0] - Previous Release

This changelog was initialized when setting up automated releases with Release Please.
See [GitHub releases](https://github.com/andrewshell/cacheism/releases) for historical changes.
