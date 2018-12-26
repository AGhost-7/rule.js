'use strict'

const assign = require('lodash.assign')
const toPath = require('lodash.topath')
const get = require('lodash.get')

const returnFirst = type => (self, test, types, data) => {
  const results = Array(test.tests.length)
  for (let i = 0; i < test.tests.length; i++) {
    const orTest = test.tests[i]
    const result = types[orTest.type](self, orTest, types, data)
    if (result.type === type) {
      return result
    }
    results[i] = result
  }
  return {
    type: 'or',
    tests: results
  }
}

const runWithContext = (type, data, test, self) => {
  if (self.assertions[type](data, test, self)) {
    return {
      type: 'pass'
    }
  } else {
    return {
      type: 'fail'
    }
  }
}

const runIfKey = type => (self, test, types, data) => {
  const path = toPath(test.key)
  if (path[0] in data) {
    return runWithContext(type, data, test, self)
  } else {
    return test
  }
}

const ifBase = (self, types, data, tests) => {
  let allPass = false
  const results = Array(tests.length)
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i]
    const result = types[test.type](self, test, types, data)
    if (result.type === 'fail') {
      return result
    } else if (result.type !== 'pass') {
      allPass = false
    }
    results[i] = result
  }
  if (allPass) {
    return {
      type: 'pass'
    }
  } else {
    return {
      type: 'and',
      tests: results
    }
  }
}

const builtinTypes = {
  not(self, test, types, data) {
    const result = types[test.args.type](self, test.args, types, data)
    if (result.type === 'pass') {
      return {
        type: 'fail'
      }
    } else if (result.type === 'fail') {
      return {
        type: 'pass'
      }
    } else {
      return {
        type: 'not',
        args: result
      }
    }
  },
  or: returnFirst('pass'),
  and: returnFirst('fail'),
  if(self, test, types, data) {
    const result = Array(test.conds.length)
    let allPass = true
    for (let i = 0; i < result.length; i++) {
      const condTest = test.conds[i]
      result[i] = types[condTest.type](self, condTest, types, data)
      if (result.type === 'fail') {
        if (test.ifFalse.length > 0) {
          return ifBase(self, types, data, test.ifFalse)
        } else {
          return {
            type: 'pass'
          }
        }
      } else if (result.type !== 'pass') {
        allPass = false
      }
    }

    if (allPass) {
      return ifBase(self, types, data, test.ifTrue)
    } else {
      return {
        type: 'if',
        conds: result,
        ifTrue: ifBase(self, types, data, test.ifTrue),
        ifFalse: ifBase(self, types, data, test.ifFalse)
      }
    }
  },
  fail(self, test) {
    return test
  },
  pass(self, test) {
    return test
  },
  equal: runIfKey('equal'),
  any: runIfKey('any'),
  propsEqual(self, test, types, data) {
    const path1 = toPath(test.keys[0])
    const path2 = toPath(test.keys[1])
    if (path1[0] in data) {
      if (path2[0] in data) {
        return runWithContext('propsEqual', data, test, self)
      } else {
        return {
          type: 'equal',
          key: test.keys[1],
          value: get(data, path1)
        }
      }
    } else if (path2[0] in data) {
      return {
        type: 'equal',
        key: test.keys[0],
        value: get(data, path2)
      }
    } else {
      return test
    }
  },
  null: runIfKey('null'),
  true: runIfKey('true'),
  false: runIfKey('false'),
  gt: runIfKey('gt'),
  lt: runIfKey('lt')
}

const contextualize = (self, types, data) => {
  return self.tests.map(test => {
    return types[test.type](self, test, types, data)
  })
}

const createContextualize = types => {
  return function(data) {
    return this._create(contextualize(this, types, data), this._boundKeys)
  }
}

module.exports = createContextualize(builtinTypes)

module.exports.extend = extension => {
  const runners = assign({}, builtinTypes, extension)
  return createContextualize(runners)
}
