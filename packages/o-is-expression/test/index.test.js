'use strict'

const oIsExpression = require('../')()
const assert = require('assert')

var assertExpression = function(condition, expected) {
  assert.deepEqual(oIsExpression(condition).tests, expected)
}

describe('o-is-expression', function() {
  describe('or', function() {
    it('equal', function() {
      assertExpression('"foo" equal true or "foo" equal "true"', [{
        type: 'or',
        tests: [
          {
            type: 'equal',
            key: 'foo',
            value: true
          },
          {
            type: 'equal',
            key: 'foo',
            value: 'true'
          }
        ]
      }])
    })
  })
})
