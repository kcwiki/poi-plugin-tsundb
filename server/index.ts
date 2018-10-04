import fastify from 'fastify'
import { outputJson } from 'fs-extra'
import fetch from 'node-fetch'

export const sendData = async (url: string, path: string, ua: string, ver: string, data: {}) => {
  const response = await fetch(`${url}/${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': ua,
      'tsun-ver': ver,
    },
    body: JSON.stringify(data),
  })
  return response
}

const db: { [_: number]: { path: string; data: {} } } = {}

const insert = (path: string, data: {}) => {
  db[+new Date()] = { path, data }
  outputJson(`${__dirname}/tmp/db.json`, db, { spaces: 2 })
}

const server = fastify()

server.post('/api/*', async (req, res) => {
  const path = (req.req.url || '').replace('/api/', '')
  const ua = req.headers['user-agent']
  const ver = req.headers['tsun-ver']
  const data = req.body
  console.log(path, ua, ver, data && JSON.stringify(data))
  if (!ua || !ver || !path || !data) {
    res.status(400)
    res.send({ error: 'bad request to proxy' })
    return
  }
  if (process.env.TSUNDB_API_URL) {
    const response = await sendData(process.env.TSUNDB_API_URL, path, ua, ver, data)
    if (!response) {
      res.status(500)
      res.send({ error: 'bad upstream response' })
      return
    }
    if (response.status !== 200) {
      try {
        res.status(response.status)
        res.send(await response.json())
        return
      } catch (_) {
        res.status(response.status)
        res.send(response.statusText)
        return
      }
    }
    res.send('ok')
    return
  }
  insert(path, data)
  res.send('ok')
})

const port = process.env.TSUNDB_SERVER_PORT ? Number(process.env.TSUNDB_SERVER_PORT) : 12345

server.listen(port, '::', (err, address) => {
  if (err) {
    throw err
  }
  console.log(`listening on ${address}`)
})
