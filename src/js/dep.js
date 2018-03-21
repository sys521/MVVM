
class Dep {
  constructor () {
    this.subs = []
  }
  sub (sth) {
    if(this.subs.indexOf(sth) === -1) {
      this.subs.push(sth)
    }
    console.log('增加了消息')
    console.log(this.subs)
  }
  notify () {
    console.log('发布了消息')
    this.subs.forEach(e => {
      console.log(e, 'update')
      e.update()
    })
  }
}
Dep.target = null
export default Dep