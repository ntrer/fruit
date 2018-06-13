import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from '../../common/js/config'
import {shuffle} from '../../common/js/util'

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}


export const playerMixin = {
  computed: {
    //切换播放模式图片
    iconMode(){
      return this.mode===playMode.sequence? 'icon-sequence':this.mode===playMode.loop?'icon-loop':'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'playlist',
      'currentSong',
      'mode',
      'favoriteList'
    ])
  },
  methods: {
    //切换播放模式
    changeMode(){
      //得到切换的模式
      const mode=(this.mode+1)%3
      //设置播放模式
      this.setPlayMode(mode)
      let list=null
      //如果为随机模式
      if(mode===playMode.random){
        //把顺序列表打乱
        list=shuffle(this.sequenceList)
      }else {
        list=this.sequenceList
      }
      //重新设置当前的歌曲索引，因为打乱列表会影响当前歌曲索引，所以要重新找到当前的歌曲索引
      this.resetCurrentIndex(list)
      //设置播放列表
      this.setPlaylist(list)
    },
    //重新设置当前的歌曲索引，因为打乱列表会影响当前歌曲索引，所以要重新找到当前的歌曲索引
    resetCurrentIndex(list){
      let index=list.findIndex((item)=>{
        return item.id===this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song)
      } else {
        this.saveFavoriteList(song)
      }
    },
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      }
      return 'icon-not-favorite'
    },
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      return index > -1
    },
    ...mapMutations({
      setPlayMode: 'SET_PLAY_MODE',
      setPlaylist: 'SET_PLAYLIST',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayingState: 'SET_PLAYING_STATE'
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
}


export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 100
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    //搜索发生变化，得到搜索的文字
    onQueryChange(query) {
      this.query = query
    },
    //使输入框失去焦点
    blurInput(){
      this.$refs.searchBox.blur()
    },
    //存储搜索历史
    saveSearch(){
      this.saveSearchHistory(this.query)
    },
    //给搜索框添加搜索文字
    addQuery(query) {
      this.$refs.searchBox.setQuery(query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}
