'use strict'

const assert = require('assert')
const oIsContextualize = require('../index')
const oIs = require('o-is').extend({}, {
	contextualize: oIsContextualize
})

describe('o-is-contextualize', () => {

	describe('equal', () => {
		const isFoo = oIs().equal('user.name', 'foo')
		it('pass', () => {
			const result = isFoo
				.contextualize({
					user: { name: 'foo' }
				})
				.test({})
			assert(result)
		})

		it('fail', () => {
			const result = isFoo
				.contextualize({
					user: { name: 'bar' }
				})
				.test({})
			assert(!result)
		})

		it('undefined', () => {
			const result = isFoo.contextualize({}).test({ user: { name: 'foo' } })
			assert(result)
		})
	})

	describe('propsEqual', () => {

		const sameName = oIs().propsEqual('subject.name', 'resource.name')
		const foo = { name: 'foo' }
		const bar = { name: 'bar' }

		it('pass', () => {
			sameName
				.contextualize({ subject: foo, resource: foo })
				.assert({})
		})

		it('fail', () => {
			const result = sameName
				.contextualize({ subject: foo, resource: bar })
				.test({})
			assert(!result)
		})

		it('left defined', () => {
			sameName
				.contextualize({ subject: foo })
				.assert({ resource: foo })
			const result = sameName
				.contextualize({ subject: foo })
				.test({})

			assert(!result)
		})

		it('right defined', () => {
			sameName
				.contextualize({ resource: foo })
				.assert({ subject: foo })
			const result = sameName
				.contextualize({ resource: foo })
				.test({ subject: bar })
			assert(!result)
		})

		it('both undefined', () => {
			sameName.contextualize({}).assert({ subject: foo, resource: foo })
		})

	})

	describe('or', () => {
		const isFunny = oIs()
			.or()
				.equal('person.funny', true)
				.equal('person.veryFunny', true)
			.end()
		const person = (person) => ({ person })

		it('pass', () => {
			isFunny.contextualize(person({ funny: true })).assert({})
			isFunny.contextualize(person({ veryFunny: true})).assert({})
		})

		it('fail', () => {
			const result = isFunny.contextualize(person({ funny: false})).test({})
			assert(!result)
		})

		it('undefined', () => {
			isFunny.contextualize({}).assert(person({ funny: true }))
			const result = isFunny.contextualize({}).test(person({ funny: false }))
			assert(!result)
		})
	})

	describe.skip('and', () => {
	})

	describe('not', () => {
		const isSenior = oIs().not().equal('person.senior', false)
		const senior = (is) => ({ person: { senior: is } })

		it('pass', () => {
			isSenior
				.contextualize(senior(true))
				.assert({})
		})

		it('fail', () => {
			const result = isSenior
				.contextualize(senior(false))
				.test({})
			assert(!result)
		})

		it('undefined', () => {
			const result = isSenior
				.contextualize({})
				.test(senior(false))
			assert(!result)
			const result2 = isSenior
				.contextualize({})
				.test(senior(true))
			assert(result2)
		})
	})

})
