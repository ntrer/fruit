//babel-polyfill,支持es6 api
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from "./store"
//解决移动端点击300ms延迟
import fastclick from 'fastclick'
import 'common/stylus/index.styl'
import VueLazyload from 'vue-lazyload'

fastclick.attach(document.body);

//配置vue懒加载
Vue.use(VueLazyload, {
  //设置默认图片
  loading: require('common/image/default.png')
})



/* eslint-disable no-new */
new Vue({
  router,
  el: '#app',
  store,
  render: h => h(App)
})
