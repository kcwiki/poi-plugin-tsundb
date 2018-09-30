import fastify from 'fastify'
import { outputJson } from 'fs-extra'
import fetch from 'node-fetch'

export const sendData = async (url: string, ua: string, path: string, data: {}) => {
  try {
    const response = await fetch(`${url}/${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': ua,
      },
      body: JSON.stringify(data),
    })
    return response
  } catch (err) {
    console.error(err.stack)
    return
  }
}

const db: { [_: number]: { ua: string; path: string; data: {} } } = {}

const insert = (ua: string, path: string, data: {}) => {
  db[+new Date()] = { ua, path, data }
  outputJson(`${__dirname}/tmp/db.json`, db, { spaces: 2 })
}

const server = fastify({ logger: true })

server.post('/api/*', async (req, res) => {
  const ua = req.headers['user-agent']
  const path = (req.req.url || '').replace('/api/', '')
  const data = req.body
  if (!ua || !path || !data) {
    res.status(400)
    res.send('bad request to proxy')
    return
  }
  if (process.env.TSUNDB_API_URL) {
    const response = await sendData(process.env.TSUNDB_API_URL, ua, path, data)
    if (!response) {
      res.status(500)
      res.send('bad upstream response')
      return
    }
    if (response.status !== 200) {
      res.status(response.status)
      res.send(response.statusText)
    } else {
      res.send('ok')
    }
  } else {
    insert(ua, path, data)
    res.send('ok')
  }
})

const port = process.env.port || process.env.TSUNDB_SERVER_PORT ? Number(process.env.port || process.env.TSUNDB_SERVER_PORT) : 12345

server.listen(port, '::', (err, address) => {
  if (err) {
    throw err
  }
  console.log(`listening on ${address}`)
})
