'use strict'

const assert = require('assert')
const oIs = require('o-is')
const AccessMate = require('../')


describe('strategies', () => {
	const isAdmin = oIs().true('subject.isAdmin')

	const simpleForumPolicySet = AccessMate.policySet()
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
		const strategy = AccessMate.strategies[strategyName]
		const allow = (context) => {
			const result = strategy(simpleForumPolicySet, context)
			assert(result.authorize)
		}

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
		const strategy = AccessMate.strategies[strategyName]
		const deny = (context) => {
			const result = strategy(simpleForumPolicySet, context)
			assert(!result.authorize)
		}

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
			previousResource: {
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
		
		const forumPolicySet = AccessMate.policySet()
			.deny()
				.name('only admins can modify a post on a locked thread')
				.target('post')
				.action('create', 'delete', 'update')
				.condition()
					.true('resource.thread.locked')
					.false('subject.isAdmin')
				.end()
			.deny()
				.name('only admins can lock a thread')
				.target('thread')
				.action('create', 'update-into')
				.condition()
					.true('resource.locked')
					.false('subject.isAdmin')
				.end()
			.deny()
				.name('only admins modify a locked thread')
				.target('thread')
				.action('update-from')
				.condition()
					.true('resource.locked')
					.false('subject.isAdmin')
				.end()
			.allow()
				.name('create/update own threads')
				.target('thread')
				.action('create')
				.condition()
					.propsEqual('resource.user.id', 'subject.id')
				.end()
			.allow()
				.name('admins can update any threads')
				.target('thread')
				.action('update')
				.condition()
					.true('subject.isAdmin')
				.end()
			.allow()
				.name('create and edit own posts')
				.target('post')
				.action('create', 'update')
				.condition()
					.propsEqual('resource.user.id', 'subject.id')
				.end()
			.allow()
				.name('admins can delete threads or posts')
				.target('thread', 'post')
				.action('delete')
				.condition()
					.true('subject.isAdmin')
				.end()
			.end()
		
		const allow = (options) => {
			const result = AccessMate.strategies.crud(forumPolicySet, options)
			assert(result.authorize)
		}

		const deny = (options) => {
			const result = AccessMate.strategies.crud(forumPolicySet, options)
			assert(!result.authorize)
		}

		it('allows admins to lock a thread', () => {
			allow({
				previousResource: {
					user: { id: 1 },
					locked: false
				},
				resource: {
					user: { id: 1 },
					locked: true
				},
				subject: { id: 1, isAdmin: true },
				action: 'update',
				target: 'thread'
			})
		})

		it('denies normal users from locking threads', () =>{ 
			deny({
				previousResource: {
					user: { id: 1 },
					locked: false
				},
				resource: {
					user: { id: 1 },
					locked: true
				},
				subject: {
					id: 1,
					isAdmin: false
				},
				action: 'update',
				target: 'thread'
			})
		})

		it('allows a user to create posts', () => {
			allow({
				resource: {
					user: { id: 1 },
					thread: {
						locked: false
					}
				},
				subject: {
					id: 1,
					isAdmin: false
				},
				action: 'create',
				target: 'post'
			})
		})

		it('allows a user to create threads', () => {
			allow({
				resource: {
					user: { id: 1 },
					thread: { locked: false }
				},
				subject: {
					id: 1,
					isAdmin: false
				},
				action: 'create',
				target: 'thread'
			})
		})

		it('allows an admin to edit someone else\'s post', () => {
			allow({
				previousResource: {
					content: 'bleh',
					user: { id: 1 },
					thread: { locked: false }
				},
				resource: {
					content: 'updated',
					user: { id: 1 },
					thread: { locked: false }
				},
				subject: {
					id: 2,
					isAdmin: true
				},
				action: 'update',
				target: 'thread'
			})
		})

		it('denies a regular user from editing someone else\'s post', () => {
			deny({
				previousResource: {
					content: 'greetings',
					user: { id: 1 },
					thread: { locked: false }
				},
				resource: {
					content: 'updated',
					user: { id: 1 },
					thread: { locked: false }
				},
				subject: { id: 2, isAdmin: false },
				action: 'update',
				target: 'post'
			})
		})

		it('allows an admin to delete threads', () => {
			allow({
				resource: {
					user: { id: 1 },
					locked: true
				},
				subject: { id: 2, isAdmin: true },
				action: 'delete',
				target: 'thread'
			})
		})

		it('denies regular users from delete threads', () => {
			deny({
				resource: {
					user: { id: 1 },
					locked: false
				},
				subject: { id: 1, isAdmin: false },
				action: 'delete',
				target: 'thread'
			})
		})
	})

})
