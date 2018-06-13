<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div ref="playBtn" v-show="songs.length>0" class="play" @click="random" >
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <!--v-bind:data="songs":是为了scroll组件的得到数据，根据数据刷新组件获取高度-->
    <!--@scroll="scroll":listen-scroll="listenScroll" :probe-type="probeType":这几个属性是设置，scroll组件实现监听列表滑动距离，实现scroll派发的滚动事件，将滚动监听结果
    返回给scroll组件进行处理-->
    <scroll v-bind:data="songs"  ref="list" class="list" @scroll="scroll"
            :listen-scroll="listenScroll" :probe-type="probeType">
      <div class="song-list-wrapper">
        <song-list v-bind:songs="songs" @select="selectItem" :rank="rank"></song-list>
      </div>
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
  import Scroll from '../../base/scroll/scroll'
  import SongList from '../../base/song-list/song-list'
  import Loading from '../../base/loading/loading'
  import {mapActions} from 'vuex'
  import {playlistMixin} from "../../common/js/mixin";
  // import {prefixStyle} from '../../common/js/dom'
  //titleBar的高度
  const RESERVED_HEIGHT = 40
  // const transform = prefixStyle('transform')
  // const backdrop = prefixStyle('backdrop-filter')

  export default {
    name: "music-list",
    mixins:[playlistMixin],
    //得到父组件传来的数据
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs:{
        type:Array,
        default:[]
      },
      title: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        scrollY: 0
      }
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
    },
    computed: {
      //获取头像图片
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      }
    },
    mounted(){
      //得到背景图片的高度
      this.imageHeight = this.$refs.bgImage.clientHeight
      //设置titleBar最大的滑动距离，即随着列表上滑，titleBar跟着往上滑，当等于标题栏的高度时，不再滑动，歌曲列表仍然能往上滑
      //效果类似于android中的可伸缩toolbar
      this.minTransalteY = -this.imageHeight + RESERVED_HEIGHT
      //设置歌曲列表的高度，即在背景图片的下面
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    methods:{
      //scroll组件派发的滚动事件
      scroll(pos) {
        //得到y轴方向滚动的距离
        this.scrollY = pos.y
      },
      //返回上一级页面
      back() {
        this.$router.back()
      },
      //选中歌曲
      selectItem(item, index) {
        //通过mapActions中的映射，传入当前的歌曲列表和当前歌曲的索引，然后提交给state进行数据状态的改变
        this.selectPlay({
          list: this.songs,
          index
        })
      },
      //随机播放歌曲
      random() {
        this.randomPlay({
          list: this.songs
        })
      },
      //当有了歌曲播放列表数据后，重新计算scrool组件高度
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      //在组件中使用 this.$store.dispatch('xxx') 分发 action，或者使用 mapActions 辅助函数将组件的 methods 映射为 store.dispatch 调用
      ...mapActions([
        'selectPlay',//将 `this.selectPlay()` 映射为 `this.$store.dispatch('selectPlay')`
        'randomPlay'
      ])
    },
    //观测y轴方向滚动的距离
    watch: {
      scrollY(newVal) {
        let translateY = Math.max(this.minTransalteY, newVal)
        let zIndex = 0
        let scale = 1
        this.$refs.layer.style['transform'] = `translate3d(0,${translateY}px,0)`
        //计算缩放比例
        const percent = Math.abs(newVal / this.imageHeight)
        if (newVal > 0) {
          scale = 1 + percent
          zIndex = 10
        }

        //滑动到顶部，即titleBar固定在标题栏高度不再往上滑动时，让titleBar遮住文字
        if (newVal < this.minTransalteY) {
          zIndex = 10
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
          //隐藏播放按钮
          this.$refs.playBtn.style.display = 'none'
        } else {
          //往下拉，超过了标题栏高度时，回复原来的样式
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          //显示播放按钮
          this.$refs.playBtn.style.display = ''
        }
        //设置背景图片的缩放
        this.$refs.bgImage.style['transform'] = `scale(${scale})`
        //回复图片背景的层级数
        this.$refs.bgImage.style.zIndex = zIndex
      }
    },
    components:{
      Scroll,
      SongList,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: #fff
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: #fff
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
