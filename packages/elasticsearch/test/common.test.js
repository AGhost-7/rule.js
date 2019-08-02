'use strict'

const esUtil = require('@rule.js/elasticsearch-util')

const ruleElasticsearch = require('../index')()
const Rule = require('@rule.js/core').extend(
  {},
  {
    elasticsearch: ruleElasticsearch
  }
)

const commonSuite = require('@rule.js/test-suite')(Rule)

describe('@rule.js/elastiscearch#common', () => {
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
              virtuoso: {
                type: 'boolean'
              },
              occupation: {
                type: 'keyword'
              },
              hobbies: {
                type: 'keyword'
              },
              country: {
                type: 'keyword'
              },
              instrument: {
                type: 'keyword'
              },
              description: {
                type: 'text'
              }
            }
          }
        }
      },
      data: commonSuite.data
    })
  })

  commonSuite.tests.forEach(test => {
    const title = test[0]
    const o = test[1]
    const testBlock = test[2]
    it(title, () => {
      return esUtil.search(o.elasticsearch()).then(res => {
        const normalizedRes = res.hits.hits.map(hit => hit._source)
        testBlock(normalizedRes)
      })
    })
  })
})
