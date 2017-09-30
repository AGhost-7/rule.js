'use strict'

const get = require('lodash.get')
const assign = require('lodash.assign')
const util = require('util')

module.exports = function(oIs, options) {

	if(!options) options = {}

	const oIsMembers = assign({}, oIs.members, options.members || {})
	const oIsAssertions = assign({}, oIs.assertions, options.assertions || {})

	const constraintTypes = {
		mandatory(context, args) {
			const errors = []
			for(const key of args) {
				const value = get(context, args)
				if(value === null ||
						value === undefined ||
						(typeof value === 'string' && value.trim().length === 0)) {
					errors.push({
						type: 'mandatory',
						value: value,
						key: key
					})
				}
			}
			return errors
		},
		minLength(context, args) {
			const errors = []
			for(const key of args) {
				const value = get(context, key)
			}
			return errors
		}
	}
	
	const constraintMembers = {
		assert(context) {
			for(const constraint of this._constraints) {
				if(oIs.test(oIsAssertions, context, constraint.conditions)) {
					const errors = constraintTypes[constraint.type](context, constraint.args)
					if(errors.length > 0) {
						const message = util.format(
							'Failed validation on field "%s" with rule "%s"',
							errors[0].key,
							errors.type
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
					for(const error of constraintTypes[constraint.type](context, constraint.args)) {
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
				return this._cons({
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

	const ConstraintBuilder = function(constraints) {
		this._constraints = constraints
	}

	assign(ConstraintBuilder.prototype, constraintMembers)

	for(let type in constraintTypes) {
		ConstraintBuilder.prototype[type] = (function(type) {
			return function(...args) {
				return this._cons({
					conditions: [],
					type: type,
					args: args
				})
			}
		})(type)
	}

	ConstraintBuilder.prototype._cons = function(constraint) {
		return new ConstraintBuilder(this._constraints.concat(constraint))
	}

	ConstraintBuilder.prototype.when = function() {
		const condition = new OIsExtended([], [])
		condition._constraintBuilder = this
		return condition
	}

	return new ConstraintBuilder([])
}
