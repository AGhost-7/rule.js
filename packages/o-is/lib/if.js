'use strict'

const assign = require('lodash.assign')

const createIfClass = oIsProto => {
  function Else(parent, conds, ifTests, tests, boundKeys) {
    this.parent = parent
    this.conds = conds
    this.ifTests = ifTests
    this.tests = tests
    this._boundKeys = boundKeys
  }

  Else.prototype = assign(Object.create(null), oIsProto)

  Else.prototype._create = function(tests, boundKeys) {
    return new Else(this.parent, this.conds, this.ifTests, tests, boundKeys)
  }

  Else.prototype.end = function() {
    return this.parent._cons({
      type: 'if',
      conds: this.conds,
      ifTrue: this.ifTests,
      ifFalse: this.tests
    })
  }

  const Then = function(parent, conds, tests, boundKeys) {
    this.parent = parent
    this.conds = conds
    this.tests = tests
    this._boundKeys = boundKeys
  }

  Then.prototype = assign(Object.create(null), oIsProto)

  Then.prototype.end = function() {
    return this.parent._cons({
      type: 'if',
      conds: this.conds,
      ifTrue: this.tests,
      ifFalse: []
    })
  }

  Then.prototype._create = function(tests, boundKeys) {
    return new Then(this.parent, this.conds, tests, boundKeys)
  }

  Then.prototype.else = function() {
    return new Else(this.parent, this.conds, this.tests, [], this._boundKeys)
  }
  const If = function(parent, tests, boundKeys) {
    this.parent = parent
    this.tests = tests
    this._boundKeys = boundKeys
  }

  If.prototype = assign(Object.create(null), oIsProto)
  If.prototype.then = function() {
    return new this._Then(this.parent, this.tests, [], this._boundKeys)
  }
  If.prototype._create = function(tests, boundKeys) {
    return new this._If(this.parent, tests, boundKeys)
  }

  If.prototype._If = If
  If.prototype._Then = Then
  If.prototype._Else = Else
  Then.prototype._If = If
  Else.prototype._If = If

  return If
}
module.exports = { createIfClass }
