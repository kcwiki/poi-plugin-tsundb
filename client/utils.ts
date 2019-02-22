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
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'user-agent': USER_AGENT,
        'tsun-ver': 'Kasumi Kai',
      },
      body: JSON.stringify(data),
    })
    log('sendData', url, data)
    if (response.status !== 200) {
      try {
        console.error('poi-plugin-tsundb', 'response', response.status, await response.json())
      } catch (_) {
        console.error('poi-plugin-tsundb', 'response', response.status)
      }
    } else {
      log('response', response.status)
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
