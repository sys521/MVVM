---
title: 基于vue.js浅析MVVM原理，附代码实现
date: 2018-03-21 19:35:08
categories: 
  - js
  - 框架
  - vue.js
tags: 
  - vue.js
  - MVVM原理
---

# 前言
目前，前端三大流行框架分别是ag, react和vue, 围绕这些库的轮子也是被造的飞起，如果你还不懂MVVM是什么，并且，写过一些vue.js, 并且，好奇MVVM想知道到底是工作的，那么我们可以通过简单的代码来实现一下。当然这篇文章并不能让你写一个框架，只是新手向，看看其中的实现原理。

# MVVM

提到MVVM，好像就不得不说起MVC。 直接上图

[![97ImGj.md.png](https://s1.ax1x.com/2018/03/21/97ImGj.md.png)](https://imgchr.com/i/97ImGj)


我们可以假设，这里有一个数据 M 叫做 name . V中渲染了name的值, C 就是当用户操作V或者C时， C要首先告诉M，
你要做出变化了，M变化完之后，告诉V。我已经变成了另外一个样子了，你要改变了。。

[![97IUzR.md.png](https://s1.ax1x.com/2018/03/21/97IUzR.md.png)](https://imgchr.com/i/97IUzR)

这里就是MVVM。从图上看出，我们只需要把C换成VM就行。用户触发V变化以后，告诉VM, 然后VM告诉M， M变化完成之后告诉C， C在来通知V做相应的变化。。


听上去差别不大，但是，最大的差别就是M和V到底之间到底有没有通信。。。

就以前端为例子
如果页面渲染了一个input, value = name， js里面有一个obj = {name: 'xiaohong'}, 当用户改变input中的name。obj中的name也随之改变，同时，界面上一个div。里面装着obj.name的值。。

用代码很好实现，

我们可以input的change事件。 当value 变化， 让obj.name = value, 这些完成之后，通知div。你要渲染的值是多少。

这是传统的MVC。

但是，当我们用mvvm时，obj.name改变的时候，我们不再处理告诉div， 你要渲染多少了。只需要告诉VM，我已经变化了，div就是自己发生了变化。。

这就是MVVM。

# VUE中的响应式原理

 vue.js 主要是采用数据劫持结合发布者-订阅者模式的方式，通过Object.defineProperty()来劫持各个属性的setter，getter，在数据变动时发布消息给订阅者，触发相应的监听回调，实现了数据双向绑定，不再需要我们来维护V，只需要着重维护M如何变化就可以了。



主要的流程就是:

[![97oRNF.md.png](https://s1.ax1x.com/2018/03/21/97oRNF.md.png)](https://imgchr.com/i/97oRNF)


# 简单实现。

由上图和结合平常我们写的vue.js, 我们首先。

1. 实现一个observe。 观察data里面的数据。 当其中某一个数据变化通知dep。

2. 实现一个compile，解析html. 并根据html上面的指令，通知watcher。某一个node。绑定了 哪一个具体的数据。

3. 实现一个dep。 当某一个数据变化，通知所有订阅该数据的watcher，数据现在变成了多少。

4. 实现一个 watcher。 
  * 告诉dep。我订阅了哪个数据。
  * 当订阅的数据发生改变，接受dep的通知，订阅的数据发生了变化。变化的值是多少。
  * 通知订阅的node。你要更新了。


这大概就是从图上整理的思路。

然后我们规定调用这个简单的MVVM方法就是
```
const mvvm = new MVVM({
  $el: '#app', // 挂载的节点
  data: {}    // 维护的数据
  methods: {

  } // 用户交互时调用的触发的方法。
})
```

一切准备就绪。。开始。

## 实现observe.js

observe 目前已知的功能是
1. 遍历data的每一个属性，对每一个属性添加getter和setter。
2. 如果这个属性是对象，继续遍历，添加getter和 setter。(一个递归的方法)
3. 考虑到何时将dep添加到我们的observe中 ？ 

```
// 一个工具函数，判断是不是object.
const isObject  = (data) => {
  if (typeof data === 'object' && data !== null) {
    return ture
  }
}
// 直接面向对象吧。
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
    if (isObject(val)) {
      new Observe(val)
    } 
    Object.defineProperty (data, key, {
      get () {
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
      }
    })
  }
}

```
这就是我们不考虑第三条的时候写的一个 Observe。 当然，后面代码肯定需要调整。因为，我们这里面并没有加入dep。


## 实现compile。

> 注意！
  我们实现的compile只是要能解读我们自己简单的模板，并不需要完成的解析各种指令。今天的重点也不是解析模板，与处理绑定指令。。所以，compile越简单越好。

1. 获取指定的'#app'元素，复制所有#app里面的节点，并添加到一个fragment里面。
2. 对fragment解析，区分 text节点和元素节点。
3. 如果是text节点，就处理文本指令中的{} 做出处理。
4. 如果是element节点，根据绑定的指令来区分绑定的事件还是绑定的data的值，并做出处理。
5. 最终所有指令的处理，应该有get方法访问。 去访问data里面的值 和methods中的方法，并做出处理。

这里就不贴出完整的代码了。如果有需要可以点击 看完整的代码。 

## 实现一个dep。

dep的比较容易,我们只需要按照最简单的订阅发布模式写一个就行了。

```
class Dep {
  constructor () {
    this.subs = []
  }
  sub (sth) {
    // 避免重复添加。
    if(this.subs.indexOf(sth) === -1) {
      this.subs.push(sth)
    }
    console.log('增加了消息')
    console.log(this.subs)
  }
  notify () {
    console.log('发布了消息')
    this.subs.forEach(e => {
      ...
    })
  }
}
```
## 开始考虑后续。

其实，写到这里，估计没有完全没有难度，即使不看源码，不看别人的博客，基本都能实现。但是，往后面如何写下去?

开始思考，我们的watcher应该怎么写。同时，我们的dep应该怎么加入到observe中。

再结合图上的流程。

考虑这几个角色的关系。。
我们要解决几个问题。

1. 事件发布订阅模式，可以全局只有一个。如果不考虑我们上面写的简单代码，我们需要一个全局的事件中心，还是对每一数据观察的时候都要实现一个？
2. 订阅者是谁？ 发布者是谁？ 怎么把watcher和 observe通过dep联系起来。


  事实上，这个问题，我们应该放在写dep的时候就考虑。
  > 先解决简单的，订阅者和发布者毫无疑问都是watcher。 所以，我们的watcher长什么样子？

  > 如果只有一个，那么，我们要给添加事件的时候都得放一个独特的事件名称，并且在触发的时候需要知道我们要触发的特定的事件的名称。 光是维护这个事件中心，都是一个灾难。
  所以，我们的事件中心是多个，每一个数据都有各自的事件中心，每一次单个数据变化的时候，我们只需要通知这个数据的事件中心就可以了。

  > 我们的watcher怎么写。从模板解析完成处理指令的时候考虑。 当我们每有一个指令对应一个数据，我们就应该有一个watcher的实例。

  捋一捋大概是这个意思。

  假如我们有一个name 指令，对应的 data.name

  那么他们之间的关系应该是这样。

  [![97qMQJ.md.png](https://s1.ax1x.com/2018/03/21/97qMQJ.md.png)](https://imgchr.com/i/97qMQJ)


  > 所以，一切都很明了。大概考虑我们的代码应该怎么样实现吧。


1. 我们没有一个数据，都应该有一个dep。然后，我们每次观察数据的时候就创建一个新的实例。


2. 当数据被访问的时候，也就是1个watcher订阅了自己，所以，我们应该获取到知道这个watcher 是谁，然后，然后往get的时候添加自己。

3. set的时候就比较简单了，通知所有的订阅者。所以我们的代码可以这样。

```
Dep
//
defineReactive (data, key, val) {
    var dep = new Dep()
    if (isObject(val)) {
      new Observe(val)
    }
    ...

    ...
       get (value) {
         if (Dep.target) {
          dep.sub(Dep.target)
          console.log('订阅器添加东西了')
        }
        console.log('我被访问了')
        return val
       }
}
```
每次我们实例化一个wather的时候，就把Dep.target  指向自己。然后，访问完数据的时候，再把target变成null。

> 如果还不知道这个是干嘛的，我们待会先实现watcher的功能再来看这个。


## 实现watcher。

watcher 功能。

1. 每次解析完指令，实例化一个Watcher。这个watcher执行的时候，要立即访问data的某一个数据，然后，我们的订阅器就将这个watcher假如到相关数据的dep内。

2. wathcher要有一个更新方法，因为，当data中的值变化的时候，我们触发相应的dep。 dep通知所有订阅他的watcher，再调用每一个watcher的更新方法。

```
class Watcher {
  constructor(vm, exp, cb) {
    this.vm = vm,
    this.exp = exp,
    this.cb = cb
    // 立即去访问数据,并且记录value的值。
    this.value = this.get()
  }
  get () {
    // 把 target的改成自己。这样，我们访问触发 getter-> 添加自己-> 获取到value
    Dep.target = this
    var value = this.vm.$options.data[this.exp]
    console.log(value)
    Dep.target = null
    return value
  }
  update () {
    // 先去访问数据，然后新旧数据对比，如果不一样，就更新视图中的数据。
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
```

所以我们的watcher 大概长这样。

好像上面确实做到了改变视图的数据，那么，我们用户交互的时候，怎么改变data里面的数据呢。比如v-model？

下面我们就重点分析一下这个v-model的解析指令的实现。

```
import Watcher from './watcher.js'
class Compile {
  constructor (el,vm) {
    this.$vm = vm
    this.$el = document.querySelector(el)
    console.log(this.$el)
    if (this.$el) {
      this.$fragment = this.CreateFragment(this.$el)
      console.log(this.$el)
      this.init()
      this.$el.appendChild(this.$fragment)
    }
  }
  // 将所有app中的节点复制到$fragment
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
  // 解析这个$fragment
  compileFragment(el) {
    let nodesList = el.childNodes
    Array.prototype.forEach.call(nodesList, (node) => {
      var text = node.textContent;
      var reg = /{\{(.*)\}\}/
      // 如果是元素节点

      if (this.isElementNode(node)) {

        console.log(node, 'element-node')
        // 继续解析，主要解析上面的指令。例如v-model, v-on.
        this.compile(node)

        // 如果是文本节点
      } else if (this.isTextNode(node) && reg.test(text)) {

        console.log(node, 'test-node')
        let dirVal = text.match(reg)[1]
        console.log(dirVal)
        // 解析
        this.compileText(node, dirVal)
      }

      // 递归解析子节点
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
        // 解析命令，和命令的值。

        let dirVal = e.value
        let dir = attrName.substring(2)

        console.log(dirVal)
        console.log(dir)
        
        // 处理事件的指令，如v-on
        if (this.isEventDirective(dir)) {
          compileTool.eventHandler(node, this.$vm, dirVal, dir)
        } else {

          //处理普通指令
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
    console.log(node, 'test-node')
    console.log(dirVal)
    compileTool.text(node, this.$vm, dirVal, 'text');
  } 
}

// 指令处理
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

  // 主要是bind指令
  bind (node, vm, dirVal, dir) {
    console.log(vm)
    let updateFn = updater[dir + 'Updater']
    console.log(this._getVMval(vm, dirVal))

    // 访问data, 然后，更新对应的node.
    updateFn && updateFn(node, this._getVMval(vm, dirVal))

    // 生成一个新的watcher实例，然后，订阅自己。
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

  // 访问指令对应的值，例如 v-model=“name”， 去获取name的值。
  _getVMval (vm, dirVal) {
    console.log(vm)
    let val = vm.$options.data[dirVal]
    return val
  },

  // 改变对应的值，主要是在v-model双向绑定中用到。 
  _setVMval (vm, dirVal, value) {
    vm.$options.data[dirVal] = value
  }
}
  // 更新方法，我们初次init的时候，相当于手动调用了一次这个方法，然后再把更新方法给 watcher。
  // 以后data的值改变，就会触发dep, 从而触发watcher，实现自动更新。
const updater = {
  textUpdater (node, value) {
    console.log(node)
    node.textContent = typeof value === 'undefined' ? '' : value
  },
  modelUpdater (node, value, oldValue) {
    node.value = typeof value === 'undefined' ? '' : value;
  }
}
export default Compile
```

# 最后github



# 结束。

最后，我们这样的MVVM也算写完了，当然，我们compile函数实际比较弱鸡，因为对不同的指令处理方法没有写完，我们还没有考虑一些数组的更新。等等等。。

但是至少我们也大致实现了一些功能。
有的小伙伴说，哇，这么多行代码就实现个这破玩意，但是，，至少我们大致实现了VUE的双向数据绑定的原理了不是？

另外本篇文章所有代码几乎都是参考了源码。但是写起来也实属不易。