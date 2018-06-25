'use strict'

const assert = require('power-assert')
const esUtil = require('./es-util')

const oIsElasticsearch = require('../index')
const oIsContextualize = require('o-is-contextualize')
const oIs = require('o-is').extend(
  {},
  {
    elasticsearch: oIsElasticsearch,
    contextualize: oIsContextualize
  }
)

const search = esUtil.search

describe('o-is-elasticsearch#functional', () => {
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
    const query = oIs()
      .equal('lastName', 'Boudreau')
      .elasticsearch()

    return search(query).then(res => {
      assert.equal(res.hits.hits.length, 1)
    })
  })

  it('allows multiple conditions', () => {
    const query = oIs()
      .equal('firstName', 'Joe')
      .equal('lastName', 'Pass')
      .elasticsearch()
    return search(query).then(res => {
      assert.equal(res.hits.hits.length, 1)
    })
  })

  it('does greater than comparisons', () => {
    const query = oIs()
      .gt('age', 24)
      .lt('age', 50)
      .elasticsearch()
    return search(query).then(res => {
      assert.equal(res.hits.hits.length, 1)
      assert.equal(res.hits.hits[0]._source.country, 'Germany')
    })
  })

  it('matches all', () => {
    const query = oIs()
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
    const query = oIs()
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

  describe('if conditions', () => {
    it('handles simple conditions', () => {
      const query = oIs()
        .if()
        .equal('firstName', 'Joe')
        .then()
        .gt('age', 64)
        .end()
        .elasticsearch()
      return search(query).then(res => {
        assert.equal(res.hits.hits.length, 4)
      })
    })

    it('does if else conditions', () => {
      const query = oIs()
        .if()
        .equal('deceased', true)
        .then()
        .equal('firstName', 'Bill')
        .else()
        .equal('lastName', 'Frahm')
        .end()
        .elasticsearch()

      return search(query).then(res => {
        assert.equal(res.hits.hits.length, 2)
        assert(res.hits.hits.some(el => el._source.firstName === 'Nils'))
        assert(res.hits.hits.some(el => el._source.lastName === 'Evans'))
      })
    })
  })
})
