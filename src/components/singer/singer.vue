
<template>
 <div class="singer" ref="singer">
   <!--@select="selectSinger"：响应listview派发的item点击事件-->
 <listview @select="selectSinger"  v-bind:data="singers" ref="list"></listview>
   <router-view></router-view>
 </div>
</template>

<script typr="text/ecmascript-6">
  import {getSingerList} from "../../api/singer"
  import {ERR_OK} from "../../api/config";
  import Singer from '../../common/js/singer'
  import Listview from '../../base/listview/listView'
  import { mapMutations } from 'vuex'
  import {playlistMixin} from "../../common/js/mixin";
  //热门歌手数量
  const HOT_SINGER_LEN = 10
  const HOT_NAME = '热门'

    export default {
      name: "singer",
      mixins:[playlistMixin],
      data(){
          return{
            singers:[]
          }
      },
      components:{
        Listview
      },
      created(){
          this._getSingerList()
       },

      methods:{
        //更改 Vuex 的 store 中的状态的唯一方法是提交 mutation
        //在组件中使用 this.$store.commit('xxx') 提交 mutation，或者使用 mapMutations 辅助函数将组件中的 methods 映射为 store.commit 调用
        ...mapMutations({
          setSinger:'SET_SINGER'//将 `this.setSinger(singer);` 映射为 `this.$store.commit('SET_SINGER', amount)
        }),

        //跳转到对应的歌手界面
        selectSinger(singer){
          this.$router.push({
            path:`/singer/${singer.id}`
          })
          //保存当前点击的item的对象的数据到Vuex 的 store 中的状态
          //可以类比android中的sp存储
          this.setSinger(singer);
        },

        //得到歌手列表
        _getSingerList(){
          getSingerList().then((res)=>{
            if(res.code==ERR_OK){
              this.singers=this._normalizeSinger(res.data.list);
            }
          })
        },

         //当有了歌曲播放列表数据后，重新计算scrool组件高度
        handlePlaylist(playlist) {
          const bottom = playlist.length > 0 ? '60px' : ''
          this.$refs.singer.style.bottom = bottom
          this.$refs.list.refresh()
        },
        //将得到的数据进行分类处理
        //因为从qq服务器得到的是一坨数据
        //我们的需求是，显示一个热么列表，放10个歌手，然后再按字幕顺寻排列，所以需要将原数据处理一下
        _normalizeSinger(list) {
          //map集合，用来存放处理好的数据
          let map = {
            //热门歌手集合
            hot: {
              title: HOT_NAME,
              items: []
            }
          }

          //对数据进行遍历
          list.forEach((item,index)=>{
            //前10个数据放入热门歌手集合
            if (index < HOT_SINGER_LEN) {
              map.hot.items.push(new Singer({
                name: item.Fsinger_name,
                id: item.Fsinger_mid
              }))
            }

            //得到每个歌手名字的首字母
            const key = item.Findex
            //根据字母创建集合
            if (!map[key]) {
              map[key] = {
                title: key,
                items: []
              }
            }
            //将同一字母的歌手存入一个集合中
            map[key].items.push(new Singer({
              name: item.Fsinger_name,
              id: item.Fsinger_mid
            }))
          })

          // 为了得到有序列表，我们需要处理 map
          let ret = []
          let hot = []
          //遍历map集合
          for (let key in map){
            //根据字母得到歌手
            let val = map[key]
            //将数据分成字母排序集合
            if (val.title.match(/[a-zA-Z]/)) {
              ret.push(val)
            }
            //以及热门歌手集合
            else if (val.title === HOT_NAME) {
              hot.push(val)
            }
          }

          //字母集合按照字母表顺序排序
          ret.sort((a, b) => {
            return a.title.charCodeAt(0) - b.title.charCodeAt(0)
          })

          //把字母排序集合放在热门歌手集合下面
          return hot.concat(ret)
        }
      }

    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.singer{
  position: fixed
  top:88px
  bottom :0
  width :100%
}
</style>
