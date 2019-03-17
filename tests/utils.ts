import fastify from 'fastify'

import { handleResponse, pluginDidLoad } from '../src'

export const fromServer = (path: string) =>
  new Promise(resolve => {
    const reports: any[] = []
    const server = fastify()
    server.put(`/api/${path}`, ({ body }, res) => {
      res.send('ok')
      reports.push(body)
      if (reports.length === 2) {
        server.close(() => null)
        resolve(reports)
      }
    })
    server.listen(process.env.TSUNDB_SERVER_PORT ? Number(process.env.TSUNDB_SERVER_PORT) : 12345)
  })

export const mockPoiWindow = () => {
  ;(global as any).window = {
    addEventListener: () => null,
  }
}

mockPoiWindow()

pluginDidLoad()

export const fire = (path: string, body: {} = {}, postBody: {} = {}) => handleResponse({ detail: { path: `/kcsapi/${path}`, body, postBody } })
