import { readJsonSync } from 'fs-extra'
import fetch from 'node-fetch'
import { resolve } from 'path'

const { name: PACKAGE_NAME, version: PACKAGE_VERSION } = readJsonSync(resolve(__dirname, '../package.json'))

const USER_AGENT = `${PACKAGE_NAME} v${PACKAGE_VERSION}`

const API_URL = process.env.TSUNDB_API_URL || 'https://tsundb.kc3.moe/api'

export const sendData = async (path: string, data: {}) => {
  try {
    const url = `${API_URL}/${path}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': USER_AGENT,
      },
      body: JSON.stringify(data),
    })
    log('sendData', url, data)
    if (response.status !== 200) {
      console.error('poi-plugin-tsundb', 'response', response.status, response.statusText)
    } else {
      log('response', response.status, response.statusText)
    }
    return response
  } catch (err) {
    console.error(err.stack)
    return
  }
}

export const log = (...args: any[]) => {
  if (process.env.DEBUG) {
    console.log('poi-plugin-tsundb', ...args)
  }
}
