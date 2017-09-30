'use strict'

const assert = require('assert')
const oIs = require('o-is')
const constraint = require('../index')(oIs)

describe('o-is-constraint', () => {

	it('mandatory', () => {
		assert.throws(() => {
			constraint.mandatory(['name']).assert({ boom: true })
		})
		constraint.mandatory(['name']).assert({ name: 'foobar' })
	})

	it('when', () => {
		constraint
			.when()
				.false('admin')
			.mandatory('name')
			.assert({ admin: true })
	})

	it('errors', () => {
		const errors = constraint.mandatory(['foobar']).errors({ foobar: null })
		assert.equal(errors.length, 1)
	})

	it('pattern', () => {
		const errors = constraint
			.pattern(/^[a-z]$/gi, ['a', 'b'])
			.errors({ a: '1', b: 'a' })
		assert.equal(errors.length, 1)
		assert.equal(errors[0].value, '1')
	})

	it('minLength and maxLength', () => {

		constraint
			.when()
				.equal('role', 'admin')
				.equal('subRole', 'super')
			.minLength(1, ['hobbies'])
			.assert({ role: 'admin', subRole: 'super', hobbies: ['guitar'] })

		const constraints = constraint
			.minLength(1, ['locations'])
			.when()
				.false('largeCorp')
			.maxLength(4, ['locations'])

		let errors = constraints.errors({
			locations: []
		})
		assert.equal(errors.length, 1)

		errors = constraints.errors({
			locations: ['a', 'b', 'c', 'd', 'e'],
			largeCorp: false
		})
		assert.equal(errors.length, 1)
	})

	it('const', () => {
		const constraints = constraint
			.when()
				.not().null('datePublished')
			.const('published', ['status'])

		constraints.assert({
			datePublished: new Date(),
			status: 'published'
		})

		constraints.assert({
			datePublished: null,
			status: 'published'
		})
	})

})
