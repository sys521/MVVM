import Dep from './dep.js'
// 判断是不是object类型

let isObject = (data) => {
  if (typeof data === 'object' && data !== null) {
    return true
  }
}

class Observe {
  constructor(data) {
    this.walk(data)
  }
  walk (data) {
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }
  defineReactive (data, key, val) {
    var dep = new Dep()
    if (isObject(val)) {
      new Observe(val)
    } 
    Object.defineProperty (data, key, {
      get () {
        if (Dep.target) {
          dep.sub(Dep.target)
          console.log('订阅器添加东西了')
        }
        console.log('我被访问了')
        return val
      },
      set (newVal) {
        if (newVal === val) {
          return;
        }
        val = newVal
        // 新的值是object的话，进行监听
        if (isObject(val)) {
          new Observe(val)
        }
        // 通知订阅者
        dep.notify()
      }
    })

  }
}

export default Observe