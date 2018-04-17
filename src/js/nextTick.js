// 异步队列
let queue = []
// 防止多次执行更新函数
let wating = false

const hasId = (queue, id) => {
  let index = -1
  queue.forEach((e,i) => {
    if (e.id === id) {
      index = i
    }
  })
  return index
}

// 事件队里中添加watcher
export const queueList = (watcher) => {
  let index = hasId(queue, watcher.id)
  if (index !== -1) {
    queue.push(watcher)
  } else {
    queue.splice(index, 0 , watcher)
  }
  if(!wating) {
    wating = true
    nextTick(flushSchedulerQueue)
  }
}

// 重置队列
const reset = () => {
  queue.length = 0
  wating = false
}
const flushSchedulerQueue = () => {
  queue.forEach(e => {
    e.update()
  })
  reset()
}
// 用promise建立一个新的microtask
// 没有考虑其他的场景，例如setTimeout, 但是setTimeout是 marcotask。
// 源码中还有MutationObserver,但是好像ios9有问题。
export const nextTick = (() => {
  let callbacks = []
  let p = Promise.resolve()
  let nextTickHandle = () => {
    let copies = callbacks.slice(0)
    callbacks.length = 0
    copies.forEach(e => {
      e()
    })
  }
  let timerFunc = () => {
    p.then(() => {
      nextTickHandle()
    }).catch(err => { console.log(err) })
  }
  return (cb, ctx) => {
    if (cb) {
      callbacks.push(() => {
        cb.call(ctx)
      })
    }
    timerFunc()
  }
})()