'use strict'

const esUtil = require('./es-util')

const oIsElasticsearch = require('../index')
const oIs = require('o-is').extend({}, {
	elasticsearch: oIsElasticsearch
})

const commonSuite = require('o-is-common-suite')(oIs)


describe('o-is-elastiscearch#common', () => {
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
							virtuoso: {
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
			data: commonSuite.data
		})
	})

	commonSuite.tests.forEach((test) => {
		const title = test[0]
		const o = test[1]
		const testBlock = test[2]
		it(title, () => {
			return esUtil.search(o.elasticsearch())
				.then((res) => {
					const normalizedRes = res.hits.hits.map((hit) => hit._source)
					testBlock(normalizedRes)
				})
		})
	})
})

