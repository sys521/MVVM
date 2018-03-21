import Compile from './js/compile.js'
import Observe from './js/observe.js'

class MVVM {
  constructor (options) {
    this.$options = options
    this.apc = 'adsfadsf'
    var data = this._data = this.$options.data
    // 属性代理，实现 vm.xxx -> vm._data.xxx // 如果代理没有找到，还会从自身属性找。
    Object.keys(data).forEach(key => {
      this._proxy(key)
    })
    this.init ()
  }
  init () {
    new Observe(this._data)
    this.$compile = new Compile(this.$options.$el, this)
  }
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
}
console.log('adsfasdf')
const mvvm = new MVVM({
  $el:'#app',
  data: {
    name: 'xiaoming',
    name2: 'haha'
  },
  methods:{
    changeName () {
      this.name = this.name2
    }
  }
})