'use strict'

const assert = require('assert')
const oIs = require('o-is')
const ABAC = require('../')


describe('strategies', () => {
	const isAdmin = oIs().true('subject.isAdmin')

	const forumPolicySet = ABAC.policySet()
		.allow()
			.target('user_ban')
			.action('delete')
			.condition(isAdmin)
		.allow()
			.target('user_ban')
			.action('create')
			.condition(isAdmin)
		.deny()
			.target('post')
			.action('update')
			.condition()
				.not().true('subject.isAdmin')
				.true('resource.locked')
			.end()
		.allow()
			.target('post')
			.action('update')
			.condition()
				.propsEqual('subject.id', 'resource.author')
			.end()
		.end()

	const forumAllow = (strategyName) => () => {
		const strategy = ABAC.strategies[strategyName]
		const allow = (context) => assert(strategy(forumPolicySet, context))

		allow({
			action: 'delete',
			target: 'user_ban',
			subject: { isAdmin: true }
		})

		allow({
			action: 'update',
			target: 'post',
			subject: { id: 1 },
			resource: { author: 1 },
			previousResource: { author: 1 }
		})

	}
	const forumDeny = (strategyName) => () => {
		const strategy = ABAC.strategies[strategyName]
		const deny = (context) => assert(!strategy(forumPolicySet, context))

		deny({
			action: 'create',
			target: 'user_ban',
			subject: { isAdmin: false }
		})

		deny({
			action: 'update',
			target: 'post',
			resource: {
				locked: true
			},
			subject: {
				isAdmin: false
			}
		})
	}
		

	describe('simple', () => {

		it('forum allow', forumAllow('simple'))

		it('forum deny', forumDeny('simple'))
	})

	describe('crud', () => {
		it('forum allow', forumAllow('crud'))

		it('forum deny', forumDeny('crud'))
	})

})
