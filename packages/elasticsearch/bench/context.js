const contextualize = require('@rule.js/contextualize')
const elasticsearch = require('../lib')
const Rule = require('@rule.js/core').extend({}, {
  elasticsearch,
  contextualize
})

let count = 0
let last = Rule()
while (++count < 30) last = last.or()
last.equal('foo', 'bar').propsEqual('person.name', 'foo')
while (--count > 0) last.end()

const data = []
while (++count < 10000) data.push({ [`${count}k`]: `${count}` })

const start = Date.now()
const person = { name: 'foo' }
while (--count > 0) {
  last.contextualize({ person }).elasticsearch()
}

const end = Date.now()
console.log('time: %sms', end - start)
