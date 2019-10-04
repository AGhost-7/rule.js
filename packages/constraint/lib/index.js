'use strict'

const assign = require('lodash.assign')
const util = require('util')
const baseConstraintTypes = require('./base-constraint-types')
const Rule = require('@rule.js/core')

const createClass = (constraintMembers, constraintTypes, RuleExtended) => {
  const ConstraintBuilder = function(constraints, constraintTypes) {
    this._constraints = constraints
    this._constraintTypes = constraintTypes
  }

  assign(ConstraintBuilder.prototype, constraintMembers)

  for (const type in constraintTypes) {
    ConstraintBuilder.prototype[type] = (function(type) {
      return function(...args) {
        return this.concat({
          conditions: [],
          type: type,
          args: args
        })
      }
    })(type)
  }

  ConstraintBuilder.prototype.concat = function(constraint) {
    const concatening =
      constraint instanceof ConstraintBuilder
        ? constraint._constraints
        : constraint
    const constraints = this._constraints.concat(concatening)
    return new ConstraintBuilder(constraints, this._constraintTypes)
  }

  ConstraintBuilder.prototype.when = function() {
    const condition = new RuleExtended([], [])
    condition._constraintBuilder = this
    return condition
  }

  ConstraintBuilder.prototype.toJSON = function() {
    return this._constraints
  }

  ConstraintBuilder.prototype.fromJSON = function(constraints) {
    return new ConstraintBuilder(constraints, constraintTypes)
  }

  return ConstraintBuilder
}

const createRuleClass = (
  ruleMembers,
  ruleAssertions,
  constraintMembers,
  constraintTypes
) => {
  for (const type in constraintTypes) {
    ruleMembers[type] = (function(type) {
      return function(...args) {
        return this._constraintBuilder.concat({
          conditions: this.tests,
          type: type,
          args: args
        })
      }
    })(type)
  }

  for (const key in constraintMembers) {
    ruleMembers[key] = (function(key) {
      return function(context) {
        this._constraintBuilder[key](context)
      }
    })(key)
  }

  const RuleExtended = Rule.createClass(ruleAssertions, ruleMembers)

  const createRule = RuleExtended.prototype._create

  RuleExtended.prototype._create = function(tests, boundKeys) {
    const instance = createRule.call(this, tests, boundKeys)
    instance._constraintBuilder = this._constraintBuilder
    return instance
  }

  return RuleExtended
}

module.exports = function(options) {
  if (!options) options = {}

  const ruleMembers = assign({}, Rule.members, options.members || {})
  const ruleAssertions = assign({}, Rule.assertions, options.assertions || {})
  const constraintTypes = assign(
    {},
    baseConstraintTypes,
    options.constraintTypes || {}
  )

  const constraintMembers = {
    assert(context) {
      for (const constraint of this._constraints) {
        if (Rule.test(ruleAssertions, context, constraint.conditions)) {
          const errors = this._constraintTypes[constraint.type](
            context,
            constraint.args
          )
          if (errors.length > 0) {
            const message = util.format(
              'Failed validation on field "%s" with rule "%s"',
              errors[0].key,
              errors[0].type
            )
            throw new Error(message)
          }
        }
      }
    },
    errors(context) {
      const errors = []
      for (const constraint of this._constraints) {
        if (Rule.test(ruleAssertions, context, constraint.conditions)) {
          const constraintType = this._constraintTypes[constraint.type]
          for (const error of constraintType(context, constraint.args)) {
            errors.push(error)
          }
        }
      }
      return errors
    }
  }

  const RuleExtended = createRuleClass(
    ruleMembers,
    ruleAssertions,
    constraintMembers,
    constraintTypes
  )

  const ConstraintBuilder = createClass(
    constraintMembers,
    constraintTypes,
    RuleExtended
  )

  return new ConstraintBuilder([], constraintTypes)
}
