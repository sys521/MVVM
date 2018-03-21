import Dep from './dep.js'

class Watcher {
  constructor(vm, exp, cb) {
    this.vm = vm,
    this.exp = exp,
    this.cb = cb
    this.value = this.get()
  }
  get () {
    Dep.target = this
    var value = this.vm.$options.data[this.exp]
    console.log(value)
    Dep.target = null
    return value
  }
  update () {
    var value = this.get()
    var oldVal = this.value
    console.log(oldVal, 'asdklciicicicicici')
    if(value !== oldVal) {
      console.log('我去更新视图了')
      this.value = value;
      this.cb.call(this.vm, value, oldVal)
    }
  }
}

export default Watcher
