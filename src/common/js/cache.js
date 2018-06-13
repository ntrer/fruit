import storage from 'good-storage'
//搜索历史
const SEARCH_KEY = '__search__'
//搜索历史最大条目数
const SEARCH_MAX_LEN = 15

//播放历史
const PLAY_KEY = '__play__'
//搜索历史最大条目数
const PLAY_MAX_LEN = 200

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LEN = 200

//往搜索历史列表中添加
function insertArray(arr, val, compare, maxLen) {
  //查找当前搜索历史在列表中的索引
  const index = arr.findIndex(compare)
  //如果为0，表示就是第一条，直接返回
  if (index === 0) {
    return
  }
  //如果大于0，说明使靠后的历史
  if (index > 0) {
    //删除当前这条历史
    arr.splice(index, 1)
  }
  //把最新的历史放在第一条
  arr.unshift(val)
  //如果列表条目数超过15，则删除最后一条
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

//保存搜索历史
export function saveSearch(query) {
  //从本地读入搜索历史列表
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LEN)
  //重新设置保存历史列表
  storage.set(SEARCH_KEY, searches)
  //返回当前最新的历史列表
  return searches
}

//删除单个历史
export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

//删除所有历史
export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

//读取历史
export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

//保存播放历史
export function savePlay(song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, PLAY_MAX_LEN)
  storage.set(PLAY_KEY, songs)
  return songs
}

//读取播放历史
export function loadPlay() {
  return storage.get(PLAY_KEY, [])
}

export function saveFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LEN)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function deleteFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}

