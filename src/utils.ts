import { readJsonSync } from 'fs-extra'
import fetch from 'node-fetch'
import { resolve } from 'path'
import _ from 'lodash'
// import { shipRemodelInfoSelector } from 'subtender/poi'

const { name, version } = readJsonSync(resolve(__dirname, '../package.json'))

export const log = (...args: any[]) => {
  if (process.env.DEBUG || (window as any).tsundb_debug) {
    console.log(name, ...args)
  }
}

export const sendData = async (path: string, data: any) => {
  try {
    const url = `${process.env.TSUNDB_API_URL || 'https://tsundb.kc3.moe'}/api/${path}`
    const poiVersion = _.get(window, 'POI_VERSION', 'unknown')
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'tsun-ver': 'Kasumi Kai',
        dataorigin: 'poi',
        version: `${version}/${poiVersion}`,
        'user-agent': `${name}/${version} poi/${poiVersion}`,
      },
      body: JSON.stringify(data),
    })
    log('sendData', url, data)
    if (response.status !== 200) {
      try {
        console.error(name, 'response', response.status, await response.json())
      } catch (_) {
        console.error(name, 'response', response.status)
      }
    } else {
      log('response', response.status)
    }
    return response
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.stack)
    }
    return
  }
}

const losC1: { [_: number]: number } = {
  9: 1.2,
  10: 1.2,
  11: 1.15,
  12: 1.25,
  13: 1.4,
}

const losC2: { [_: number]: number } = {
  8: 0.8,
  9: 1.0,
  10: 1.2,
  11: 1.1,
}

export const getEquipmentF33 = (master: any, equip: any): number =>
  (master.api_saku + (losC1[master.api_type[2]] || 0) * Math.sqrt(equip.api_level || 0)) * (losC2[master.api_type[2]] || 0.6)

const getActualPrevId = (es: { api_id: number }[], forId: string): number | null =>
  es.length === 1 ? es[0].api_id : (es.find(e => +(window as any).$ships[forId].api_aftershipid !== e.api_id) || {}).api_id || null

const getPrevIds = (): { [_: number]: number | null } =>
  _((window as any).$ships)
    .filter(e => +e.api_aftershipid)
    .groupBy('api_aftershipid')
    .mapValues((es, forId) => getActualPrevId(es, forId))
    .value()

const getBaseId = (shipId: number, prevIds: { [_: number]: number | null }, useSort: boolean = false): number => {
  for (let i = 0, id = shipId; i < 10; ++i) {
    const prev = prevIds[id]
    if (!prev || (useSort && (window as any).$ships[id].api_sort_id % 10 === 1)) {
      return id
    }
    id = prev
  }
  if (useSort) {
    console.warn(name, 'getBaseId', `can't find base id for ${shipId}`)
  }
  return useSort ? shipId : getBaseId(shipId, prevIds, true)
}

export const getShipCounts = (): { [_: number]: number } => {
  const prevIds = getPrevIds()
  return _((window as any)._ships)
    .countBy(e => getBaseId(e.api_ship_id, prevIds))
    .value()
}

// export const getShipCounts = (): { [_: number]: number } => {
//   const poiState = (window as any).getStore()
//   const { originMstIdOf } = shipRemodelInfoSelector(poiState)

//   const getBaseId = (shipId: number): number => {
//     const base = originMstIdOf[shipId]
//     if (!base) {
//       console.warn(name, 'getBaseId', `can't find base id for ${shipId}`)
//       return shipId
//     }
//     return base
//   }

//   return _((window as any)._ships)
//     .countBy(e => getBaseId(e.api_ship_id))
//     .value()
// }
