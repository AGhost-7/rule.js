'use strict'

const oIsElasticsearch = require('../index')
const oIs = require('o-is').extend({}, {
	elasticsearch: oIsElasticsearch
})

const assert = require('assert')

describe('o-is-elasticsearch#unit', () => {

	it('converts arbitrary comparisons', () => {
		const query = oIs()
			.equal('foo', 'bar')
			.elasticsearch()
		assert.equal(query.bool.must[0].term.foo, 'bar')
	})

	it('converts lt and gt', () => {
		const query = oIs()
			.gt('age', 10)
			.lt('age', 20)
			.elasticsearch()
		const rg1 = query.bool.must[0]
		const rg2 = query.bool.must[1]
		assert(rg1.range)
		assert(rg2.range)
	})

	it('converts conditions to es queries', () => {
		const query = oIs()
			.if()
				.equal('name', 'foobar')
			.then()
				.gt('age', 20)
			.else()
				.lt('age', 10)
			.end()
			.elasticsearch()
		const trueCond = query.bool.must[0].bool.should[0]
		const falseCond = query.bool.must[0].bool.should[1]

		assert(trueCond.bool.must[0].term.name === 'foobar', 'the condition is preset')
		assert(trueCond.bool.must[1].range.age.gt === 20, 'the test when true')
		assert(falseCond.bool.must[0].range.age.lt === 10, 'the test when false')
	})

})
