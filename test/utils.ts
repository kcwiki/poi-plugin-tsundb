import fastify from 'fastify'

import { handleResponse, pluginDidLoad } from '../src'

export const fromServer = (pathes: string[], n: number) =>
  new Promise(resolve => {
    const reports: any = {}
    const server = fastify()
    let i = 0
    for (const path of pathes) {
      server.put(`/api/${path}`, ({ body }, res) => {
        res.send('ok')
        reports[path] = reports[path] || []
        reports[path].push(body)
        ++i
        if (i === n) {
          server.close(() => null)
          resolve(reports)
        }
      })
    }
    server.listen(12345)
  })

export const mockPoiWindow = () => {
  ;(global as any).window = {
    addEventListener: () => null,
    _decks: require('./data/_decks.json'),
    _ships: require('./data/_ships.json'),
    $ships: require('./data/$ships.json'),
    _slotitems: require('./data/_slotitems.json'),
    $slotitems: require('./data/$slotitems.json'),
    getStore: () => ({
      sortie: { combinedFlag: 0, escapedPos: [] },
      info: { basic: { api_max_chara: 100 }, api_max_slotitem: 100 },
    }),
  }
}

mockPoiWindow()

pluginDidLoad()

export const fire = (path: string, body: any = {}, postBody: any = {}) => handleResponse({ detail: { path: `/kcsapi/${path}`, body, postBody } })
