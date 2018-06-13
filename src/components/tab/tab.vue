<template>
  <div class="tab">
    <!-- router-link默认渲染为a标签，tag="div"是把router-link渲染为div-->
    <router-link tag="div" class="tab-item" to="/recommend">
      <span class="tab-link">推荐</span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/singer">
      <span class="tab-link">歌手</span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/rank">
      <span class="tab-link">排行
      </span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/search">
      <span class="tab-link">搜索</span>
    </router-link>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  //引入样式
  @import "~common/stylus/variable"
  .tab {
    display: flex
    height: 44px
    line-height: 44px
    font-size: $font-size-medium
  }
    .tab-item {
      flex: 1
      text-align: center
    }
      .tab-link {
        padding-bottom: 5px
        color: $color-text
      }
      //设置选中后给  tab-link添加router-link-active类，从而实现点击高亮效果
      &.router-link-active
        .tab-link {
          color: $color-theme
          border-bottom: 2px solid $color-theme
        }
</style>
