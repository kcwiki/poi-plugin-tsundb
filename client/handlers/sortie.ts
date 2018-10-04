import IHandler from '.'
import { log, sendData } from '../utils'

interface ISortieState {
  map: string
  diff: number
  node: number
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

interface IState extends ISortieState {
  diffs: { [_: string]: number }
}

export default class SortieHandler implements IHandler {
  private readonly state: IState = {
    map: '',
    diff: 0,
    node: 0,
    diffs: {},
  }
  public handle(path: string, body: any, postBody: any) {
    switch (path) {
      case 'api_get_member/mapinfo':
        this.initState(body)
        break
      case 'api_req_map/select_eventmap_rank':
        // update diffs state
        this.state.diffs[Number(postBody.api_maparea_id) * 10 + Number(postBody.api_map_no)] = Number(postBody.api_rank)
        break
      case 'api_req_map/start':
      case 'api_req_map/next':
        this.initSortieState(body)
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
        this.clearSortieState()
        break
      // case 'api_req_sortie/battleresult':
      // case 'api_req_combined_battle/battleresult':
      // break
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
    }
  }

  private clearSortieState() {
    this.state.map = ''
    this.state.diff = 0
    this.state.node = 0
  }

  private initSortieState(body: any) {
    this.state.map = `${body.api_maparea_id}-${body.api_mapinfo_no}`
    this.state.diff = this.state.diffs[body.api_maparea_id * 10 + body.api_mapinfo_no] || 0
    this.state.node = body.api_no
  }
}
