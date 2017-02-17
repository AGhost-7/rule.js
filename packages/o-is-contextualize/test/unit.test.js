'use strict'

const assert = require('assert')
const oIsContextualize = require('../index')
const oIs = require('o-is').extend({}, {
	contextualize: oIsContextualize
})

describe('o-is-contextualize', () => {

	it('equal', () => {
		const res = oIs()
			.equal('user.name', 'foobar')
			.contextualize('user', {
				name: 'foobar'
			})
			.test({})
		assert(res)
	})

	it.skip('propEqual', () => {
		const o = oIs()
			.propEqual('user.name', 'email.to')
			.contextualize('user', {
				name: 'foobar'
			})

		const f = o.test({
			email: {
				to: 'nerp'
			}
		})
		assert(!f)

		const t = o.test({
			email: {
				to: 'foobar'
			}
		})
		assert(t)
	})
})
