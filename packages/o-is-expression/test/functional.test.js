const oIsExpression = require('../')()
const assertModule = require('assert')

const assert = function(expression, obj) {
  oIsExpression(expression).assert(obj)
}

const assertThrows = function(expression, obj) {
  assertModule.throws(function() {
    oIsExpression(expression).assert(obj)
  })
}

describe('o-is-expression#functional', function() {
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
