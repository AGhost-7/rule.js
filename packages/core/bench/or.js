const Rule = require('../lib')

const rule = Rule()

let last = rule
let count = 0
while (++count < 30) last = last.or()
last.equal('foo', 'bar')
while (--count > 0) last = last.end()

const data = []
while (++count < 50000) {
  data.push({ [`foo${count}`]: `foobar${count}` })
}

const start = Date.now()
while (--count > 0) {
  last.test(data[count])
}
const end = Date.now()

console.log('time: %sms', end - start)
