const Rule = require('@rule.js/core')
const RuleExpression = require('../')
const assertModule = require('assert')

const assert = function(expression, obj) {
  RuleExpression()(expression).assert(obj)
}

const assertThrows = function(expression, obj) {
  assertModule.throws(function() {
    RuleExpression()(expression).assert(obj)
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

  it('deep equal', function() {
    assert('"person"."name" equal "john"', {
      person: {
        name: 'john'
      }
    })
  })

  it('toPath', function() {
    const toLower = key => key.toLowerCase()
    const rule = RuleExpression(Rule, toLower)('"Name" equal "john"')
    rule.assert({
      name: 'john'
    })
  })
})
