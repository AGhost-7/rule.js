
const assert = require('power-assert')
const oIsElasticsearch = require('../index')
const oIs = require('o-is').extend({}, {
	elasticsearch: oIsElasticsearch
})

const elasticsearch = require('elasticsearch')
const es = new elasticsearch.Client({
	host: process.env.O_IS_ES_HOST || 'localhost:9200'
})

const data = require('./fixtures/es-data')
	.reduce((accu, item) => {
		return accu.concat({
			index: {
				_index: 'test',
				_type: 'people'
			}
		}, item)
	}, [])

const search = (filter) => {
	return new Promise((resolve, reject) => {
		const body = {
			query: {
				filtered: {
					query: {
						match_all: {}
					},
					filter
				}
			}
		}
		es.search({
			index: 'test',
			body
		}, (err, res) => {
			err ? reject(err) : resolve(res)
		})
	})
}

const generateIndex = (done) => {
	es.indices.create({
		index: 'test'
	}, (err) => {
		if(err) return done(err)

		es.indices.putMapping({
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
		}, done)
	})
}

const prepareIndex = (done) => {
	es.indices.exists({ index: 'test' }, (err, exists) => {
		if(err) return done(err)
		if(exists) {
			es.indices.delete({ index: 'test' }, (err) => {
				if(err) return done(err)
				generateIndex(done)
			})
		} else {
			generateIndex(done)
		}
	})
}

describe('o-is-elasticsearch#functional', () => {

	before(function(done) {
		this.timeout(10000)
		prepareIndex((err) => {
			if(err) return done(err)
			es.bulk({
				body: data
			}, (err) => {
				if(err) return done(err)
				setTimeout(() => {
					es.search({
						index: 'test',
						body: {
							query: {
								match_all: {}
							}
						}
					}, (err, res) => {
						assert.equal(res.hits.hits.length, 4)
						done(err)
					})
				}, 1000)

			})
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
