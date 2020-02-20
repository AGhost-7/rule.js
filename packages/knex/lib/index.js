'use strict'

const snakeCase = require('lodash.snakecase')

const conversions = {
  _expand(knex, toDb, tests) {
    const self = this
    for (const test of tests) {
      knex.where(function() {
        self[test.type](this, toDb, test)
      })
    }
  },
  not(knex, toDb, obj) {
    const self = this
    knex.whereNot(function() {
      self[obj.args.type](this, toDb, obj.args)
    })
  },
  and(knex, toDb, obj) {
    const self = this
    knex.where(function() {
      for (const test of obj.tests) {
        this.andWhere(function() {
          self[test.type](this, toDb, test)
        })
      }
    })
  },
  or(knex, toDb, obj) {
    const self = this
    knex.where(function() {
      for (const test of obj.tests) {
        this.orWhere(function() {
          self[test.type](this, toDb, test)
        })
      }
    })
  },
  fail(knex, toDb, obj) {
    knex.whereRaw('false')
  },
  pass(knex, toDb, obj) {
    knex.whereRaw('true')
  },
  equal(knex, toDb, obj) {
    knex.where(toDb(obj.key), '=', obj.value)
  },
  any(knex, toDb, obj) {
    knex.whereIn(toDb(obj.key), obj.values)
  },
  contains(knex, toDb, obj) {
    knex.whereRaw('?? @> ARRAY[?]', [obj.key, obj.value])
  },
  notEqual(knex, toDb, obj) {
    knex.whereNot(toDb(obj.key), '=', obj.value)
  },
  null(knex, toDb, obj) {
    knex.whereNull(toDb(obj.key))
  },
  empty(knex, toDb, obj) {
    knex.whereNull(toDb(obj.key))
  },
  true(knex, toDb, obj) {
    knex.where(toDb(obj.key), '=', true)
  },
  false(knex, toDb, obj) {
    knex.where(toDb(obj.key), '=', false)
  },
  gt(knex, toDb, obj) {
    knex.where(toDb(obj.key), '>', obj.value)
  },
  lt(knex, toDb, obj) {
    knex.where(toDb(obj.key), '<', obj.value)
  },
  propsEqual(knex, toDb, obj) {
    knex.whereRaw('?? = ??', [toDb(obj.keys[0]), toDb(obj.keys[1])])
  }
}

module.exports = function(toDb) {
  if (!toDb) toDb = snakeCase
  return function(knex) {
    for (const test of this.tests) {
      knex.where(function() {
        conversions[test.type](this, toDb, test)
      })
    }
    return knex
  }
}
