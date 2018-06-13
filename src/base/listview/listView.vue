<template>
  <scroll @scroll="scroll"
          :listen-scroll="listenScroll"
          :probe-type="probeType"
          :data="data"
          class="listview"
          ref="listview">
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
            <img class="avatar" v-lazy="item.avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!--右边的快捷导航栏-->
    <!--@touchstart.stop.prevent绑定点击事件，并屏蔽冒泡-->
    <div class="list-shortcut" @touchstart.stop.prevent="onShortcutTouchStart"
         @touchmove.stop.prevent="onShortcutTouchMove"
         @touchend.stop>
      <ul>
        <!--:class="{'current':currentIndex===index}"：当前的index与滚动到的区域对应的导航点一样时，添加激活样式-->
        <li v-for="(item, index) in shortcutList" v-bind:data-index="index" class="item"
            :class="{'current':currentIndex===index}">{{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}} </div>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
  import Scroll from "../../base/scroll/scroll"
  import {getData} from '../../common/js/dom'
  import Loading from '../../base/loading/loading'

  const TITLE_HEIGHT = 30
  //每个导航点的高度
  const ANCHOR_HEIGHT = 18
  export default {
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    computed: {
      //遍历map集合，获取每组标题的第一个字符，用来做导航栏的内容
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },
      fixedTitle() {
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    data() {
      return {
        //实时滚动到的位置
        scrollY: -1,
        //当前对应的导航点，要高亮
        currentIndex: 0,
        //
        diff: -1
      }
    },
    created() {
      //用于存储点击的导航点
      this.touch = {}
      //
      this.probeType = 3
      //设置scroll监听滚动
      this.listenScroll = true
      //每个group的高度
      this.listHeight = []
    },
    methods: {
      //将ListView的item的点击事件派发出去
      selectItem(item) {
        this.$emit('select', item)
      },
      //点击快捷导航栏，跳转到对应的歌手列表
      onShortcutTouchStart: function (e) {
        //获取点击的导航点
        let anchorIndex = getData(e.target, 'index')
        //获取点击的坐标
        let firstTouch = e.touches[0]
        //获取点击的y坐标
        this.touch.y1 = firstTouch.pageY
        //存储当前点击的导航点
        this.touch.anchorIndex = anchorIndex
        //滚动到导航点对应的歌手列表
        this._scrollTo(anchorIndex)
      },
      onShortcutTouchMove: function (e) {
        //获取滑动结束时的坐标
        let firstTouch = e.touches[0]
        //获取滑动结束时的y坐标
        this.touch.y2 = firstTouch.pageY
        //按下的y坐标-滑动结束时的y坐标/每个导航点的高度=滑过的导航点的个数
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        //取出按下时的导航点，加上划过的个数，即时滑动停止时的导航点
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta
        //滚动到导航点对应的歌手列表
        this._scrollTo(anchorIndex)
      },
      //scroll组件监听滚动
      scroll(pos) {
        //得到scroll组件实时滚动的距离
        this.scrollY = pos.y
      },

      //计算每个group的高度，这个高度不是指本身的高度，而是从上往下算的高度
      //比如第二个group的顶部距离页面顶部的高度
      _calculateHeight() {
        this.listHeight = []
        //得到所有group
        const list = this.$refs.listGroup
        //第一个高度为0
        let height = 0
        this.listHeight.push(height)
        //遍历，计算每个group的高度，存入集合
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          this.listHeight.push(height)
        }
      },
      //跳转到对应的歌手列表
      _scrollTo(index) {
        if (!index && index !== 0) {
          return
        }
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        this.scrollY = -this.listHeight[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      },
      refresh(){
        this.$refs.listview.refresh()
      }
    },
    //观测数据的变化
    watch: {
      data() {
        setTimeout(() => {
          //每次滑动，高度再变，要实时计算到达的group的高度
          this._calculateHeight()
        }, 20)
      },
      //观测滚动的高度
      scrollY(newY) {
        const listHeight = this.listHeight
        // 当滚动到顶部，newY>0
        if (newY > 0) {
          //当前导航点为热门，热门呢高亮
          this.currentIndex = 0
          return
        }
        // 在中间部分滚动
        for (let i = 0; i < listHeight.length - 1; i++) {
          //上一个group的高度
          let height1 = listHeight[i]
          //下一个group的高度
          let height2 = listHeight[i + 1]
          //如果大于上一个，小于下一个，那么导航点就为中间的
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            this.diff = height2 + newY
            return
          }
        }
        // 当滚动到底部，且-newY大于最后一个元素的上限
        this.currentIndex = listHeight.length - 2
      },
      diff(newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
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

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: #f4f4f4
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-ll
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: #f4f4f4
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
