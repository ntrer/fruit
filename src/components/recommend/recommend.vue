
<template>
  <div class="recommend" ref="recommend">
    <!--滚动组件，绑定数据data="discList"，是为了让数据加载出来后
       撑开scroll组件，从而得到正确的滚动高度
     -->
    <scroll ref="scroll" class="recommend-content" :data="discList">
     <div >
      <!--v-if="recommends.length"，确保有数据后再取加载轮播图-->
      <div v-if="recommends.length" class="slider-wrapper" ref="sliderWrapper">
        <slider>
          <div v-for="item in recommends">
            <a v-bind:href="item.linkUrl">
              <!--@load="loadImage"等同于v-on:load,绑定事件-->
              <!-- class="needsclick"是fastclick的一个属性，可以用来解决 fastclick和betterScroll的
                   点击事件冲突
              -->
              <img class="needsclick" @load="loadImage" v-bind:src="item.picUrl" >
            </a>
          </div>
        </slider>
      </div>
      <div class="recommend-list">
        <h1 class="list-title">热门歌曲列表</h1>
        <ul>
          <li @click="selectItem(item)" v-for="item in discList" class="item">
            <div class="icon">
              <img width="60" height="60" v-lazy="item.imgurl">
            </div>
            <div class="text">
              <h2 class="name" v-html="item.creator.name"></h2>
              <p class="desc" v-html="item.dissname"></p>
            </div>
          </li>
        </ul>
      </div>
    </div>
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getRecommend,getPlayList} from "../../api/recommend";
  import {ERR_OK} from "../../api/config";
  import Slider from '../../base/slider/slider'
  import Scroll from "../../base/scroll/scroll"
  import Loading from '../../base/loading/loading'
  import {playlistMixin} from "../../common/js/mixin";
  import {mapMutations} from 'vuex'
  export default {
    mixins:[playlistMixin],
    data(){
      return{
        recommends:[],
        discList:[]
      }
    },

    components:{
      Slider,
      Scroll,
      Loading
    },

    created() {
      this._getRecommend()
      this._getPlayList()
    },

    methods: {
      loadImage() {
        //监听轮播图的图片加载
        //只监听一次，一旦有一张图片加载成功就不再监听了
        //用来撑起高度，然后让scroll刷新，计算高度
        if (!this.checkloaded) {
          this.checkloaded = true
          this.$refs.scroll.refresh();
        }
      },
      _getRecommend() {
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
           this.recommends=res.data.slider;
          }
        })
      },
      _getPlayList() {
        getPlayList().then((res) => {
          if (res.code === ERR_OK) {
            this.discList=res.data.list;
          }
        })
      },
      //当有了歌曲播放列表数据后，重新计算scrool组件高度
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      selectItem(item) {
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
        this.setDisc(item)
      },
      ...mapMutations({
        setDisc: 'SET_DISC'
      })
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0

    .recommend-content
      height: 100%
      overflow: hidden

      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden

      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme

        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px

          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px

          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium-x

            .name
              margin-bottom: 10px
              color: $color-text

            .desc
              color: $color-text-l

      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)

</style>
