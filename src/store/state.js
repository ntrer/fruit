//定义要保存或者修改状态的数据
import {playMode} from '../common/js/config'
import {loadSearch,loadPlay} from "../common/js/cache";

const state={
  singer:{},
  playing: false,
  fullScreen: false,
  playlist: [],
  sequenceList: [],
  mode: playMode.sequence,
  currentIndex: -1,
  disc: {},
  topList:{},
  searchHistory: loadSearch(),
  playHistory: loadPlay(),
}

export default state
