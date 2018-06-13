<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
    <slot>
    </slot>
    </div>
    <div class="dots">
      <!--如果当前下标和index相同，添加激活样式-->
      <span class="dot" v-bind:class="{active: currentPageIndex === index }" v-for="(item, index) in dots"></span>
    </div>
  </div>
</template>

<script>
  import BScroll from 'better-scroll'
  import {addClass} from "../../common/js/dom";

  export default {
    name: "slider",
    props: {
      loop: {
        type: Boolean,
        default: true
      },
      autoPlay: {
        type: Boolean,
        default: true
      },
      interval: {
        type: Number,
        default: 4000
      }
    },
    data() {
      return {
        //轮播指示点
        dots: [],
        //当前轮播图的下标
        currentPageIndex: 0
      }
    },
    //在模板渲染成html后调用，通常是初始化页面完成后，再对html的dom节点进行一些需要的操作。
    mounted(){
      setTimeout(()=>
      {
        //设置轮播图宽度
        this._setSliderWidth();
        //设置轮播指示点
        this._initDots();
        //初始化轮播图的滚动库
        this._initSlider();
        //设置自动轮播
        if (this.autoPlay) {
          this._play()
        }
      }, 25);

      //监听屏幕尺寸变化
      window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        //重新设置轮播控件大小
        this._setSliderWidth(true);
        //刷新加载
        this.slider.refresh();
      })
    },
    //组件激活时，开始自动轮播
    activated() {
      if (this.autoPlay) {
        this._play()
      }
    },
    //组件停用时，停止自动轮播
    deactivated() {
      clearTimeout(this.timer)
    },
    //组件销毁前，停止轮播
    beforeDestroy() {
      clearTimeout(this.timer)
    },
    methods:{
      //设置轮播图宽度
      _setSliderWidth(isResize) {
        //$refs：用ref绑定的元素，可以通过this.$refs.xxxx来进行调用
        //相当于使用js获取dom进行操作，但更加简单
        this.children = this.$refs.sliderGroup.children
        let width = 0
        //获得slider所占页面的宽度，clientWidth：网页可见区域宽
        let sliderWidth = this.$refs.slider.clientWidth
        //遍历每一个子元素，给它们加上样式，并设置宽度
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          addClass(child, 'slider-item')
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        //如果是循环滚动，让宽度加倍
        if (this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      //设置轮播指示点
      _initDots() {
        //根据子元素的个数来设置
        this.dots = new Array(this.children.length)
      },
      //初始化轮播图的滚动库
      _initSlider() {
        //使用的第三方的better-scroll库
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false,
          snap: true,
          snapLoop: this.loop,
          snapThreshold: 0.3,
          snapSpeed: 400
        });
        //监听每张图片切换完成时
        this.slider.on('scrollEnd', () => {
          //得到图片下标
          let pageIndex = this.slider.getCurrentPage().pageX;
          //因为要无限轮播，会自动在前面和后面各拷贝一份第一个和最后一个
          //所以要先减去第一个拷贝的，才是真正的第一个元素下标
          if (this.loop) {
            pageIndex -= 1
          }
          this.currentPageIndex = pageIndex

          if (this.autoPlay) {
            this._play()
          }
        });

        this.slider.on('beforeScrollStart', () => {
          if (this.autoPlay) {
            clearTimeout(this.timer)
          }
        })
      },
      //开始轮播
      _play() {
        let pageIndex = this.currentPageIndex + 1;
        //因为要无限轮播，会自动在前面和后面各拷贝一份第一个和最后一个
        if (this.loop) {
          pageIndex += 1
        }
        this.timer = setTimeout(() => {
          this.slider.goToPage(pageIndex, 0, 400)
        }, this.interval)
      }

    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px

    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap

      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center

        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none

        img
          display: block
          width: 100%

    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0

      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l

        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll

</style>
