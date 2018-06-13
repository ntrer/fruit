<template>
  <scroll ref="suggest"
          class="suggest"
          :data="result"
          :pullup="pullup"
          :beforeScroll="beforeScroll"
          @beforeScroll="listScroll"
          @scrollToEnd="searchMore"
  >
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="item in result">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Loading from '../../base/loading/loading'
  import Scroll from '../../base/scroll/scroll'
  import {search} from '../../api/search'
  import {ERR_OK} from '../../api/config'
  import {createSong} from "../../common/js/song";
  import {mapMutations,mapActions} from 'vuex'
  import Singer from '../../common/js/singer'

  const TYPE_SINGER = 'singer'
  //每页请求的数量
  const perpage = 20

  export default {
    name: "suggest",
    props: {
      showSinger: {
        type: Boolean,
        default: true
      },
      query: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        page: 1,
        result: [],
        pullup: true,
        hasMore: true,
        beforeScroll:true
      }
    },
    methods: {
      //选择后，判断使选择的歌手还是歌曲
      selectItem(item) {
        //歌手打开歌手详情
        if (item.type === TYPE_SINGER) {
          const singer = new Singer({
            id: item.singermid,
            name: item.singername
          })
          this.$router.push({
            path: `/search/${singer.id}`
          })
          this.setSinger(singer)
        }else {
          //歌曲则在歌曲列表中擦入歌曲
          this.insertSong(item)
        }
        //派发搜索历史事件
        this.$emit('select', item)
      },
      //开始搜索
      search() {
        this.page = 1
        this.hasMore = true
        //每次搜索时，先把列表滚动到顶部
        this.$refs.suggest.scrollTo(0, 0)
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this._genResult(res.data)
            //检查是否还有数据
            this._checkMore(res.data)
          }
        })
      },
      //加载更多数据
      searchMore() {
        if (!this.hasMore) {
          return
        }
        this.page++
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this.result.concat(this._genResult(res.data))
            this._checkMore(res.data)
          }
        })
      },
      //得到歌曲歌手名字
      getDisplayName(item) {
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      //若搜索歌手名，则会返回一个歌手的item，这个item设置歌手图标
      //其他的则设置为歌曲图标
      getIconCls(item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      //对得到的数据进行预处理
      //因为搜索歌手和搜索歌曲名，会有一个zhida的数据不同，这里要先分类处理
      _genResult(data) {
        let ret = []
        if (data.zhida && data.zhida.singerid && this.page === 1) {
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        if (data.song) {
          ret = ret.concat(this._normalizeSongs(data.song.list))
        }
        return ret
      },
      //把数据封装成song对象
      _normalizeSongs(list) {
        let ret = []
        list.forEach((musicData) => {
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      },
      //检查是否有更多数据
      _checkMore(data) {
        const song = data.song
        if (!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum) {
          this.hasMore = false
        }
      },
      listScroll() {
        this.$emit('listScroll')
      },
      refresh(){
        this.$refs.suggest.refresh()
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    },
    //观测搜索框的搜索变化
    watch: {
      query() {
        this.search()
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-ll
      .name
        flex: 1
        font-size: $font-size-medium-x
        color: $color-text-ll
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
