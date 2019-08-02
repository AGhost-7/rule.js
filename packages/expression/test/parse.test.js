'use strict'

const ruleExpression = require('../')()
const assert = require('assert')

const assertExpression = function(condition, expected) {
  const tests = ruleExpression(condition).tests
  assert.deepEqual(tests, expected)
}

const expressionThrows = function(condition) {
  assert.throws(function() {
    ruleExpression(condition)
  })
}

describe('@rule.js/expression#parse', function() {
  describe('test', function() {
    it('nothing', function() {
      assertExpression('', [])
    })

    it('lt', function() {
      assertExpression('"age" less than 10', [
        {
          type: 'lt',
          key: 'age',
          value: 10
        }
      ])
    })

    it('gt', function() {
      assertExpression('"currency" greater than 0.11', [
        {
          type: 'gt',
          key: 'currency',
          value: 0.11
        }
      ])
    })

    it('deep equal', function() {
      assertExpression('"person"."name" equal "foobar"', [
        {
          type: 'equal',
          key: ['person', 'name'],
          value: 'foobar'
        }
      ])
    })
    it('equal', function() {
      assertExpression('"foo" equal "lel"', [
        {
          type: 'equal',
          key: 'foo',
          value: 'lel'
        }
      ])
    })

    it('any', function() {
      assertExpression('"foo" any ("one", true)', [
        {
          type: 'any',
          key: 'foo',
          values: ['one', true]
        }
      ])
      assertExpression('"foo" any("two")', [
        {
          type: 'any',
          key: 'foo',
          values: ['two']
        }
      ])
      assertExpression('"foo" any ("three","four")', [
        {
          type: 'any',
          key: 'foo',
          values: ['three', 'four']
        }
      ])
    })

    it('contains', function() {
      assertExpression('"foo" contains "bar"', [
        {
          type: 'contains',
          key: 'foo',
          value: 'bar'
        }
      ])
    })

    it('not contains', function() {
      assertExpression('"foo" not contains "bar"', [
        {
          type: 'not',
          args: {
            type: 'contains',
            key: 'foo',
            value: 'bar'
          }
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
    it('equal', function() {
      assertExpression('"foo" equal true and "foo" equal "baz"', [
        {
          type: 'and',
          tests: [
            {
              type: 'equal',
              key: 'foo',
              value: true
            },
            {
              type: 'equal',
              key: 'foo',
              value: 'baz'
            }
          ]
        }
      ])
    })

    it('not equal', function() {
      assertExpression(
        '"foo" equal true or "bar" equal "baz" and "foob" not equal "bar"',
        [
          {
            type: 'or',
            tests: [
              {
                type: 'equal',
                key: 'foo',
                value: true
              },
              {
                type: 'and',
                tests: [
                  {
                    type: 'equal',
                    key: 'bar',
                    value: 'baz'
                  },
                  {
                    type: 'not',
                    args: {
                      type: 'equal',
                      key: 'foob',
                      value: 'bar'
                    }
                  }
                ]
              }
            ]
          }
        ]
      )
    })

    it('empty', function() {
      assertExpression('"foo" is empty and "baz" equal "floob"  ', [
        {
          type: 'and',
          tests: [
            {
              type: 'null',
              key: 'foo'
            },
            {
              type: 'equal',
              key: 'baz',
              value: 'floob'
            }
          ]
        }
      ])
    })
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

  describe('()', function() {
    it('left', function() {
      assertExpression(
        '("baz" equal "foob" or "baz" equal "bar") and "foo" equal "bar"',
        [
          {
            type: 'and',
            tests: [
              {
                type: 'or',
                tests: [
                  {
                    type: 'equal',
                    key: 'baz',
                    value: 'foob'
                  },
                  {
                    type: 'equal',
                    key: 'baz',
                    value: 'bar'
                  }
                ]
              },
              {
                type: 'equal',
                key: 'foo',
                value: 'bar'
              }
            ]
          }
        ]
      )
    })

    it('right', function() {
      assertExpression(
        '"bar" equal "foob" and ("blob" is not empty or "foo" equal "bar" )',
        [
          {
            type: 'and',
            tests: [
              {
                type: 'equal',
                key: 'bar',
                value: 'foob'
              },
              {
                type: 'or',
                tests: [
                  {
                    type: 'not',
                    args: {
                      type: 'null',
                      key: 'blob'
                    }
                  },
                  {
                    type: 'equal',
                    key: 'foo',
                    value: 'bar'
                  }
                ]
              }
            ]
          }
        ]
      )
    })

    it('both', function() {
      assertExpression('("foo" is empty) and ("bar" is empty)', [
        {
          type: 'and',
          tests: [
            {
              type: 'null',
              key: 'foo'
            },
            {
              type: 'null',
              key: 'bar'
            }
          ]
        }
      ])
    })

    it('nested', function() {
      assertExpression(
        '("foo" is empty and "bar" equal "baz" or (' +
          '"baz" equal "foob" and "foo" equal "bar")) or "bleh" equal "ok"',
        [
          {
            type: 'or',
            tests: [
              {
                type: 'and',
                tests: [
                  {
                    type: 'null',
                    key: 'foo'
                  },
                  {
                    type: 'or',
                    tests: [
                      {
                        type: 'equal',
                        key: 'bar',
                        value: 'baz'
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
                            key: 'foo',
                            value: 'bar'
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                type: 'equal',
                key: 'bleh',
                value: 'ok'
              }
            ]
          }
        ]
      )
    })

    it.skip('multiple', function() {
      assertExpression(
        '("foo" is empty) and ("bar" is empty) or "baz" is empty' +
          ' or ("foob" is empty)',
        [
          {
            type: 'and',
            tests: [
              {
                type: 'null',
                key: 'foo'
              },
              {
                type: 'or',
                tests: [
                  {
                    type: 'null',
                    key: 'bar'
                  },
                  {
                    type: 'or',
                    tests: [
                      {
                        type: 'null',
                        key: 'baz'
                      },
                      {
                        type: 'null',
                        key: 'foob'
                      }
                    ]
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
