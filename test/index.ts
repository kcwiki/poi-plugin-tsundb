import { deepEqual } from 'assert'
import { readJsonSync } from 'fs-extra'

import { fire, fromServer } from './utils'

import { getShipCounts } from '../src/utils'

const { mapinfo, start, battle, next, battle2 } = readJsonSync(`${__dirname}/data/api-1-1.json`)
const expectedEnemyComp = readJsonSync(`${__dirname}/data/enemy-comp-1-1.json`)
const expectedRouting = readJsonSync(`${__dirname}/data/routing-1-1.json`)
const expectedShipCount = readJsonSync(`${__dirname}/data/ship-count.json`)

const main = async () => {
  setTimeout(() => {
    fire('api_get_member/mapinfo', mapinfo)
    fire('api_req_map/start', start, { api_deck_id: 1 })
    fire('api_req_sortie/battle', battle)
    fire('api_req_map/next', next, { api_deck_id: 1 })
    fire('api_req_sortie/battle', battle2)
  }, 1000)

  const reports: any = await fromServer(['enemy-comp', 'routing'], 4)

  deepEqual(reports['enemy-comp'], expectedEnemyComp)
  deepEqual(reports['routing'], expectedRouting)
  deepEqual(getShipCounts(), expectedShipCount)
}

main()
