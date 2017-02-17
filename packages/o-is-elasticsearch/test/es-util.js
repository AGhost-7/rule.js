'use strict'

const oIsElasticsearch = require('../index')
const oIs = require('o-is').extend({}, {
	elasticsearch: oIsElasticsearch
})

const elasticsearch = require('elasticsearch')
const es = new elasticsearch.Client({
	host: process.env.O_IS_ES_HOST || 'localhost:9200'
})

const promiseResolver = (resolve, reject) => (err, res) => {
	if(err) reject(err)
	else resolve(res)
}

exports.search = (filter) => {
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
		}, promiseResolver(resolve, reject))
	})
}

const timeout = (time) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, time)
	})
}

const indicesWrap = (name) => (options) => {
	return new Promise((resolve, reject) => {
		es.indices[name](options, promiseResolver(resolve, reject))
	})
}

const indexExists = indicesWrap('exists')

const indexDelete = indicesWrap('delete')

const indexCreate = indicesWrap('create')

const indexPutMapping = indicesWrap('putMapping')

const esBulk = (options) => {
	return new Promise((resolve, reject) => {
		es.bulk(options, promiseResolver(resolve, reject))
	})
}

exports.prepareType = (options) => {
	return indexExists({ index: 'test' })
		.then((exists) => {
			if(exists) {
				return indexDelete({ index: 'test' })
			}
		})
		.then(() => indexCreate({ index: 'test' }))
		.then(() => {
			if(options.mapping) {
				return indexPutMapping(options.mapping)
			}
		})
		.then(() => {
			const index = 'test'
			const type = options.mapping.type
			const data = options.data.reduce((accu, item) => {
				return accu.concat({
					index: {
						_index: index,
						_type: type
					}
				}, item)
			}, [])
			return esBulk({
				body: data
			})
		})
		.then(() => timeout(1000))
}
