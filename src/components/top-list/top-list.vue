<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
  import MusicList from '../../components/music-list/music-list'
  import {getMusicList} from '../../api/rank'
  import {ERR_OK} from '../../api/config'
  import {mapGetters} from 'vuex'
  import {createSong} from '../../common/js/song'

  export default {
    name: "top-list",
    computed: {
      title() {
        return this.topList.topTitle
      },
      bgImage() {
        if (this.songs.length) {
          return this.songs[0].image
        }
        return ''
      },
      ...mapGetters([
        'topList'
      ])
    },
    data() {
      return {
        songs: [],
        rank: true
      }
    },
    created() {
      //获取歌曲数据
      this._getMusicList()
    },
    methods: {
      //获取歌曲数据
      _getMusicList() {
        if (!this.topList.id) {
          this.$router.push('/rank')
          return
        }
        getMusicList(this.topList.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.songlist)
          }
        })
      },
       //处理数据，类比android中的解析json数据，封装到实体bean中
      _normalizeSongs(list) {
        let ret = []
        //每一个数据都是一个musicData对象
        list.forEach((item) => {
          const musicData =item .data
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
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
