Some notes:

- Data is stored in a PostgreSQL database, using multiple collections.
- API server is used to interact with the clients, using an endpoint per collection: `https://tsundb.kc3.moe/api/<path>`.
  ```js
  // Example: sending JSON data to the server, using https://www.npmjs.com/package/node-fetch
  fetch(`https://tsundb.kc3.moe/api/${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': USER_AGENT,
    },
    body: JSON.stringify(data),
  })
  ```
- Data reported by the clients and SQL collections use different schemas.

This document use [Mongoose format](https://mongoosejs.com/docs/schematypes.html) for schemas, with SQL types in the comments.

# Available collections

Reference: [`src/library/modules/TsunDBSubmission.js`](https://github.com/KC3Kai/KC3Kai/blob/master/src/library/modules/TsunDBSubmission.js) in KC3Kai.

| SQL collection   | API path        | Description                 |
| ---------------- | --------------- | --------------------------- |
| `eventreward`    | `eventreward`   |                             |
| `normalworld`    | `routing`       |                             |
| `aaci`           | `aaci`          |
| `development`    | `development`   |
| `enemycomp`      | `enemy-comp`    | Record all enemy encounters |
| `eventworld`     | `eventrouting`  |
| `abnormaldamage` | `abnormal`      |
| `celldata`       | `celldata`      |
| `friendlyfleet`  | `friendlyfleet` |
| `shipdrop`       | `drops`         |

## `enemycomp`

### SQL collection

```js
{
  id: String,  // bigint
  map: String, // character varying
  node: Number, // integer
  hqlvl: Number, // integer
  difficulty: Number, // integer
  enemycomp: { // json
    ship: [Number],
    lvl: [Number],
    hp: [Number],
    stats: [[Number]],
    equip: [[Number]],
    formation: Number,
    // Optional fields
    shipEscort: [Number],
    lvlEscort: [Number],
    hpEscort: [Number],
    statsEscort: [[Number]],
    equipEscort: [[Number]],
    isAirRaid: True,
  },
  datetime: String, // timestamp without time zone
}
```

### Client data

Reference: [`client/handlers/sortie.ts`](https://github.com/kcwiki/poi-plugin-tsundb/blob/master/client/handlers/sortie.ts).

```js
{
  map: String,
  node: Number,
  hqLvl: Number,
  difficulty: Number,
  enemyComp: {
    ship: [Number],
    lvl: [Number],
    hp: [Number],
    stats: [[Number]],
    equip: [[Number]],
    formation: Number,
    // Optional fields
    shipEscort: [Number],
    lvlEscort: [Number],
    hpEscort: [Number],
    statsEscort: [[Number]],
    equipEscort: [[Number]],
    isAirRaid: True,
  },
}
```
