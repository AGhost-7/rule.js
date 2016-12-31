const assert = require('assert')

exports.data = [
]

exports.tests = [
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

