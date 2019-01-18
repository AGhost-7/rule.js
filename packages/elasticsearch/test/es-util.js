'use strict'

const elasticsearch = require('elasticsearch')
const hostname = process.env.ES_HOST || 'localhost'
const es = new elasticsearch.Client({
  host: hostname + ':9200',
  httpAuth: 'elastic:changeme'
})

const promiseResolver = (resolve, reject) => (err, res) => {
  if (err) reject(err)
  else resolve(res)
}

exports.search = filter => {
  return new Promise((resolve, reject) => {
    const body = {
      query: {
        bool: {
          filter
        }
      }
    }
    es.search(
      {
        index: 'test',
        body
      },
      promiseResolver(resolve, reject)
    )
  })
}

const timeout = time => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

const indicesWrap = name => options => {
  return new Promise((resolve, reject) => {
    es.indices[name](options, promiseResolver(resolve, reject))
  })
}

const indexExists = indicesWrap('exists')

const indexDelete = indicesWrap('delete')

const indexCreate = indicesWrap('create')

const indexPutMapping = indicesWrap('putMapping')

const esBulk = options => {
  return new Promise((resolve, reject) => {
    es.bulk(options, promiseResolver(resolve, reject))
  })
}

exports.prepareType = options => {
  return indexExists({ index: 'test' })
    .then(exists => {
      if (exists) {
        return indexDelete({ index: 'test' })
      }
    })
    .then(() => indexCreate({ index: 'test' }))
    .then(() => {
      if (options.mapping) {
        return indexPutMapping(options.mapping)
      }
    })
    .then(() => {
      const index = 'test'
      const type = options.mapping.type
      const data = options.data.reduce((accu, item) => {
        return accu.concat(
          {
            index: {
              _index: index,
              _type: type
            }
          },
          item
        )
      }, [])
      return esBulk({
        body: data
      })
    })
    .then(() => timeout(1000))
}
