<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
  import {mapGetters} from 'vuex'
  import MusicList from '../../components/music-list/music-list'
  import {getSongList} from "../../api/recommend";
  import {ERR_OK} from "../../api/config";
  import {createSong} from "../../common/js/song";
  export default {
    name: "disc",
    data() {
      return {
        songs: []
      }
    },
    computed: {
      title() {
        return this.disc.dissname
      },
      bgImage() {
        return this.disc.imgurl
      },
      ...mapGetters([
        'disc'
      ])
    },
    created() {
      //获取歌曲列表
      this._getSongList()
    },
    methods: {
      //获取歌曲列表
      _getSongList() {
        //如果没有歌曲dissid，返回上一页
        if (!this.disc.dissid) {
          this.$router.push('/recommend')
          return
        }
        getSongList(this.disc.dissid).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.cdlist[0].songlist)
          }
        })
      },
      //处理数据，类比android中的解析json数据，封装到实体bean中
      _normalizeSongs(list) {
        let ret = []
        //每一个数据都是一个musicData对象
        list.forEach((musicData) => {
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>

