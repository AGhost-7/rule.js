const assert = require('assert')
var knex = require('knex')({ client: 'pg' })
const Rule = require('@rule.js/core').extend({}, {
  knex: require('..')()
})

const selectScenario = function(expect, block) {
  const sql = knex('user').select().where(function() {
    block.call(this)
  }).toString()
  assert.equal(expect, sql)
}

describe('conversions', function() {
  it('equal', function() {
    selectScenario(
      `select * from "user" where (("name" = 'joe pass') and ("active" = false))`,
      function() {
        Rule().equal('name', 'joe pass').equal('active', false).knex(this)
      })
  })

  it('null', function() {
    selectScenario(
      `select * from "user" where (("age" is null))`,
      function() {
        Rule().null('age').knex(this)
      })
  })

  it('pass', function() {
    selectScenario(
      `select * from "user" where ((true))`,
      function() {
        Rule([{ type: 'pass' }]).knex(this)
      })
  })

  it('fail', function() {
    selectScenario(
      `select * from "user" where ((false))`,
      function() {
        Rule([{ type: 'fail' }]).knex(this)
      })
  })

  it('any', function() {
    selectScenario(
      `select * from "user" where (("occupations" in ('guitar', 'smoking cigars')))`,
      function() {
        Rule().any('occupations', ['guitar', 'smoking cigars']).knex(this)
      })
  })

  it('not equal', function() {
    selectScenario(
      `select * from "user" where ((not "alive" = true))`,
      function() {
        Rule().notEqual('alive', true).knex(this)
      })
  })

  it('true', function() {
    selectScenario(
      `select * from "user" where (("jazzy" = true))`,
      function() {
        Rule().true('jazzy').knex(this)
      })
  })

  it('false', function() {
    selectScenario(
      `select * from "user" where (("alive" = false))`,
      function() {
        Rule().false('alive').knex(this)
      })
  })

  it('gt', function() {
    selectScenario(
      `select * from "user" where (("age" > 17))`,
      function() {
        Rule().gt('age', 17).knex(this)
      })
  })

  it('lt', function() {
    selectScenario(
      `select * from "user" where (("age" < 1000))`,
      function() {
        Rule().lt('age', 1000).knex(this)
      })
  })
})
