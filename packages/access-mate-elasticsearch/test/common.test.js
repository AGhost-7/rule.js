const assert = require('assert').strict
const AccessMate = require('@rule.js/access-mate')
const esUtil = require('@rule.js/es-util')
const commonSuite = require('@rule.js/access-mate-common-suite')
const toElasticsearch = require('..')

const mappings = {
  todo: {
    id: {
      type: 'keyword'
    },
    owner: {
      type: 'keyword'
    },
    private: {
      type: 'boolean'
    }
  }
}

const assertGives = async (testGroup, policies, assertion) => {
  const filter = toElasticsearch(policies, {
    environment: {},
    target: assertion.target,
    action: 'read',
    subject: assertion.subject
  })

  const result = await esUtil.search(filter)
  const body = result.hits.hits.map(item => item._source.id)

  assert.deepEqual(body, assertion.gives)
}

describe('access-mate-elasticsearch#common', () => {
  for (const testGroup of commonSuite) {
    it('test group: ' + testGroup.name, async () => {
      await esUtil.prepareType({
        mapping: {
          index: 'test',
          type: testGroup.name,
          body: {
            [testGroup.name]: {
              properties: mappings[testGroup.name]
            }
          }
        },
        data: testGroup.data
      })
      const policies = testGroup.policies(AccessMate)
      for (const assertion of testGroup.assertions) {
        await assertGives(testGroup, policies, assertion)
      }
    })
  }
})
