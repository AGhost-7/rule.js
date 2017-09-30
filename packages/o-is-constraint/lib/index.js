'use strict'

const get = require('lodash.get')
const assign = require('lodash.assign')
const util = require('util')
const baseConstraintTypes = require('./base-constraint-types')

module.exports = function(oIs, options) {

	if(!options) options = {}

	const oIsMembers = assign({}, oIs.members, options.members || {})
	const oIsAssertions = assign({}, oIs.assertions, options.assertions || {})
	const constraintTypes = assign(
		{}, baseConstraintTypes, options.constraintTypes || {})

	const constraintMembers = {
		assert(context) {
			for(const constraint of this._constraints) {
				if(oIs.test(oIsAssertions, context, constraint.conditions)) {
					const errors = this._constraintTypes[constraint.type](
						context, constraint.args)
					if(errors.length > 0) {
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
			for(const constraint of this._constraints) {
				if(oIs.test(oIsAssertions, context, constraint.conditions)) {
					const constraintType = this._constraintTypes[constraint.type]
					for(const error of constraintType(context, constraint.args)) {
						errors.push(error)
					}
				}
			}
			return errors
		}
	}

	for(let type in constraintTypes) {
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

	for(let key in constraintMembers) {
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

	const ConstraintBuilder = function(constraints, constraintTypes) {
		this._constraints = constraints
		this._constraintTypes = constraintTypes
	}

	assign(ConstraintBuilder.prototype, constraintMembers)

	for(let type in constraintTypes) {
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
		const constraints = this._constraints.concat(constraint)
		return new ConstraintBuilder(constraints, this._constraintTypes)
	}

	ConstraintBuilder.prototype.when = function() {
		const condition = new OIsExtended([], [])
		condition._constraintBuilder = this
		return condition
	}

	return new ConstraintBuilder([], constraintTypes)
}
