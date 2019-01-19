'use strict'

const assert = require('power-assert')
const esUtil = require('./es-util')

const ruleElasticsearch = require('../index')
const ruleContextualize = require('@rule.js/contextualize')
const Rule = require('@rule.js/core').extend(
  {},
  {
    elasticsearch: ruleElasticsearch,
    contextualize: ruleContextualize
  }
)

const search = esUtil.search

describe('@rule.js/elasticsearch#functional', () => {
  before(function() {
    this.timeout(10000)
    return esUtil.prepareType({
      mapping: {
        index: 'test',
        type: 'people',
        body: {
          people: {
            properties: {
              firstName: {
                type: 'keyword'
              },
              lastName: {
                type: 'keyword'
              },
              age: {
                type: 'integer'
              },
              deceased: {
                type: 'boolean'
              },
              occupation: {
                type: 'keyword'
              },
              country: {
                type: 'keyword'
              },
              instrument: {
                type: 'keyword'
              }
            }
          }
        }
      },
      data: require('./fixtures/es-data')
    })
  })

  it('allows strict equality', () => {
    const query = Rule()
      .equal('lastName', 'Boudreau')
      .elasticsearch()

    return search(query).then(res => {
      assert.equal(res.hits.hits.length, 1)
    })
  })

  it('allows multiple conditions', () => {
    const query = Rule()
      .equal('firstName', 'Joe')
      .equal('lastName', 'Pass')
      .elasticsearch()
    return search(query).then(res => {
      assert.equal(res.hits.hits.length, 1)
    })
  })

  it('does greater than comparisons', () => {
    const query = Rule()
      .gt('age', 24)
      .lt('age', 50)
      .elasticsearch()
    return search(query).then(res => {
      assert.equal(res.hits.hits.length, 1)
      assert.equal(res.hits.hits[0]._source.country, 'Germany')
    })
  })

  it('matches all', () => {
    const query = Rule()
      .gt('user.age', 10)
      .contextualize({
        user: {
          age: 15
        }
      })
      .elasticsearch()
    return search(query).then(res => {
      assert.equal(res.hits.hits.length, 5)
    })
  })

  it('matches none', () => {
    const query = Rule()
      .lt('user.age', 10)
      .contextualize({
        user: {
          age: 15
        }
      })
      .elasticsearch()
    return search(query).then(res => {
      assert.equal(res.hits.hits.length, 0)
    })
  })
})
