import { readJsonSync } from 'fs-extra'
import fetch from 'node-fetch'
import { resolve } from 'path'

const { name: PACKAGE_NAME, version: PACKAGE_VERSION } = readJsonSync(resolve(__dirname, '../package.json'))

const USER_AGENT = `${PACKAGE_NAME}/${PACKAGE_VERSION}`

const API_URL = process.env.TSUNDB_API_URL || 'https://tsundb.kc3.moe'

export const log = (...args: any[]) => {
  if (process.env.DEBUG) {
    console.log(PACKAGE_NAME, ...args)
  }
}

export const sendData = async (path: string, data: {}) => {
  try {
    const url = `${API_URL}/api/${path}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'tsun-ver': 'Kasumi Kai',
        dataorigin: 'poi',
        version: PACKAGE_VERSION,
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
      return master.api_saku * 1.0
    case 10:
      return (master.api_saku + 1.2 * Math.sqrt(equip.api_level || 0)) * 1.2
    case 11:
      return (master.api_saku + 1.15 * Math.sqrt(equip.api_level || 0)) * 1.1
    case 12:
      return (master.api_saku + 1.25 * Math.sqrt(equip.api_level || 0)) * 0.6
    case 13:
      return (master.api_saku + 1.25 * Math.sqrt(equip.api_level || 0)) * 0.6
    default:
      return master.api_saku * 0.6
  }
}

// Generate an object with indexes as current ship id and values as previous form ship id
const generateRemodels = () => {
  const remodels: { [_: string]: number } = {}
  for (let i = 1; i < 999; i++) {
    const ship = (window as any).$ships[i]
    if (!ship) {
      continue
    }
    // If there is already previous id, skip, for the case of revertible remodels
    if (ship.api_aftershipid && !remodels[ship.api_aftershipid]) {
      remodels[ship.api_aftershipid] = ship.api_id
    }
  }
  return remodels
}

export const getShipCount = () => {
  const prevIds = generateRemodels()
  function getBaseForm(shipId: number, remodelObject: { [_: string]: number }): number {
    return !remodelObject[shipId] ? shipId : getBaseForm(remodelObject[shipId], remodelObject)
  }
  const fill = (object: { [_: string]: number }, key: number) => (object[key] = (object[key] || 0) + 1)
  const count: { [_: string]: number } = {}
  for (const shipKey in (window as any)._ships) {
    if (!(window as any)._ships[shipKey]) {
      continue
    }
    fill(count, getBaseForm((window as any)._ships[shipKey].api_ship_id, prevIds))
  }
  return count
}
