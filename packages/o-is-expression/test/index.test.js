'use strict'

const oIsExpression = require('../')()
const assert = require('assert')

const assertExpression = function(condition, expected) {
  assert.deepEqual(oIsExpression(condition).tests, expected)
}

const expressionThrows = function(condition) {
  assert.throws(function() {
    oIsExpression(condition)
  })
}

describe('o-is-expression', function() {
  describe('test', function() {
    it('equal', function() {
      assertExpression('"foo" equal "lel"', [
        {
          type: 'equal',
          key: 'foo',
          value: 'lel'
        }
      ])
    })

    it('equal fail', function() {
      expressionThrows('"f"')
      expressionThrows('"')
      expressionThrows('"foob" equal \'heh\'')
    })

    it('not equal', function() {
      assertExpression('"foob" not equal true', [
        {
          type: 'not',
          args: {
            type: 'equal',
            key: 'foob',
            value: true
          }
        }
      ])
    })

    it('empty', function() {
      assertExpression('"foo"  is   empty', [
        {
          type: 'null',
          key: 'foo'
        }
      ])
    })

    it('not empty', function() {
      assertExpression('"bleh" is not empty   ', [
        {
          type: 'not',
          args: {
            type: 'null',
            key: 'bleh'
          }
        }
      ])
    })
  })

  describe('and', function() {
    it.skip('equal', function() {})

    it.skip('not equal', function() {})

    it.skip('empty', function() {})
  })

  describe('or', function() {
    it('equal', function() {
      assertExpression('"foo" equal true or "foo" equal "true"', [
        {
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
        }
      ])
    })

    it('not equal', function() {
      assertExpression('"foo" not equal "bar" or "baz" equal "foob"', [
        {
          type: 'or',
          tests: [
            {
              type: 'not',
              args: {
                type: 'equal',
                key: 'foo',
                value: 'bar'
              }
            },
            {
              type: 'equal',
              key: 'baz',
              value: 'foob'
            }
          ]
        }
      ])
    })

    it('empty', function() {
      assertExpression('"foo" is empty or "baz" equal "foob"', [
        {
          type: 'or',
          tests: [
            {
              type: 'null',
              key: 'foo'
            },
            {
              type: 'equal',
              key: 'baz',
              value: 'foob'
            }
          ]
        }
      ])
    })

    it('and', function() {
      assertExpression(
        '"foo" is empty or "baz" equal "foob" and "bar" equal true',
        [
          {
            type: 'or',
            tests: [
              {
                type: 'null',
                key: 'foo'
              },
              {
                type: 'and',
                tests: [
                  {
                    type: 'equal',
                    key: 'baz',
                    value: 'foob'
                  },
                  {
                    type: 'equal',
                    key: 'bar',
                    value: true
                  }
                ]
              }
            ]
          }
        ]
      )
    })
  })
})
