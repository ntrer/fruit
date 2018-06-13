import jsonp from '../common/js/jsonp'
import {commonParams, options} from './config'
import axios from 'axios'

//获取轮播图数据
export function getRecommend() {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

  //Object.assign({},obj,obj1)的作用：1。合并多个对象
  //2.克隆对象（浅）；
  //3.为对象添加多个方法
  //花括号叫目标对象，后面的obj、obj1是源对象。对象合并是指：将源对象里面的属性添加到目标对象中
  const data=Object.assign({},commonParams,{
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  });

  return jsonp(url,data,options);
}

// 获取播放列表
export function getPlayList() {
  const url = '/api/getPlayList'
  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json'// 限定返回数据类型
  })

  return axios.get(url, {
    params: data
  }).then(res => {
    return Promise.resolve(res.data)
  })
}

export function getSongList(disstid) {
  const url = '/api/getSongList'

  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    g_tk:1917493083,
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
