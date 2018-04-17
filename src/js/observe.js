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
    // 遍历data,劫持访问和修改
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }
  defineReactive (data, key, val) {
    var dep = new Dep()
    if (isObject(val)) {
      new Observe(val)
    }
    // get时,往订阅器中添加自己。
    // Dep.target是一个watcher的实例。
    // 模板解析完成，每一个指令新建一个watcher实例，触发一下watcher实例的get方法。
    Object.defineProperty (data, key, {
      get () {
        if (Dep.target) {
          dep.sub(Dep.target)
        }
        return val
      },
      // set时，
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