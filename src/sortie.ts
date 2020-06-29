import Handler from './handler'
import { getEquipmentF33, getShipCounts, log, sendData } from './utils'

interface SortieState {
  map: string
  diff: number
  node: number
  edges: number[]
  deckId: number
  nodeAmount: number
  cleared: boolean
  gaugeType: number
  gaugeNum: number
  formation: number
}

const getPlaneCounts = (data: any) => {
  const planes: number = ((data || {}).api_stage1 || {}).api_e_count || 0
  const lost: number = ((data || {}).api_stage1 || {}).api_e_lostcount || 0
  const bombers: number = ((data || {}).api_stage2 || {}).api_e_count || 0
  return planes ? { planes, bombersMin: bombers, bombersMax: bombers + lost } : undefined
}

const getFirstPlaneCounts = (data: any) =>
  getPlaneCounts((data || {}).api_air_base_injection) ||
  getPlaneCounts((data || {}).api_injection_kouku) ||
  getPlaneCounts(((data || {}).api_air_base_attack || [])[0]) ||
  getPlaneCounts((data || {}).api_kouku) || { planes: undefined, bombersMin: undefined, bombersMax: undefined }

const getShipData = (ship: any) => ({
  id: ship.api_ship_id,
  name: (window as any).$ships[ship.api_ship_id].api_name,
  shiplock: ship.api_sally_area || 0,
  level: ship.api_lv,
  type: (window as any).$ships[ship.api_ship_id].api_stype,
  speed: ship.api_soku,
  equip: ship.api_slot.slice(0, ship.api_slotnum).map((equipId: number) => ((window as any)._slotitems[equipId] || {}).api_slotitem_id || -1),
  exslot: ((window as any)._slotitems[ship.api_slot_ex] || {}).api_slotitem_id || -1,
})

const getFleet = (deckId: number, callback: any) =>
  (((window as any)._decks[deckId - 1] || {}).api_ship || []).filter((shipId: number) => shipId > 0).map(callback)

const getFleetData = (deckId: number) => {
  const isCombined = deckId === 1 && (window as any).getStore().sortie.combinedFlag
  const getShip = (shipId: number) => getShipData((window as any)._ships[shipId])
  const fleet1 = getFleet(deckId, getShip)
  const fleet2 = getFleet(2, getShip)
  const escapedPos = (window as any).getStore().sortie.escapedPos

  const prepareFleetData = (fleet: any, escaped: number[], index: number) => {
    const ids = []
    const exslots = []
    const types = []
    const equips = []
    let level = 0
    let speed = 20
    for (const ship of fleet) {
      ids.push(ship.id)
      equips.push(...ship.equip)
      exslots.push(ship.exslot)
      types.push(ship.type)
      speed = Math.min(speed, ship.speed)
      ship.flee = escaped.includes(index)
      level += ship.level
      index++
    }
    return { ids, level, equips, exslots, types, speed }
  }

  const getFleetF33 = (deck: number, mapMod: number, fleetData: any) => {
    const getShipF33 = (mapModifier: number) => (shipId: number) => {
      const ship = (window as any)._ships[shipId]
      let shipLos = ship.api_sakuteki[0]
      let equipLos = 0
      for (const equipId of ship.api_slot) {
        if (equipId < 1) {
          continue
        }
        const equip = (window as any)._slotitems[equipId]
        const master = (window as any).$slotitems[equip.api_slotitem_id]
        shipLos -= master.api_saku
        equipLos += getEquipmentF33(master, equip)
      }
      return Math.sqrt(shipLos) + equipLos * mapModifier
    }
    return (
      getFleet(deck, getShipF33(mapMod)).reduce((acc: number, value: number) => acc + value, 0) -
      Math.ceil((window as any)._teitokuLv * 0.4) +
      (Math.max(fleetData.length, 6) - fleetData.filter((ship: any) => !ship.flee).length) * 2
    )
  }

  const {
    ids: fleetoneids,
    level: fleetonelevels,
    equips: fleetoneequips,
    exslots: fleetoneexslots,
    types: fleetonetypes,
    speed: fleetonespeed,
  } = prepareFleetData(fleet1, escapedPos, 0)
  const {
    ids: fleettwoids,
    level: fleettwolevels,
    equips: fleettwoequips,
    exslots: fleettwoexslots,
    types: fleettwotypes,
    speed: fleettwospeed,
  } = prepareFleetData(fleet2, escapedPos, 6)

  const fleetonelos = [1, 2, 3, 4].map(mapModifier => getFleetF33(deckId, mapModifier, fleet1))
  const fleettwolos = [1, 2, 3, 4].map(mapModifier => getFleetF33(deckId, mapModifier, fleet2))

  return {
    fleetType: 0,
    fleet1,
    fleet2: [],
    fleetlevel: fleetonelevels,
    fleetids: fleetoneids,
    fleetoneequips,
    fleetoneexslots,
    fleetonetypes,
    fleetSpeed: fleetonespeed,
    los: fleetonelos,
    ...(!isCombined
      ? { fleettwoequips: [], fleettwoexslots: [], fleettwotypes: [] }
      : {
          fleet2,
          fleetlevel: fleetonelevels + fleettwolevels,
          fleetids: fleetoneids.concat(fleettwoids),
          fleettwoequips,
          fleettwoexslots,
          fleettwotypes,
          fleetSpeed: Math.min(fleetonespeed, fleettwospeed),
          fleetType: (window as any).getStore().sortie.combinedFlag,
          los: fleetonelos.map((value, index) => value + fleettwolos[index]),
        }),
  }
}

const getEventData = (body: any, difficulty: number, gaugeNum: number, gaugeType: number) =>
  body.api_maparea_id < 10
    ? {}
    : { currentMapHp: body.api_eventmap.api_now_maphp, maxMapHP: body.api_eventmap.api_max_maphp, difficulty, gaugeNum, gaugeType }

const sendEnemyComp = (map: string, node: number, difficulty: number, body: any, isAirRaid?: true) => {
  if (!map || !node) {
    return
  }
  const { planes, bombersMin, bombersMax } = getFirstPlaneCounts(body)
  sendData('enemy-comp', {
    map,
    node,
    hqLvl: (window as any)._teitokuLv,
    difficulty,
    enemyComp: {
      ship: body.api_ship_ke,
      lvl: body.api_ship_lv,
      hp: body.api_e_maxhps,
      stats: body.api_eParam,
      equip: body.api_eSlot,
      formation: (body.api_formation || [])[1],
      shipEscort: body.api_ship_ke_combined,
      lvlEscort: body.api_ship_lv_combined,
      hpEscort: body.api_e_maxhps_combined,
      statsEscort: body.api_eParam_combined,
      equipEscort: body.api_eSlot_combined,
      isAirRaid,
      planes,
      bombersMin,
      bombersMax,
    },
  })
}

const sendRouting = (
  map: string,
  edges: number[],
  difficulty: number,
  cleared: boolean,
  deckId: number,
  gaugeNum: number,
  gaugeType: number,
  nodeAmount: number,
  body: any,
) => {
  sendData(body.api_maparea_id < 10 ? 'routing' : 'eventrouting', {
    map,
    hqLvl: (window as any)._teitokuLv,
    cleared,
    edgeID: edges,
    sortiedFleet: deckId,
    nextRoute: body.api_next,
    nodeInfo: {
      nodeType: body.api_color_no,
      eventId: body.api_event_id,
      eventKind: body.api_event_kind,
      nodeColor: body.api_color_no,
      itemGet: body.api_itemget || [],
      amountofnodes: nodeAmount,
    },
    ...getFleetData(deckId),
    ...getEventData(body, difficulty, gaugeNum, gaugeType),
  })
}

const sendDrop = (map: string, node: number, difficulty: number, cleared: boolean, formation: number, body: any) => {
  // Don't send if slots are full
  if (
    (Object.keys((window as any)._ships).length >= (window as any).getStore().info.basic.api_max_chara ||
      Object.keys((window as any)._ships).length >= (window as any).getStore().info.basic.api_max_slotitem - 3) &&
    !body.api_get_ship
  ) {
    return
  }

  const sendDropData = (data: any) => sendData('drops', data)
  const sendDropLocs = (shipdrop: any) =>
    sendData('droplocs', {
      ship: shipdrop.ship,
      map: shipdrop.map,
      node: shipdrop.node,
      rank: shipdrop.rank,
      difficulty: shipdrop.difficulty,
    })

  for (const func of [sendDropData, sendDropLocs]) {
    func.call(
      {},
      {
        map,
        node,
        rank: body.api_win_rank,
        cleared,
        enemyComp: {
          ship: body.api_ship_id,
          mapName: body.api_quest_name,
          compName: body.api_enemy_info.api_deck_name,
          baseExp: body.api_get_base_exp,
          formation,
        },
        hqLvl: (window as any)._teitokuLv,
        difficulty,
        ship: body.api_get_ship ? body.api_get_ship.api_ship_id : -1,
        counts: getShipCounts(),
      },
    )
  }
}

interface State extends SortieState {
  diffs: { [_: string]: number }
  clears: { [_: string]: number }
  gaugeTypes: { [_: string]: number }
  gaugeNums: { [_: string]: number }
}

export default class SortieHandler implements Handler {
  private readonly state: State = {
    map: '',
    diff: 0,
    node: 0,
    edges: [],
    deckId: 0,
    nodeAmount: 0,
    cleared: false,
    gaugeType: 0,
    gaugeNum: 0,
    formation: 0,
    diffs: {},
    clears: {},
    gaugeTypes: {},
    gaugeNums: {},
  }
  public handle(path: string, body: any, postBody: any) {
    switch (path) {
      case 'api_get_member/mapinfo':
        this.initState(body)
        break
      case 'api_req_map/select_eventmap_rank':
        // update information
        this.state.diffs[Number(postBody.api_maparea_id) * 10 + Number(postBody.api_map_no)] = Number(postBody.api_rank)
        this.state.gaugeNums[Number(postBody.api_maparea_id) * 10 + Number(postBody.api_map_no)] = Number(body.api_gauge_num)
        this.state.gaugeTypes[Number(postBody.api_maparea_id) * 10 + Number(postBody.api_map_no)] = Number(body.api_gauge_type)
        break
      case 'api_req_map/start':
      case 'api_req_map/next':
        this.initSortieState(body, postBody)
        sendRouting(
          this.state.map,
          this.state.edges,
          this.state.diff,
          this.state.cleared,
          this.state.deckId,
          this.state.gaugeNum,
          this.state.gaugeType,
          this.state.nodeAmount,
          body,
        )
        if (body.api_destruction_battle) {
          sendEnemyComp(this.state.map, this.state.node, this.state.diff, body.api_destruction_battle, true)
        }
        break
      case 'api_req_sortie/battle':
      case 'api_req_sortie/airbattle':
      case 'api_req_sortie/ld_airbattle':
      case 'api_req_sortie/night_to_day':
      case 'api_req_battle_midnight/sp_midnight':
      case 'api_req_combined_battle/battle':
      case 'api_req_combined_battle/battle_water':
      case 'api_req_combined_battle/airbattle':
      case 'api_req_combined_battle/ld_airbattle':
      case 'api_req_combined_battle/ec_battle':
      case 'api_req_combined_battle/each_battle':
      case 'api_req_combined_battle/each_battle_water':
      case 'api_req_combined_battle/sp_midnight':
      case 'api_req_combined_battle/ec_night_to_day':
        sendEnemyComp(this.state.map, this.state.node, this.state.diff, body)
        this.state.formation = (body.api_formation || [])[1] || 0
        break
      case 'api_req_sortie/battleresult':
      case 'api_req_combined_battle/battleresult':
        sendDrop(this.state.map, this.state.node, this.state.diff, this.state.cleared, this.state.formation, body)
        this.clearSortieState()
        break
      default:
        return
    }
    log('SortieHandler', 'handle', path, body, postBody)
    log('SortieHandler', 'state', this.state)
  }

  private initState(body: any) {
    this.state.map = ''
    this.state.diff = 0
    this.state.node = 0
    this.state.diffs = {}
    for (const map of body.api_map_info) {
      this.state.diffs[map.api_id] = (map.api_eventmap || {}).api_selected_rank || 0
      this.state.clears[map.api_id] = map.api_cleared || 0
      this.state.gaugeTypes[map.api_id] = map.api_gauge_type || 0
      this.state.gaugeNums[map.api_id] = map.api_gauge_num || 0
    }
  }

  private clearSortieState() {
    this.state.map = ''
    this.state.diff = 0
    this.state.node = 0
    this.state.cleared = false
    this.state.gaugeNum = 0
    this.state.gaugeType = 0
    this.state.formation = 0
  }

  private initSortieState(body: any, postBody: any) {
    if (body.api_cell_data) {
      this.initStartState(body, postBody)
    }
    this.state.map = `${body.api_maparea_id}-${body.api_mapinfo_no}`
    this.state.diff = this.state.diffs[body.api_maparea_id * 10 + body.api_mapinfo_no] || 0
    this.state.node = body.api_no
    this.state.edges.push(this.state.node)
    this.state.cleared = this.state.clears[body.api_maparea_id * 10 + body.api_mapinfo_no] === 1
    this.state.gaugeNum = this.state.gaugeNums[body.api_maparea_id * 10 + body.api_mapinfo_no]
    this.state.gaugeType = this.state.gaugeTypes[body.api_maparea_id * 10 + body.api_mapinfo_no]
  }

  private initStartState(body: any, postBody: any) {
    this.state.edges = []
    this.state.deckId = Number(postBody.api_deck_id)
    this.state.nodeAmount = body.api_cell_data.length
  }
}
