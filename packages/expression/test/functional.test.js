const ruleExpression = require('../')()
const assertModule = require('assert')

const assert = function(expression, obj) {
  ruleExpression(expression).assert(obj)
}

const assertThrows = function(expression, obj) {
  assertModule.throws(function() {
    ruleExpression(expression).assert(obj)
  })
}

describe('@rule.js/expression#functional', function() {
  it('equal', function() {
    assert('"name" equal "john" and "last name" equal "doe"', {
      name: 'john',
      'last name': 'doe'
    })
    assertThrows('"name" is not equal "foobar"', {
      name: 'foobar'
    })
  })
})
