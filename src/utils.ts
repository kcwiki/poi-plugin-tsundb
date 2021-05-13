import { readJsonSync } from 'fs-extra'
import fetch from 'node-fetch'
import { resolve } from 'path'
import _ from 'lodash'

const { name: PACKAGE_NAME, version: PACKAGE_VERSION } = readJsonSync(resolve(__dirname, '../package.json'))

const USER_AGENT = `${PACKAGE_NAME}/${PACKAGE_VERSION}`

const API_URL = process.env.TSUNDB_API_URL || 'https://tsundb.kc3.moe'

export const log = (...args: any[]) => {
  if (process.env.DEBUG || (window as any).tsundb_debug) {
    console.log(PACKAGE_NAME, ...args)
  }
}

export const sendData = async (path: string, data: any) => {
  try {
    const url = `${API_URL}/api/${path}`
    const poiVersion = _.get(window, 'POI_VERSION', 'unknown')
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'tsun-ver': 'Kasumi Kai',
        dataorigin: 'poi',
        version: `${PACKAGE_VERSION}/${poiVersion}`,
        'user-agent': USER_AGENT,
      },
      body: JSON.stringify(data),
    })
    log('sendData', url, data)
    if (response.status !== 200) {
      try {
        console.error(PACKAGE_NAME, 'response', response.status, await response.json())
      } catch (_) {
        console.error(PACKAGE_NAME, 'response', response.status)
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

export const getEquipmentF33 = (master: any, equip: any) => {
  switch (master.api_type[2]) {
    case 8:
      return master.api_saku * 0.8
    case 9:
      return (master.api_saku + 1.2 * Math.sqrt(equip.api_level || 0)) * 1.0
    case 10:
      return (master.api_saku + 1.2 * Math.sqrt(equip.api_level || 0)) * 1.2
    case 11:
      return (master.api_saku + 1.15 * Math.sqrt(equip.api_level || 0)) * 1.1
    case 12:
      return (master.api_saku + 1.25 * Math.sqrt(equip.api_level || 0)) * 0.6
    case 13:
      return (master.api_saku + 1.4 * Math.sqrt(equip.api_level || 0)) * 0.6
    default:
      return master.api_saku * 0.6
  }
}

const getActualPrevId = (es: { api_id: number }[], forId: string): number | null =>
  es.length === 1 ? es[0].api_id : (es.find(e => +(window as any).$ships[forId].api_aftershipid !== e.api_id) || {}).api_id || null

const getPrevIds = (): { [_: number]: number | null } =>
  _((window as any).$ships)
    .filter(e => +e.api_aftershipid)
    .groupBy('api_aftershipid')
    .mapValues((es, forId) => getActualPrevId(es, forId))
    .value()

const getBaseId = (shipId: number, prevIds: { [_: number]: number | null }): number => {
  for (let i = 0, id = shipId; i < 10; ++i) {
    const prev = prevIds[id]
    if (!prev) {
      return id
    }
    id = prev
  }
  console.warn(PACKAGE_NAME, 'getBaseId', `can't find base id for ${shipId}`)
  return shipId
}

export const getShipCounts = (): { [_: number]: number } => {
  const prevIds = getPrevIds()
  return _((window as any)._ships)
    .countBy(e => getBaseId(e.api_ship_id, prevIds))
    .value()
}
