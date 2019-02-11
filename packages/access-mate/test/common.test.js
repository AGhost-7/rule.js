const assert = require('assert').strict
const AccessMate = require('../')
const commonSuite = require('@rule.js/access-mate-common-suite')

const assertGives = (testGroup, policies, assertion) => {
  const result = []
  for (const item of testGroup.data) {
    const decision = policies.authorize({
      environment: {},
      action: 'read',
      target: assertion.target,
      subject: assertion.subject,
      resource: item
    })
    if (decision.authorize) result.push(item.id)
  }

  assert.deepEqual(result, assertion.gives)
}

describe('access-mate#common', () => {
  for (const testGroup of commonSuite) {
    it('test group: ' + testGroup.name, () => {
      const policies = testGroup.policies(AccessMate)
      for (const assertion of testGroup.assertions) {
        assertGives(testGroup, policies, assertion)
      }
    })
  }
})
