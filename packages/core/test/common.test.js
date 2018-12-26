'use strict'

const Rule = require('../index')
const commonSuite = require('@rule.js/common-suite')(Rule)

describe('@rule.js/core#common', () => {
  commonSuite.tests.forEach(test => {
    const title = test[0]
    const o = test[1]
    const testFn = test[2]
    it(title, () => {
      const res = commonSuite.data.filter(item => o.test(item))
      testFn(res)
    })
  })
})
