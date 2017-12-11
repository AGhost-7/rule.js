'use strict'

var assert = require('assert')
var AccessMate = require('../index')

describe('policy set', () => {

	it('basic', () => {
		const control = AccessMate.policySet()
			.deny()
				.target('todo_item')
				.action('create')
				.condition()
					.false('subject.premium_account')
					.gt('subject.total_items', 50)
				.end()
				.toJSON()
		const deny = control[0]
		assert.equal(deny.effect, 'deny')
		assert.equal(deny.action, 'create')
	})

	it('multiple', () => {
		const control = AccessMate.policySet()
			.deny()
				.target('todo_item')
				.action('create')
				.condition()
					.false('subject.premium_account')
					.gt('subject.total_items', 50)
				.end()
			.allow()
				.target('todo_item')
				.action('create', 'update', 'delete', 'read')
				.condition()
					.propsEqual('subject.id', 'resource.owner')
				.end()
			.toJSON()
		assert.equal(control[0].effect, 'deny')
		assert.equal(control[1].target, 'todo_item')
	})

	it('composes', () => {
		const policy = AccessMate.policy()
			.effect('allow')
			.target('forum_post')
			.action('update')
			.condition()
				.true('resource.creator')
			.end()
		const control = AccessMate.policySet()
			.deny()
				.target('forum_post')
				.action('create')
				.condition()
					.true('resource.locked')
				.end()
			.concat(policy)

		assert.equal(control.toJSON().length, 2)
	})

})
