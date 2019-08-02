'use strict'

const { assertions, testRunner, assertRunner } = require('./assertions')
const clone = require('lodash.clone')
const get = require('lodash.get')
const { createNotClass } = require('./not')
const { createOrClass } = require('./or')

// below are the sort-of-but-not-really "builders".

const memberTestMethods = {
  _decomposeEqualObject(obj) {
    var arr = []
    for (var k in obj) {
      arr.push({
        key: this._key(k),
        value: obj[k],
        type: 'equal'
      })
    }
    return arr
  },
  equal(arg1, arg2) {
    if (typeof arg1 !== 'string') {
      return this._cons(this._decomposeEqualObject(arg1))
    }
    return this._cons({
      key: this._key(arg1),
      value: arg2,
      type: 'equal'
    })
  },
  propsEqual(...keys) {
    return this._cons({
      keys: keys.map(k => this._key(k)),
      type: 'propsEqual'
    })
  },
  any(key, values) {
    return this._cons({
      type: 'any',
      key: key,
      values: values
    })
  },
  contains(key, value) {
    return this._cons({
      type: 'contains',
      key,
      value
    })
  }
}

const keyOnlyTestMethods = ['null', 'true', 'false']

const kvOnlyTestMethods = ['lt', 'gt', 'notEqual']

keyOnlyTestMethods.forEach(name => {
  memberTestMethods[name] = function(key) {
    return this._cons({
      key: this._key(key),
      type: name
    })
  }
})

kvOnlyTestMethods.forEach(name => {
  memberTestMethods[name] = function(key, value) {
    return this._cons({
      key: this._key(key),
      value,
      type: name
    })
  }
})

const members = {
  _cons(val) {
    return this._create(this.tests.concat(val), this._boundKeys)
  },
  concat(val) {
    if (this._isInstance(val)) {
      return this._create(this.tests.concat(val.tests))
    }
    return this._cons(val)
  },
  _kCons(type, key) {
    return this._cons({ type, key })
  },
  // Used to override...
  _key(k) {
    return this._boundKeys.concat(k).join('.')
  },
  if() {
    return new this._If(this, [], this._boundKeys)
  },
  not() {
    return new this._Not(this)
  },
  or() {
    return new this._Or(this, [], this._boundKeys)
  },
  bind(key) {
    return this._create(this.tests, this._boundKeys.concat(key))
  },
  unbind() {
    return this._create(this.tests, this._boundKeys.slice(1))
  },
  unbindAll() {
    return this._create(this.tests, [], [])
  },
  toJSON() {
    return this.tests
  },
  serialize() {
    return this.tests
  },
  print(opt) {
    /* eslint no-console: "off" */
    console.log((opt || '') + JSON.stringify(this.tests, null, 2))
    return this
  },
  test(obj) {
    return testRunner(this.assertions, obj, this.tests)
  },
  fails(obj) {
    return !this.test(obj)
  },
  assert(obj) {
    assertRunner(this.assertions, obj, this.tests)
  }
}

Object.assign(members, memberTestMethods)

const createClass = (assertions, members) => {
  function RuleClass(tests, boundKeys) {
    this._boundKeys = boundKeys
    this.tests = tests
  }
  RuleClass.prototype = Object.create(null)
  Object.assign(RuleClass.prototype, members)
  RuleClass.prototype._create = function(tests, boundKeys) {
    return new RuleClass(tests, boundKeys)
  }
  RuleClass.prototype._isInstance = obj => obj instanceof RuleClass
  RuleClass.prototype.assertions = assertions

  var Or = createOrClass(RuleClass.prototype)
  RuleClass.prototype._Or = Or

  const Not = createNotClass(RuleClass.prototype)
  RuleClass.prototype._Not = Not
  Or.prototype._Not = Not

  return RuleClass
}

const RuleClass = createClass(assertions, members)

const mod = items => {
  return new RuleClass(items || [], [])
}

const extend = (a, m) => {
  const newAsserts = Object.assign(clone(assertions), a)
  const newMembers = Object.assign(clone(members), m)
  const Class = createClass(newAsserts, newMembers)
  return items => {
    return new Class(items || [], [])
  }
}

mod.test = testRunner
mod.assertions = assertions
mod.members = members
mod.get = get
mod.extend = extend
mod.createClass = createClass

module.exports = mod
