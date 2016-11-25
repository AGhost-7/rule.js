'use strict'

const oIs = require('../index')
const assert = require('assert')

describe('o-is', () => {
	describe('assertions', () => {
		const obj = {
			name: 'jonathan',
			age: 23145,
			fullName: {
				first: 'jonathan',
				last: 'boudreau'
			}
		}
		
		const tests = [
			{
				type: 'exist',
				key: 'name'
			},
			{
				type: 'equal',
				key: 'fullName.first',
				value: 'jonathan'
			},
			{
				type: 'propsEqual',
				keys: ['name', 'fullName.first']
			},
			{
				type: 'string',
				key: 'name'
			}
		]

		it('should pass basic assertions',  () => {
			oIs.test(oIs.assertions, obj, tests)
		})

		it('should return the type of failure', () => {
			const res = oIs.test(oIs.assertions, { a: 'BOOM' }, [{
				type: 'number',
				key: 'a'
			}])

			assert.ok(!res)
		})

		// This will be handy for client-side generation of error messages.
		it('should gimme more detailed errors', () => {
			const res = oIs.testDetailed(oIs.assertions, obj, [
				{
					type: 'equal',
					key: 'name',
					value: 'jonathan'
				},
				{
					type: 'number',
					key: 'name'
				}
			])

			assert.equal(res[0].test.key, 'name')
			assert.equal(res[0].test.type, 'number')
		})
	})

	describe('builder basics', () => {
		it('should build', () => {
			const res = oIs()
				.equal('a', 1)
				.test({ a: 1 })
			assert.ok(res)
		})
		it('should assert', () => {
			assert.throws(() => {
				oIs()
					.equal('a', 2)
					.assert({ a: 1 })
			})
		})
		it('should chain', () => {
			oIs()
				.equal('a', 1)
				.lt('a', 10)
				.gt('a', 0)
				.exist('a')
				.number('a')
				.propsEqual('a', 'foo.bar')
				.equal('arr[0]', 1)
				.assert({
					a: 1,
					foo: {
						bar: 1
					},
					arr: [1]
				})
		})
		it('equal object', () => {
			oIs()
				.equal({
					'name.first': 'Jonathan',
					age: 23
				})
				.assert({
					name: {
						first: 'Jonathan'
					},
					age: 23
				})
		})
	})

	describe('conditionals', () => {
		it('should handle simple cases', () => {
			const o = oIs()
				.if()
					.true('validate')
				.then()
					.exist('name')
				.end()
			assert(o.test({ validate: false, foo: 'bar' }), 'dont run validation')
			assert(o.test({ validate: true, name: 'jo'}), 'run validation')
			assert(!o.test({ validate: true, foo: 'bar'}),
				'run validation (failing)')
		})

		it('else statements', () => {
			const o = oIs()
				.if()
					.gt('income', 100)
				.then()
					.gt('contributions', 10)
				.else()
					.gt('contributions', 5)
				.end()
			assert(o.test({ income: 101, contributions: 20 }))
			assert(o.test({ income: 50, contributions: 6 }))
			assert(!o.test({ income: 101, contributions: 5 }))
			assert(!o.test({ income: 50, contributions: 3 }))
		})
		it('should handle compound conditions', () => {
			const o = oIs()
				.if()
					.gt('a', 10).lt('a', 20)
				.then()
					.equal('a', 15)
				.end()
				.exist('a')
			assert(o.test({ a: 15 }))
			assert(!o.test({ a: 16 }))
			assert(o.test({ a: 10 }))
		})
		it('should handle nested conditions', () => {
			// idk...
			const o = oIs()
				.if()
					.true('validate')
					.if()
						.gt('age', 60)
					.then()
						.true('senior')
					.end()
					.if()
						.lt('age', '16')
					.then()
						.true('junior')
					.end()
				.then()
					.lt('money', 20)
				.end()
			assert(o.test({ age: 70, senior: true, money: 15 }))
		})

	})

	describe('binding', () => {
		it('binds for simple cases', () => {
			const res = oIs()
				.bind('name')
				.equal('first', 'Jonathan')
				.equal('last', 'Boudreau')
				.test({
					name: {
						first: 'Jonathan',
						last: 'Boudreau'
					}
				})
			assert(res)
		})
		it('unbinds', () => {
			const res = oIs()
				.bind('name')
				.equal('first', 'Jonathan')
				.unbind()
				.equal('name.last', 'Boudreau')
				.test({
					name: {
						first: 'Jonathan',
						last: 'Boudreau'
					}
				})
			assert(res)
		})
		it('binds inside conditions', () => {
			const o = oIs()
				.if()
					.equal('type', 'human')
				.then()
					.bind('name')
					.equal({
						first: 'Jonathan',
						last: 'Boudreau'
					})
				.end()
			assert(o.test({ type: 'bear' }))
			assert(o.test({
				type: 'human',
				name: {
					first: 'Jonathan',
					last: 'Boudreau'
				}
			}))
			assert(!o.test({ type: 'human' }))
		})
		it('binds multiple times', () => {
			const obj = {
				a: { b: { c: 1 } }
			}
			oIs()
				.bind('a')
				.unbind()
				.bind('a')
				.bind('b')
				.equal('c', 1)
				.assert(obj)
		})
	})
	describe('not', () => {
		it('inverts equals', () => {
			oIs().not().equal('a', 1).assert({ a: 2 })
		})
		it('inverts only the first statement', () => {
			oIs()
				.not().equal('a', 1)
				.equal('b', 2)
				.assert({
					a: 2,
					b: 2
				})
		})
		it('inverts in ifs', () => {
			oIs()
				.if()
					.not().equal('a', 1)
				.then()
					.equal('b', 1)
				.else()
					.equal('b', 2)
				.end()
				.assert({
					a: 2, b: 1
				})
		})
	})

	describe('or', () => {
		it('eithers...', () => {
			const o = oIs().or().equal('a', 1).equal('a', 2).end()
			o.assert({ a: 1 })
			o.assert({ a: 2 })
			assert(!o.test({ a: 3 }))
		})
		it('allows multiple strict conditions', () => {
			const o = oIs()
				.equal('a', 1)
				.or()
					.equal('b', 1)
					.equal('b', 2)
				.end()
			o.assert({ a: 1, b: 1 })
			o.assert({ a: 1, b: 2 })
			assert(!o.test({ a: 2, b: 1 }))
		})
		it('functions inside if blocks', () => {
			const o = oIs()
				.if()
					.or().equal({ a: 1, b: 2 }).end()
				.then()
					.equal('c', 3)
				.else()
					.equal('c', 4)
				.end()
			o.assert({ b: 2, c: 3 })
			o.assert({ a: 1, c: 3 })
			o.assert({ c: 4 })
		})
		it('functions inside then block', () => {
			const o = oIs()
				.if().equal('a', 1).then()
					.or()
						.equal('b', 2)
						.equal('b', 3)
					.end()
				.end()
			o.assert({ a: 1, b: 2 })
			o.assert({ a: 2, b: 3 })
		})
		it('functions inside else block', () => {
			const o = oIs()
				.if().equal('a', 1).then()
					.equal('b', 2)
				.else()
					.or()
						.equal('b', 3)
						.equal('b', 4)
					.end()
				.end()
			o.assert({ b: 3 })
			o.assert({ b: 4 })
		})
		it('binds', () => {
			const o = oIs()
				.or()
					.bind('name')
					.equal('first', 'jonathan')
					.equal('first', 'Jonathan')
				.end()
			o.assert({ name: { first: 'jonathan' } })
			o.assert({ name: { first: 'Jonathan' } })
		})
		it('should allow mixtures of ors and ands', () => {
			const o = oIs()
				.or()
					.equal('a', 1)
					.and()
						.equal('a', 2)
						.equal('b', 3)
					.end()
				.end()
			assert(o.test({ a: 1 }))
			assert(o.test({ a: 2, b: 3 }))
			assert(!o.test({ a: 2 }))
			assert(!o.test({ b: 3 }))
		})
	})

	describe('extensions', () => {
		it('should allow extensions', () => {
			var oIs2 = oIs.extend({}, {})
			oIs2()
				.equal('a', 1)
				.assert({a:1})
		})
		it('should allow adding new methods', () => {
			var oIs2 = oIs.extend({}, {
				foo() {
					return 'bar'
				}
			})
			assert.equal(oIs2().equal('foo', 'baz').foo(), 'bar')
		})
	})

})

