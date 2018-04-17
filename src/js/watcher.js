import Dep from './dep.js'
import {queueList} from './nextTick.js'
let id = 0
class Watcher {
  // vm: Vue
  // exp : data里面的具体的元素
  // cb 真正的更新函数。
  constructor(vm, exp, cb) {
    this.vm = vm,
    this.exp = exp,
    this.cb = cb
    this.id = id++
    this.value = this.get()
  }
  // 初始化时，访问数据，为了往订阅器中添加自己
  get () {
    Dep.target = this
    var value = this.vm.$options.data[this.exp]
    Dep.target = null
    return value
  }
  // 更新方法
  update () {
    var value = this.get()
    var oldVal = this.value
    if(value !== oldVal) {
      this.value = value;
      this.cb.call(this.vm, value, oldVal)
    }
  }
  // 异步更新方法
  run () {
    queueList(this)
  }
}

export default Watcher
