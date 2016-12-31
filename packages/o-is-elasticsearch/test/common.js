const assert = require('assert')

const data = [
]

const tests = [
	[
		oIs()
			.equal('name', 'Joe'),
		(res) => {
			assert.equal(res.length, 1)
		}
	],
	[
		oIs()
			.equal('name', 'Nils'),
		(res) => {
			assert.equal(res.length, 1)
		}
	],
	[
		oIs()
			.or()
				.equal('name', 'Nils')
				.equal('name', 'Joe'),
		(res) => {
			assert.equal(res.length, 2)
		}
	]
]

const createCommonSuite = (it) => {
	it(
}

describe('o-is-elasticsearch#common', () => {
	before(() => {
	})

	execCommonSuite({
	})
})
