const createOrClass = ruleProto => {
  function Or(parent, tests, boundKeys) {
    this.parent = parent
    this._boundKeys = boundKeys
    this.tests = tests
  }
  Or.prototype = Object.assign(Object.create(null), ruleProto)
  Or.prototype._create = function(tests, boundKeys) {
    return new Or(this.parent, tests, boundKeys)
  }
  Or.prototype.end = function() {
    return this.parent._cons({
      type: 'or',
      tests: this.tests
    })
  }
  // Since by default the chain of tests work like an "and",
  // I just need to add this option to the Or prototype
  Or.prototype.and = function() {
    return new this._And(this, [], this._boundKeys)
  }

  function And(parent, tests, boundKeys) {
    this.parent = parent
    this._boundKeys = boundKeys
    this.tests = tests
  }
  And.prototype = Object.assign(Object.create(null), ruleProto)

  And.prototype._create = function(tests, boundKeys) {
    return new And(this.parent, tests, boundKeys)
  }
  And.prototype.end = function() {
    return this.parent._cons({
      type: 'and',
      tests: this.tests
    })
  }

  Or.prototype._And = And

  Or.prototype._Or = Or

  return Or
}

module.exports = { createOrClass }
