<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  const progressBtnWidth = 16
  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      },
    },
    created() {
      this.touch = {}
    },
    methods:{
      //开始拖动
      progressTouchStart(e) {
        //初始化拖动事件
        this.touch.initiated = true
        //获取手指按下的坐标
        this.touch.startX = e.touches[0].pageX
        //当前播放进度的位置
        this.touch.left = this.$refs.progress.clientWidth
      },
      //拖动中
      progressTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        //得到从按下到拖动结束的偏移位置
        const deltaX = e.touches[0].pageX - this.touch.startX
        //得到从进度条起点到拖动位置的偏移距离
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
        //设置进度条和进度小球的移动
        this._offset(offsetWidth)
      },
      //结束拖动
      progressTouchEnd() {
        //取消拖动事件
        this.touch.initiated = false
        //派发拖动结束的事件
        this._triggerPercent()
      },
      //点击进度条实现改变播放进度
      progressClick(e) {
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
        // this._offset(e.offsetX)
        this._triggerPercent()
      },
      //派发拖动结束的事件
      _triggerPercent() {
        //进度条宽度
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        //播放进度比=拖动后播放进度的位置/进度条长度
        const percent = this.$refs.progress.clientWidth / barWidth
        this.$emit('percentChange', percent)
      },
      //设置进度条和进度小球的移动
      _offset(offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style['transform'] = `translate3d(${offsetWidth}px,0,0)`
      }
    },
    watch: {
      percent(newPercent) {
        if (newPercent >= 0) {
          //得到进度条的长度
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          //根据进度比，计算进度小球的偏移距离
          const offsetWidth = newPercent * barWidth
          //设置进度条和进度小球的移动
          this._offset(offsetWidth)
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
