import { readJsonSync } from 'fs-extra'
import fetch from 'node-fetch'
import { resolve } from 'path'

const { name: PACKAGE_NAME, version: PACKAGE_VERSION } = readJsonSync(resolve(__dirname, '../package.json'))

const USER_AGENT = `${PACKAGE_NAME} v${PACKAGE_VERSION}`

const API_PROTOCOL = process.env.DEBUG ? 'http' : 'https'

const API_PATH = process.env.DEBUG ? 'localhost:12345/api' : 'tsundb.kc3.moe/api'

const API_URL = `${API_PROTOCOL}://${API_PATH}`

export const sendData = async (path: string, data: {}) => {
  try {
    const url = `${API_URL}/${path}`
    await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': USER_AGENT,
      },
      body: JSON.stringify(data),
    })
    if (process.env.DEBUG) {
      console.log(`poi-plugin-tsundb : sendData : ${url}`, data)
    }
  } catch (err) {
    console.error(err.stack)
  }
}
