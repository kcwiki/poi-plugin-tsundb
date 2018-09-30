# poi-plugin-tsundb

[![npm/v](https://img.shields.io/npm/v/poi-plugin-tsundb.svg)](https://www.npmjs.com/package/poi-plugin-tsundb)
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

```sh
yarn
```

Format, lint, build and run tests:

```sh
yarn test
# or for more test logs
DEBUG=t yarn test
```

Run a mock API server locally:

```sh
yarn serve # http://[::]:12345
TSUNDB_SERVER_PORT=8080 yarn serve # http://[::]:8080
# reports will be stored in server/tmp/db.json, or to resend them to real API server:
TSUNDB_API_URL=https://tsundb.kc3.moe/api yarn serve
```

Run Poi with `TSUNDB_API_URL` environment variable to connect to a custom server:

```sh
TSUNDB_API_URL=http://localhost:12345/api ./poi
```

Run Poi with `DEBUG` environment variable set to enable plugin logging:

```sh
DEBUG=t ./poi
```

## Credits

- https://github.com/poooi/plugin-report
- https://github.com/KC3Kai/KC3Kai/blob/master/src/library/modules/TsunDBSubmission.js
