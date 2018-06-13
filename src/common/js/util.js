
//得到两个数之间的随机数
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

//打乱重新排列一个数组
export function shuffle(arr) {
  //拷贝一份，避免对元数据产生影响
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}


//截留操作
export function debounce(func, delay) {
  let timer

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
