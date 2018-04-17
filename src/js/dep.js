
class Dep {
  constructor () {
    this.subs = []
  }
  sub (sth) {
    if(this.subs.indexOf(sth) === -1) {
      this.subs.push(sth)
    }
  }
  notify () {
    this.subs.forEach(e => {
      e.run()
    })
  }
}
Dep.target = null
export default Dep