const oIs = require('../index')
const commonSuite = require('o-is-common-suite')(oIs)

describe('o-is#common', () => {
	commonSuite.tests.forEach((test) => {
		const title = test[0]
		const o = test[1]
		const testFn = test[2]
		it(title, () => {
			const res = commonSuite.data.filter((item) => o.test(item))
			testFn(res)
		})
	})
})
