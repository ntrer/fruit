<template>
  <div class="player" v-show="playlist.length>0">
    <!--@enter="enter":vue提供的css动画钩子函数-->
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" v-bind:src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" v-bind:src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentLineNum ===index}"
                   v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar v-bind:percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{ format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img width="40" height="40" v-bind:src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
          <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <!--播放音乐组件-->
    <audio ref="audio" :src="currentSong.url" @play="ready" @error="error" @timeupdate="updateTime"  @ended="end"></audio>
  </div>
</template>

<script>
  import {mapGetters, mapMutations,mapActions} from "vuex"
  import animations from 'create-keyframe-animation'
  import ProgressBar from '../../base/progress-bar/progress-bar'
  import ProgressCircle from '../../base/progress-circle/progress-circle'
  import {playMode} from 'common/js/config'
  import {shuffle} from "../../common/js/util";
  import Lyric from 'lyric-parser'
  import Scroll from '../../base/scroll/scroll'
  import Playlist from '../../components/playlist/playlist'
  import {playerMixin} from '../../common/js/mixin'
  export default {
    mixins:[playerMixin],
    name: "player",
    data() {
      return {
        //歌曲是否已经准备好
        songReady: false,
        //当前的播放进度
        currentTime: 0,
        //圆形进度条大小
        radius:32,
        //当前的歌词
        currentLyric: null,
        //当前歌词的行数
        currentLineNum: 0,
        currentShow:'cd',
        playingLyric:""
      }
    },
    created() {
      this.touch = {}
    },
    components:{
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
    },
    computed: {
      //计算播放进度比
      percent(){
        return this.currentTime / this.currentSong.duration
      },
      //根据播放状态控制图片旋转
      cdCls() {
        return this.playing ? 'play' : 'play pause'
      },
      //根据播放状态控制播放图标的切换
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      //根据播放状态控制播放图标的切换
      miniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      //若歌曲未准备好，设置图标不可按
      disableCls() {
        return this.songReady ? '' : 'disable'
      },
      //从state中得到数据
      ...mapGetters([
          'fullScreen',
          'playing',
          'currentIndex',
        ],

      )
    },
    methods: {
      back() {
        this.setFullScreen(false)
      },
      open() {
        this.setFullScreen(true)
      },
      //vue提供的css动画钩子函数
      //el：使用动画的元素组件，done：回调函数，进入下一步动画
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale()

        let animation = {
          //动画开始时，先移动到小图标的位置，并缩小图片
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          //动画进行到60%时，回到大图片的原位
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          //动画结束时，恢复大图片的大小
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }
        //注册动画，使用的第三方的create-keyframe-animation
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        //执行动画
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      //进入动画结束后，取消注册，取消动画效果
      afterEnter() {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      //离开动画没有使用第三方的，使用js原生transition动画实现
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        //给大图片添加transform属性，使其移动到小土坯那位置，并缩小
        this.$refs.cdWrapper.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`
        //transitionend 事件在 CSS 完成过渡后触发
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style.transform = ''
      },
      //得到小播放器的图标的坐标和相对于大图标的缩放比例
      _getPosAndScale() {
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      //暂停或播放
      togglePlaying() {
        if (!this.songReady) {
          return
        }
        this.setPlayingState(!this.playing)
        //暂停时，歌词页暂停
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      prev(){
        //若歌曲没有准备好，直接返回
        if(!this.songReady){
          return
        }
        if(this.playlist.length===1){
          this.loop()
          return
        }else {
          let index = this.currentIndex - 1
          //实现循环切换歌曲
          if (index === -1) {
            index = this.playlist.length - 1
          }
          //改变当前歌曲索引状态
          this.setCurrentIndex(index)
          //根据播放状态切换图标状态
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        this.songReady=false
      },
      //播放结束时
      end() {
        //如果是单曲循环
        if (this.mode === playMode.loop) {
          //循环播放
          this.loop()
        } else {
          //否则播放下一首
          this.next()
        }
      },
      //单曲循环
      loop() {
        //重置进度
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        this.setPlayingState(true)
        //把歌词重置到开始
        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      },
      next(){
        //若歌曲没有准备好，直接返回
        if(!this.songReady){
          return
        }
        if(this.playlist.length===1){
          this.loop()
          return
        }else {
          let index = this.currentIndex + 1
          //实现循环切换歌曲
          if (index === this.playlist.length) {
            index = 0
          }
          //改变当前歌曲索引状态
          this.setCurrentIndex(index)
          //根据播放状态切换图标状态
          if (!this.playing) {
            this.togglePlaying()
          }
          this.songReady = false
        }
      },
      ready(){
        this.songReady=true
        this.savePlayHistory(this.currentSong)
      },
      error(){
        this.songReady=true
      },
      //更新进度条
      updateTime(e){
        this.currentTime = e.target.currentTime
      },
      //处理播放进度
      format(interval) {
        //取整
        interval = interval | 0
        const minute = interval / 60 | 0
        const second = this._pad(interval % 60)
        return `${minute}:${second}`
      },
      //在秒前面补0，保证小数位有两位
      _pad(num, n = 2) {
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      //拖动进度条，改变播放进度
      onProgressBarChange(percent) {
        //获得当前的播放进度
        const currentTime = this.currentSong.duration * percent
        //设置给播放器
        this.$refs.audio.currentTime = currentTime
        //切换播放状态
        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime*1000)
        }
      },
      //获取歌词数据
      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          if(this.currentSong.lyric!=lyric){
            return
          }
          //将得到的歌词数据使用lyric-parser进行格式处理
          this.currentLyric = new Lyric(lyric,this.handleLyric)
          //若是播放状态
          if (this.playing) {
            //这里是调用lyric-parser的play方法，让歌词开始播放
            this.currentLyric.play()
          }
        }).catch(() => {
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      //处理歌词滚动
      handleLyric({lineNum, txt}) {
        //获得当前歌词的行数
        this.currentLineNum = lineNum
        //若行数大于5
        if (lineNum > 5) {
          //让scroll组件自动往上滑动
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric=txt
      },
      //开始滑动中间部分
      middleTouchStart(e) {
        this.touch.initiated = true
        // 用来判断是否是一次移动
        // this.touch.moved = false
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      //滑动中
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        // if (!this.touch.moved) {
        //   this.touch.moved = true
        // }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        this.$refs.lyricList.$el.style['transform'] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style['transitionDuration'] = 0
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style['transitionDuration'] = 0
      },
      //滑动结束
      middleTouchEnd() {
        // if (!this.touch.moved) {
        //   return
        // }
        let offsetWidth
        let opacity
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          if (this.touch.percent < 0.9) {
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        const time = 300
        this.$refs.lyricList.$el.style['transform'] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style['transitionDuration'] = `${time}ms`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style['transitionDuration'] = `${time}ms`
        this.touch.initiated = false
      },
      showPlaylist() {
        this.$refs.playlist.show()
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    //观测数据变化，有变化就调用这里的方法
    watch:{
      //根据当前歌曲数据状态变化，来播放歌曲
      currentSong(newSong,oldSong){
        if(!newSong.id){
          return
        }
        if (newSong.id === oldSong.id) {
          return
        }
        //切歌时，先把这首歌的歌词暂停清空
        if (this.currentLyric) {
          this.currentLyric.stop()
          this.currentTime = 0
          this.playingLyric=''
          this.currentLineNum = 0
        }
        clearTimeout(this.timer)
        this.timer=setTimeout(()=>{
          this.$refs.audio.play()
          this.getLyric()
        },1000)
      },
      //根据播放状态来设置暂停或播放
      playing(newPlaying){
        const audio =this.$refs.audio
        this.$nextTick(()=>{
          newPlaying ? audio.play() : audio.pause()
        })
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      //动画结束时的状态
      &.normal-enter-active,  &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      //动画开始时的状态
      &.normal-enter,  &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active,  &.mini-leave-active
        transition: all 0.4s
      &.mini-enter,  &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
