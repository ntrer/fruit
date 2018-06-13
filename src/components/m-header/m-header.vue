<template>
  <div class="m-header">
    <div class="icon"></div>
    <h1 class="text">火 山 Music</h1>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  //引入样式
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .m-header {
    position: relative
    height: 44px
    text-align: center
    color: $color-theme
    font-size: 0
    background #31c27c
  }

    .icon {
      display: inline-block
      vertical-align: top
      margin-top: 6px
      width: 30px
      height: 32px
      margin-right: 9px
      background-image url("fire.png")
      background-size: 30px 32px
    }

    .text {
      display: inline-block
      vertical-align: top
      line-height: 44px
      font-size: $font-size-large
      color $color-text-d
    }
</style>
