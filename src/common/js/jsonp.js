import originJSONP from 'jsonp'

//将方法暴露出去
export default function jsonp(url,data,option) {
  //拼接请求参数
  //先判断传入的url中有没有?,有的话代表第一个参数已经有了，所以接下类的参数前面要先加上&
  //若没有?,则要先加上？然后从第一个参数开始拼接
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data);

  //使用Promise请求
  return new Promise((resolve ,reject)=>{
    //调用jsonp完成跨域请求
    originJSONP(url, option, (err, data)=>{
        if(!err){
          resolve(data)
        }
        else {
          reject(err);
        }
    });
  });

}


//拼接请求参数
export function param(data) {
  let url='';
  //遍历参数数组
  for (var k in data){
    //得到每个参数的值
    let value = data[k] !== undefined ? data[k] : '';
    //使用es6模板字符串拼接参数，因为url参数是以&链接的，所以在前面加上&
    url+=`&${k}=${encodeURIComponent(value)}`;
  }
  //去掉第一个&,因为第一个参数前面没有&
  return url?url.substring(1):'';
}
