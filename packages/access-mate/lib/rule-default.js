'use strict'

const Rule = require('@rule.js/core')

const RuleClass = Rule.createClass(Rule.assertions, Rule.members)

RuleClass.prototype.end = function() {
  const copy = this._policy._copy()
  copy._condition = this.tests
  return copy
}

RuleClass.prototype._create = function(tests, boundKeys) {
  const rule = new RuleClass(tests, boundKeys)
  rule._policy = this._policy
  return rule
}

module.exports = items => new RuleClass(items || [], [])

module.exports.test = Rule.test
module.exports.assertions = Rule.assertions
module.exports.members = Rule.members
