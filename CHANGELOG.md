# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
