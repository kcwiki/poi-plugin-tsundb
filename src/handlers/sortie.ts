import IHandler from '.'
import { sendData } from '../utils'

interface ISortieState {
  map: string
  diff: number
  node: number
}

const sendEnemyComp = ({ map, diff: difficulty, node }: ISortieState, body: any, isAirRaidData: boolean = false) => {
  if (!map || !node) {
    return
  }
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
      isAirRaid: isAirRaidData || undefined,
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
      case 'api_port/port':
        this.clearState()
        break
      case 'api_get_member/mapinfo':
        this.clearState()
        for (const map of body.api_map_info) {
          this.state.diffs[map.api_id] = (map.api_eventmap || {}).api_selected_rank || 0
        }
        break
      case 'api_req_map/select_eventmap_rank':
        this.state.diffs[parseInt(postBody.api_maparea_id, 10) * 10 + parseInt(postBody.api_map_no, 10)] = parseInt(postBody.api_rank, 10)
        break
      case 'api_req_map/start':
        this.setSortieState(body)
        break
      case 'api_req_map/next':
        this.setSortieState(body)
        if (body.api_destruction_battle) {
          sendEnemyComp(this.state, body.api_destruction_battle, true)
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
        sendEnemyComp(this.state, body)
        break
      case 'api_req_sortie/battleresult':
      case 'api_req_combined_battle/battleresult':
        break
      default:
        return
    }
    if (process.env.DEBUG) {
      console.log(`poi-plugin-tsundb : SortieHandler : handle : ${path}`, body, postBody)
      console.log(`poi-plugin-tsundb : SortieHandler : state :`, this.state)
    }
  }

  private clearState() {
    this.state.map = ''
    this.state.diff = 0
    this.state.node = 0
    this.state.diffs = {}
  }

  private setSortieState(body: any) {
    this.state.map = `${body.api_maparea_id}-${body.api_mapinfo_no}`
    this.state.diff = this.state.diffs[body.api_maparea_id * 10 + body.api_mapinfo_no] || 0
    this.state.node = body.api_no
  }
}
