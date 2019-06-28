const Rule = require('../lib')

const rule = Rule()

let last = rule
let count = 0
while (++count < 30) last = last.or()
last.equal('foo', 'bar')
while (--count > 0) last = last.end()

const start = Date.now()
while (++count < 10000) last.test({ foo: 'bar' })
const end = Date.now()

console.log('time: %sms', end - start)
