'use strict'

const assert = require('assert')
const oIs = require('o-is')
const constraint = require('../index')(oIs)

describe('o-is-constraint', () => {

	it('mandatory', () => {
		assert.throws(() => {
			constraint.mandatory('name').assert({ boom: true })
		})
		constraint.mandatory('name').assert({ name: 'foobar' })
	})

	it('when', () => {
		constraint
			.when()
				.false('admin')
			.mandatory('name')
			.assert({ admin: true })
	})

	it('length', () => {
		constraint
			.when()
				.equal('role', 'admin')
				.equal('subRole', 'super')
			.minLength('hobbies')
			.assert({ role: 'admin', subRole: 'super', hobbies: ['guitar'] })
	})

})

