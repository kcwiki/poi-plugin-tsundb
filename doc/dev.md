# Development

It is recommended to use [VS Code](https://code.visualstudio.com/) with relevant extensions installed.

[Yarn](https://yarnpkg.com/) is used as package manager.

## Plugin

Install dependencies:

```sh
yarn
```

Format, lint, build and run tests:

```sh
yarn test
```

Use `DEBUG` environment variable for more logs:

```sh
DEBUG=t yarn test
```

Upgrade dependencies:

```sh
yarn up
```

## With Poi

To use development version, inside project directory:

```sh
yarn link
```

and inside [`appData`](https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname)`/poi/plugins`:

```sh
yarn link poi-plugin-tsundb
```

Run Poi with `TSUNDB_API_URL` to connect to a custom server:

```sh
TSUNDB_API_URL=http://localhost:12345 ./poi
```

Run Poi with `DEBUG` to enable plugin logging:

```sh
DEBUG=t ./poi
```
