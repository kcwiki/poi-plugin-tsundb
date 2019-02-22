# Development

It is recommended to use [VS Code](https://code.visualstudio.com/) with workspace extensions enabled.

Install dependencies with [yarn](https://yarnpkg.com/):

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

Run a mock API server locally:

```sh
yarn serve
```

Use `TSUNDB_SERVER_PORT` for listening port (12345 be default):

```sh
TSUNDB_SERVER_PORT=8080 yarn serve
```

Reports will be stored in `server/tmp/db.json`, use `TSUNDB_API_URL` to resend them to real API server instead:

```sh
TSUNDB_API_URL=https://tsundb.kc3.moe/api yarn serve
```

Run Poi with `TSUNDB_API_URL` to connect to a custom server:

```sh
TSUNDB_API_URL=http://localhost:12345/api ./poi
```

Run Poi with `DEBUG` to enable plugin logging:

```sh
DEBUG=t ./poi
```
