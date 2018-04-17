import Compile from './js/compile.js'
import Observe from './js/observe.js'
import {nextTick} from './js/nextTick.js'
class MVVM {
  constructor (options) {
    this.$options = options
    var data = this._data = this.$options.data
    // 属性代理，实现 vm.xxx -> vm._data.xxx // 如果代理没有找到，还会从自身属性找。
    Object.keys(data).forEach(key => {
      this._proxy(key)
    })
    this.init ()
  }
  // 初始化
  init () {
    new Observe(this._data)
    this.$compile = new Compile(this.$options.$el, this)
  }
  // 属性代理，代理data属性。
  _proxy (key) {
    var that = this
    Object.defineProperty(this, key, {
      get () {
        return that._data[key]
      },
      set (val) {
        that._data[key] = val
      }
    })
  }
  // 异步更新完成以后
  $nextTick (fn) {
    return nextTick(fn, this)
  }
}
const mvvm = new MVVM({
  $el:'#app',
  data: {
    name: 'xiaoming',
    name2: 'haha'
  },
  methods:{
    changeName () {
      this.name = 'saddfasdfasdf'
      let text = document.getElementsByClassName('haha')
      console.log(text[0].innerText)
      console.log('xxxxxxxxxxxx')
      this.$nextTick(() => {
        console.log(text[0].innerText)
      })
    }
  }
})