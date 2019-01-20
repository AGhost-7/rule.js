'use strict'

const ruleElasticsearch = require('../index')()
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
})
