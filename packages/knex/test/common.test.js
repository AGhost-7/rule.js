const snakeCase = require('lodash.snakecase')
const camelCase = require('lodash.camelcase')
const Rule = require('@rule.js/core').extend(
  {},
  {
    knex: require('..')()
  }
)
const commonSuite = require('@rule.js/common-suite')(Rule)
const knexlib = require('knex')

const caseConvert = function(keyConvert) {
  return function(obj) {
    return Object.keys(obj).reduce((accu, key) => {
      accu[keyConvert(key)] = obj[key]
      return accu
    }, {})
  }
}

const snakeObject = caseConvert(snakeCase)
const camelObject = caseConvert(camelCase)

const setupTable = async function(knex) {
  await knex.schema.dropTableIfExists('people')
  await knex.schema.createTable('people', table => {
    table.string('first_name')
    table.string('last_name')
    table.integer('age')
    table.boolean('deceased')
    table.boolean('virtuoso')
    table.string('occupation')
    table.specificType('hobbies', 'text[]')
    table.string('country')
    table.string('instrument')
    table.string('description')
  })
  await knex.Promise.each(commonSuite.data, item =>
    knex('people').insert(snakeObject(item))
  )
}

const testSuite = function(knex) {
  commonSuite.tests.forEach(test => {
    const title = test[0]
    const rule = test[1]
    const testBlock = test[2]
    it(title, () => {
      return knex('people')
        .select()
        .where(function() {
          rule.knex(this)
        })
        .then(function(rows) {
          return rows.map(camelObject)
        })
        .then(testBlock)
    })
  })
}

describe('@rule.js/knex#common', () => {
  describe('postgres', () => {
    const knex = knexlib({
      client: 'pg',
      connection: {
        user: process.env.PGUSER || 'postgres',
        database: process.env.PGDATABASE || 'postgres'
      }
    })

    before(() => {
      return setupTable(knex)
    })

    testSuite(knex)

    after(() => knex.destroy())
  })

  describe.skip('mysql', () => {
    const knex = knexlib({
      client: 'mysql2',
      connection: {
        host: process.env.MYSQL_HOST || '127.0.0.1'
      }
    })

    before(() => {
      return setupTable(knex)
    })

    testSuite(knex)

    after(() => knex.destroy())
  })
})
