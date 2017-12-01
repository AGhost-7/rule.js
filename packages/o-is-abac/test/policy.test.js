'use strict'

const Policy = require('../lib/policy')
const oIsDefault = require('../lib/o-is-default')
const assert = require('assert')

const PolicySetMock = function(policies) {
	this._policies = policies
	this._oIs = oIsDefault
}

PolicySetMock.prototype.concat = function(policy) {
	return new PolicySetMock(this._policies.concat(policy))
}

describe('policy', () => {

	const mock = new PolicySetMock([])

	it('setters', () => {
		const policy = new Policy(mock)
			.effect('allow')
			.action('create')
			.target('video')
			.toJSON()
		assert.equal(policy.effect, 'allow')
		assert.equal(policy.action, 'create')
		assert.equal(policy.target, 'video')
	})

	it('condition', () => {
		const policy = new Policy(mock)
			.condition()
				.equal('foo', 'bar')
			.end()
			.toJSON()

		assert.equal(policy.condition[0].key, 'foo')
		assert.equal(policy.condition[0].value, 'bar')
		assert.equal(policy.condition[0].type, 'equal')
	})
})
