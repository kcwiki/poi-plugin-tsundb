# poi-plugin-tsundb

[![npm/v](https://img.shields.io/npm/v/poi-plugin-tsundb.svg)](https://www.npmjs.org/package/poi-plugin-tsundb)
[![npm/dm](https://img.shields.io/npm/dm/poi-plugin-tsundb.svg)](https://www.npmjs.com/package/poi-plugin-tsundb)
[![travis](https://img.shields.io/travis/kcwiki/poi-plugin-tsundb.svg)](https://travis-ci.org/kcwiki/poi-plugin-tsundb)
[![david/dev](https://img.shields.io/david/dev/kcwiki/poi-plugin-tsundb.svg)](https://david-dm.org/kcwiki/poi-plugin-tsundb?type=dev)

[TsunDB](https://tsundb.kc3.moe/) data submission plugin for [Poi](https://poi.io/).

## Install

Paste package name (`poi-plugin-tsundb`) in the plugins tab and click the install button.

![install](https://i.imgur.com/G4wTCLS.png)

## Reported data

The following data is reported:

- Enemy compositions

Check [API documentation](https://github.com/kcwiki/poi-plugin-tsundb/blob/master/docs/api.md) for more details.

## Development

It is recommended to use [VS Code](https://code.visualstudio.com/) with workspace extensions enabled.

Install dependencies with [yarn](https://yarnpkg.com/):

```
yarn
```

Format, lint, build and run tests:

```
yarn test
```

Run server locally (run Poi with `DEBUG` environment variable set to use it)

```
yarn serve
```

## Credits

- https://github.com/poooi/plugin-report
- https://github.com/KC3Kai/KC3Kai/blob/master/src/library/modules/TsunDBSubmission.js
