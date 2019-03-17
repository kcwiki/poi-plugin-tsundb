# API

This document use [Mongoose format](https://mongoosejs.com/docs/schematypes.html) for schemas, with SQL types in the comments.

## Requests

Reference: [`src/utils.ts`](https://github.com/kcwiki/poi-plugin-tsundb/blob/master/src/utils.ts).

## Available collections

Reference: [`src/library/modules/TsunDBSubmission.js`](https://github.com/KC3Kai/KC3Kai/blob/master/src/library/modules/TsunDBSubmission.js) in KC3Kai.

| SQL collection      | API path        | Description                 |
| ------------------- | --------------- | --------------------------- |
| `aaci`              | `aaci`          |
| `abnormaldamage`    | `abnormal`      |
| `celldata`          | `celldata`      |
| `development`       | `development`   |
| `enemycomp`         | `enemy-comp`    | Record all enemy encounters |
| `eventreward`       | `eventreward`   |
| `eventworld`        | `eventrouting`  |
| `fits`              | `fits`          |
| `friendlyfleet`     | `friendlyfleet` |
| `gimmick`           | `gimmick`       |
| `normalworld`       | `routing`       |
| `shipdrop`          | `drops`         |
| `shipdroplocations` | `droplocs`      |
| `spattack`          | `spattack`      |

### `enemycomp`

#### SQL collection

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
    // Additional optional fields are supported
  },
  datetime: String, // timestamp without time zone
}
```

#### Client data

Reference: [`src/handlers/sortie.ts`](https://github.com/kcwiki/poi-plugin-tsundb/blob/master/src/handlers/sortie.ts).

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
    // Additional optional fields can be added
  },
}
```
