import test from 'tape'

import { handleResponse, pluginDidLoad } from '../src'

import fromServer from './server'

const mockWindow = () => {
  ;(global as any).window = {
    addEventListener: () => null,
  }
}

mockWindow()

pluginDidLoad()

const fire = (path: string, body: {} = {}, postBody: {} = {}) => handleResponse({ detail: { path: `/kcsapi/${path}`, body, postBody } })

test('enemy-comp start', async t => {
  t.plan(1)
  setTimeout(() => {
    fire('api_port/port', {})
    fire('api_get_member/mapinfo', { api_map_info: [{ api_id: 425, api_eventmap: { api_selected_rank: 4 } }] })
    fire('api_req_map/start', { api_maparea_id: 42, api_mapinfo_no: 5, api_no: 1 })
    fire('api_req_sortie/battle', { api_ship_ke: [1501] })
  }, 1000)
  const body = await fromServer('/api/enemy-comp')
  t.deepEqual(body, { map: '42-5', node: 1, difficulty: 4, enemyComp: { ship: [1501] } })
  t.end()
})

test('enemy-comp next', async t => {
  t.plan(1)
  setTimeout(() => {
    fire('api_port/port', {})
    fire('api_get_member/mapinfo', { api_map_info: [{ api_id: 425, api_eventmap: { api_selected_rank: 4 } }] })
    fire('api_req_map/start', { api_maparea_id: 42, api_mapinfo_no: 5, api_no: 1 })
    fire('api_req_map/next', { api_maparea_id: 42, api_mapinfo_no: 5, api_no: 1 })
    fire('api_req_sortie/battle', { api_ship_ke: [1501] })
  }, 1000)
  const body = await fromServer('/api/enemy-comp')
  t.deepEqual(body, { map: '42-5', node: 1, difficulty: 4, enemyComp: { ship: [1501] } })
  t.end()
})

test('enemy-comp select_eventmap_rank', async t => {
  t.plan(1)
  setTimeout(() => {
    fire('api_port/port')
    fire('api_get_member/mapinfo', { api_map_info: [{ api_id: 425, api_eventmap: { api_selected_rank: 0 } }] })
    fire('api_req_map/select_eventmap_rank', {}, { api_maparea_id: '42', api_map_no: '5', api_rank: '4' })
    fire('api_req_map/start', { api_maparea_id: 42, api_mapinfo_no: 5, api_no: 1 })
    fire('api_req_map/next', { api_maparea_id: 42, api_mapinfo_no: 5, api_no: 1 })
    fire('api_req_sortie/battle', { api_ship_ke: [1501] })
  }, 1000)
  const body = await fromServer('/api/enemy-comp')
  t.deepEqual(body, { map: '42-5', node: 1, difficulty: 4, enemyComp: { ship: [1501] } })
  t.end()
})
