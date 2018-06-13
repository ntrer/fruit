<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {getSingerDetail} from "../../api/singer"
  import {ERR_OK} from "../../api/config";
  import {createSong} from "../../common/js/song";
  import MusicList from "../../components/music-list/music-list"

  export default {
    name: "singer-detail",
    computed: {
      //使用对象展开运算符将 getter 混入 computed 对象中
      //获取保存在Vuex 的 store 中的数据状态
      ...mapGetters([
        'singer'
      ]),
      //歌手名字
      title() {
        return this.singer.name
      },
      //背景图片
      bgImage() {
        return this.singer.avatar
      },
    },
    data() {
      return {
        songs:[]
      }
    },
    components:{
      MusicList
    },
    created() {
      this._getDetail();
    },
    methods: {
      _getDetail() {
        //如果获取歌手详情信息失败，直接返回歌手列表
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        //获取歌手详情
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.data.list)
          }
        })
      },
      //处理数据，类比android中的解析json数据，封装到实体bean中
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          //每一个数据都是一个musicData对象
          let {musicData} = item;
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
