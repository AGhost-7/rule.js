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
				description: '',
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
				instrument: 'Guitar',
				description: 'Joe Pass was an American virtuoso jazz guitarist of Sicilian descent.'
			},
			{
				firstName: 'Nils',
				lastName: 'Frahm',
				age: 34,
				deceased: false,
				virtuoso: false,
				occupation: 'Musician',
				country: 'Germany',
				description: 'Nils Frahm (born 20 September 1982) is a German musician, composer and record producer based in Berlin.',
				instrument: 'Piano'
			},
			{
				firstName: 'Bill',
				lastName: 'Evans',
				age: 51,
				deceased: true,
				virtuoso: false,
				occupation: 'Musician',
				description: null,
				country: 'US',
				instrument: 'Piano'
			}
		],

		tests: [
			[
				'equal',
				oIs()
					.equal('firstName', 'Joe'),
				(res) => {
					assert.equal(res.length, 1)
				}
			],
			[
				'or',
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
				'not',
				oIs()
					.not().equal('firstName', 'Joe'),
				(res) => {
					assert(!containsProp(res, 'firstName', 'Joe'))
				}
			],
			[
				'propsEqual',
				oIs()
					.propsEqual('deceased', 'virtuoso'),
				(res) => {
					assert.equal(res.length, 3)
					assert(!containsProp(res, 'firstName', 'Bill'))
				}
			],
			[
				'notEqual',
				oIs()
					.notEqual('deceased', false),
				(res) => {
					assert.equal(res.length, 2)
					assert(containsNames(res, ['Bill', 'Joe']))
				}
			],
			[
				'false',
				oIs().false('deceased'),
				(res) => {
					assert.equal(res.length, 2)
					assert(containsNames(res, ['Nils', 'Jonathan']))
				}
			],
			[
				'true',
				oIs().true('virtuoso'),
				(res) => {
					assert.equal(res.length, 1)
					assert(containsName(res, 'Joe'))
				}
			],
			[
				'gt',
				oIs().gt('age', 24),
				(res) => {
					assert.equal(res.length, 3)
				}
			],
			[
				'multiple conditions',
				oIs()
					.gt('age', 24)
					.lt('age', 50),
				(res) => {
					assert(containsName(res, 'Nils'))
					assert.equal(res.length, 1)
				}
			],
			[
				'if',
				oIs()
					.if()
						.lt('age', 40)
					.then()
						.equal('occupation', 'Musician')
					.end(),
				(res) => {
					assert(!containsName(res, ['Jonathan']))
				}
			],
			[
				'if else',
				oIs()
					.if()
						.equal('firstName', 'Joe')
					.then()
						.equal('age', 65)
					.else()
						.equal('deceased', false)
					.end(),
				(res) => {
					assert.equal(res.length, 3)
				}
			],
			[
				'if not',
				oIs()
					.if()
						.not().true('virtuoso')
					.then()
						.not().equal('occupation', 'Musician')
					.end(),
				(res) => {
					assert.equal(res.length, 2)
					assert(!containsName(res, ['Nils']))
				}
			],
			[
				'null',
				oIs().null('description'),
				(res) => {
					assert.equal(res.length, 1)
				}
			]
		]
	}
}
