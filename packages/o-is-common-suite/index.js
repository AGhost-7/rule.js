'use strict'

const assert = require('assert')

const containsProp = (arr, prop, val) => {
	return arr.some((item) => item[prop] === val)
}

const containsName = (arr, name) => containsProp(arr, 'firstName', name)

const containsNames = (arr, names) => names.every((name) => {
		return containsName(arr, name)
})

module.exports = (oIs) => {

	return {
		data: [
			{
				firstName: 'Jonathan',
				lastName: 'Boudreau',
				age: 24,
				deceased: false,
				virtuoso: false,
				occupation: 'Software Developer',
				country: 'Canada',
				instrument: 'Guitar'
			},
			{
				firstName: 'Joe',
				lastName: 'Pass',
				age: 65,
				deceased: true,
				virtuoso: true,
				occupation: 'Musician',
				country: 'US',
				instrument: 'Guitar'
			},
			{
				firstName: 'Nils',
				lastName: 'Frahm',
				age: 34,
				deceased: false,
				virtuoso: false,
				occupation: 'Musician',
				country: 'Germany',
				instrument: 'Piano'
			},
			{
				firstName: 'Bill',
				lastName: 'Evans',
				age: 51,
				deceased: true,
				virtuoso: false,
				occupation: 'Musician',
				country: 'US',
				instrument: 'Piano'
			}
		],

		tests: [
			[
				'simple equal',
				oIs()
					.equal('firstName', 'Joe'),
				(res) => {
					assert.equal(res.length, 1)
				}
			],
			[
				'simple or',
				oIs()
					.or()
						.equal('firstName', 'Nils')
						.equal('firstName', 'Joe')
					.end(),
				(res) => {
					assert.equal(res.length, 2)
				}
			],
			[
				'simple not',
				oIs()
					.not().equal('firstName', 'Joe'),
				(res) => {
					assert(!containsProp(res, 'firstName', 'Joe'))
				}
			],
			//[
			//	'propsEqual',
			//	oIs()
			//		.propsEqual('deceased', 'virtuoso'),
			//	(res) => {
			//		assert.equal(res.length, 3)
			//		assert(!containsProp(res, 'firstName', 'Bill'))
			//	}
			//],
			[
				'simple notEqual',
				oIs()
					.notEqual('deceased', false),
				(res) => {
					assert.equal(res.length, 2)
					assert(containsNames(res, ['Bill', 'Joe']))
				}
			],
			[
				'simple false',
				oIs().false('deceased'),
				(res) => {
					assert.equal(res.length, 2)
					assert(containsNames(res, ['Nils', 'Jonathan']))
				}
			],
			[
				'simple true',
				oIs().true('virtuoso'),
				(res) => {
					assert.equal(res.length, 1)
					assert(containsName(res, 'Joe'))
				}
			]
		]
	}
}
