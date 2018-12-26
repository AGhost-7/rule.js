'use strict'

const ruleElasticsearch = require('../index')
const Rule = require('@rule.js/core').extend(
  {},
  {
    elasticsearch: ruleElasticsearch
  }
)

const assert = require('assert')

describe('@rule.js/elasticsearch#unit', () => {
  it('converts arbitrary comparisons', () => {
    const query = Rule()
      .equal('foo', 'bar')
      .elasticsearch()
    assert.equal(query.bool.must[0].term.foo, 'bar')
  })

  it('converts lt and gt', () => {
    Rule()
      .gt('age', 10)
      .lt('age', 20)
      .elasticsearch()
  })

  it('converts conditions to es queries', () => {
    const query = Rule()
      .if()
      .equal('name', 'foobar')
      .then()
      .gt('age', 20)
      .else()
      .lt('age', 10)
      .end()
      .elasticsearch()
    const trueCond = query.bool.must[0].bool.should[0]
    const falseCond = query.bool.must[0].bool.should[1]

    assert(
      trueCond.bool.must[0].term.name === 'foobar',
      'the condition is preset'
    )
    assert(trueCond.bool.must[1].range.age.gt === 20, 'the test when true')
    assert(falseCond.bool.must[0].range.age.lt === 10, 'the test when false')
  })
})
