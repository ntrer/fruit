<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" class="box" v-model="query" :placeholder="placeholder">
    <i @click="clear" v-show="query" class="icon-dismiss"></i>
  </div>
</template>

<script>
  import {debounce} from "../../common/js/util";

  export default {
    name: "search-box",
    props: {
      placeholder: {
        type: String,
        default: '搜索歌曲，歌手'
      }
    },
    data() {
      return {
        query: ""
      }
    },
    methods: {
      //清除搜索内容
      clear() {
        this.query = ""
      },
      //将热门标签设置到搜索框
      setQuery(query) {
        this.query = query
      },
      //使输入框失去焦点
      blur(){
        this.$refs.query.blur()
      }
    },
    created() {
      //监听搜索内容
      this.$watch('query', debounce((newQuery) => {
        //向外派发搜索事件
        this.$emit('query', newQuery)
      },200))
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: #fff
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-dialog-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: #fff
      color: $color-text
      font-size: $font-size-medium
      &::placeholder
        color: $color-text-l
    .icon-dismiss
      font-size: 16px
      color: $color-text-l
</style>
