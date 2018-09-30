import { readJsonSync } from 'fs-extra'
import test from 'tape'

import { fire, fromServer } from './utils'

const { mapinfo, start, battle, next, battle2 } = readJsonSync(`${__dirname}/data/api-1-1.json`)
const expectedReports = readJsonSync(`${__dirname}/data/report-1-1.json`)

test('enemy-comp 1-1', async t => {
  t.plan(1)
  setTimeout(() => {
    fire('api_get_member/mapinfo', mapinfo)
    fire('api_req_map/start', start)
    fire('api_req_sortie/battle', battle)
    fire('api_req_map/next', next)
    fire('api_req_sortie/battle', battle2)
  }, 1000)
  const reports = await fromServer('enemy-comp')
  t.deepEqual(reports, expectedReports)
})
