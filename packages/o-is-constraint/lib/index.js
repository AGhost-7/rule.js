'use strict'

const assign = require('lodash.assign')
const util = require('util')
const baseConstraintTypes = require('./base-constraint-types')
const oIs = require('o-is')

const createClass = (constraintMembers, constraintTypes, OIsExtended) => {
  const ConstraintBuilder = function(constraints, constraintTypes) {
    this._constraints = constraints
    this._constraintTypes = constraintTypes
  }

  assign(ConstraintBuilder.prototype, constraintMembers)

  for (let type in constraintTypes) {
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
    const condition = new OIsExtended([], [])
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

const createOIsClass = (
  oIsMembers,
  oIsAssertions,
  constraintMembers,
  constraintTypes
) => {
  for (let type in constraintTypes) {
    oIsMembers[type] = (function(type) {
      return function(...args) {
        return this._constraintBuilder.concat({
          conditions: this.tests,
          type: type,
          args: args
        })
      }
    })(type)
  }

  for (let key in constraintMembers) {
    oIsMembers[key] = (function(key) {
      return function(context) {
        this._constraintBuilder[key](context)
      }
    })(key)
  }

  const OIsExtended = oIs.createClass(oIsAssertions, oIsMembers)

  const createOIs = OIsExtended.prototype._create

  OIsExtended.prototype._create = function(tests, boundKeys) {
    const instance = createOIs.call(this, tests, boundKeys)
    instance._constraintBuilder = this._constraintBuilder
    return instance
  }

  return OIsExtended
}

module.exports = function(options) {
  if (!options) options = {}

  const oIsMembers = assign({}, oIs.members, options.members || {})
  const oIsAssertions = assign({}, oIs.assertions, options.assertions || {})
  const constraintTypes = assign(
    {},
    baseConstraintTypes,
    options.constraintTypes || {}
  )

  const constraintMembers = {
    assert(context) {
      for (const constraint of this._constraints) {
        if (oIs.test(oIsAssertions, context, constraint.conditions)) {
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
        if (oIs.test(oIsAssertions, context, constraint.conditions)) {
          const constraintType = this._constraintTypes[constraint.type]
          for (const error of constraintType(context, constraint.args)) {
            errors.push(error)
          }
        }
      }
      return errors
    }
  }

  const OIsExtended = createOIsClass(
    oIsMembers,
    oIsAssertions,
    constraintMembers,
    constraintTypes
  )

  const ConstraintBuilder = createClass(
    constraintMembers,
    constraintTypes,
    OIsExtended
  )

  return new ConstraintBuilder([], constraintTypes)
}
