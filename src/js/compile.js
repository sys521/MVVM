import Watcher from './watcher.js'
class Compile {
  constructor (el,vm) {
    this.$vm = vm
    this.$el = document.querySelector(el)
    if (this.$el) {
      this.$fragment = this.CreateFragment(this.$el)
      this.init()
      this.$el.appendChild(this.$fragment)
    }
  }
  CreateFragment (node) {
    let fragment = document.createDocumentFragment()
    let child 
    while (child = node.firstChild) {
      fragment.appendChild(child)
    }
    return fragment
  }
  init() {
    this.compileFragment(this.$fragment)
  }
  compileFragment(el) {
    let nodesList = el.childNodes
    Array.prototype.forEach.call(nodesList, (node) => {
      var text = node.textContent;
      var reg = /{\{(.*)\}\}/

      if (this.isElementNode(node)) {

        this.compile(node)
      } else if (this.isTextNode(node) && reg.test(text)) {

        let dirVal = text.match(reg)[1]
        this.compileText(node, dirVal)
      }
      if (node.childNodes && node.childNodes.length) {
        this.compileFragment(node)
      }
    })
  }

  isElementNode (node) {
    return node.nodeType === 1 
  }

  isTextNode (node) {
    return node.nodeType === 3
  }

  compile (node) {
    let nodeAttrs = node.attributes
    Array.prototype.forEach.call(nodeAttrs, (e) => {
      let attrName = e.name
      if (this.isDirective(attrName)) {
        let dirVal = e.value
        let dir = attrName.substring(2)
        if (this.isEventDirective(dir)) {
          compileTool.eventHandler(node, this.$vm, dirVal, dir)
        } else {
          compileTool[dir] && compileTool[dir](node, this.$vm, dirVal)
        }
        node.removeAttribute(attrName)
      }
    }) 
  }

  isDirective (attr) {
    return attr.indexOf('v-') === 0
  }

  isEventDirective (dir) {
    return dir.indexOf('on') === 0
  }

  compileText (node, dirVal) {
    compileTool.text(node, this.$vm, dirVal, 'text');
  } 
}

const compileTool = {
  text (node, vm, dirVal) {
    this.bind(node, vm, dirVal, 'text')
  },
  model (node, vm, dirVal) {
    this.bind(node, vm, dirVal, 'model')
    let val = this._getVMval(vm, dirVal)
    node.addEventListener('input',(e) => {
      var newVal = e.target.value
      if (val === newVal) {
        return;
      }
      this._setVMval(vm, dirVal, newVal);
      val = newVal
    })
  },
  bind (node, vm, dirVal, dir) {
    let updateFn = updater[dir + 'Updater']
    updateFn && updateFn(node, this._getVMval(vm, dirVal))

    new Watcher(vm, dirVal, function(value, oldValue) {
      updateFn && updateFn(node, value, oldValue)
    })
  },
  eventHandler (node, vm, dirVal, dir) {
    let eventType = dir.split(':')[1]
    let fn = vm.$options.methods && vm.$options.methods[dirVal]

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },
  _getVMval (vm, dirVal) {
    let val = vm.$options.data[dirVal]
    return val
  },
  _setVMval (vm, dirVal, value) {
    vm.$options.data[dirVal] = value
  }
}
const updater = {
  textUpdater (node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value
  },
  modelUpdater (node, value, oldValue) {
    node.value = typeof value === 'undefined' ? '' : value;
  }
}
export default Compile