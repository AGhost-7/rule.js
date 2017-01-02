
const assert = require('power-assert')
const esUtil = require('./es-util')

const oIsElasticsearch = require('../index')
const oIs = require('o-is').extend({}, {
	elasticsearch: oIsElasticsearch
})

const search = esUtil.search


describe('o-is-elasticsearch#functional', () => {

	before(function() {
		this.timeout(10000)
		return esUtil.prepareType({
				mapping: {
					index: 'test',
					type: 'people',
					body: {
						people: {
							properties: {
								firstName: {
									type: 'string',
									index: 'not_analyzed'
								},
								lastName: {
									type: 'string',
									index: 'not_analyzed'
								},
								age: {
									type: 'integer'
								},
								deceased: {
									type: 'boolean'
								},
								occupation: {
									type: 'string'
								},
								country: {
									type: 'string'
								},
								instrument: {
									type: 'string'
								}
							}
						}
					}
				},
				data: require('./fixtures/es-data')
			})
	})

	it('allows strict equality', () => {
		const query = oIs()
			.equal('lastName', 'Boudreau')
			.elasticsearch()

		return search(query)
			.then((res) => {
				assert.equal(res.hits.hits.length, 1)
			})
	})

	it('allows multiple conditions', () => {
		const query = oIs()
			.equal('firstName', 'Joe')
			.equal('lastName', 'Pass')
			.elasticsearch()
		return search(query)
			.then((res) => {
				assert.equal(res.hits.hits.length, 1)
			})
	})

	it('does greater than comparisons', () => {
		const query = oIs()
			.gt('age', 24)
			.lt('age', 50)
			.elasticsearch()
		return search(query)
			.then((res) => {
				assert.equal(res.hits.hits.length, 1)
				assert.equal(res.hits.hits[0]._source.country, 'Germany')
			})
	})

	describe('if conditions', () => {
		it('handles simple conditions', () => {
			const query = oIs()
				.if().gt('age', 60).then()
					.equal('firstName', 'Joe')
				.end()
				.elasticsearch()
			return search(query)
				.then((res) => {
					assert.equal(res.hits.hits.length, 1)
				})
		})

		it('does if else conditions', () => {
			const query = oIs()
				.if().equal('deceased', true).then()
					.equal('firstName', 'Bill')
				.else()
					.equal('lastName', 'Frahm')
				.end()
				.elasticsearch()

			return search(query)
				.then((res) => {
					assert.equal(res.hits.hits.length, 2)
					assert(res.hits.hits.some((el) => el._source.firstName === 'Nils'))
					assert(res.hits.hits.some((el) => el._source.lastName === 'Evans'))
				})
		})
	})

})
