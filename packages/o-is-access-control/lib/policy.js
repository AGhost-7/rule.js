'use strict'

const oIsDefault = require('./o-is-default')

class Policy {
	constructor(policySet, effect) {
		this._policySet = policySet
		this._oIs = policySet._oIs || oIsDefault
		this._target = []
		this._action = []
		this._condition = null
		this._effect = effect || null
	}
	_copy() {
		const copy = new Policy(this._policySet)
		copy._effect = this._effect 
		copy._action = this._action
		copy._condition = this._condition
		copy._target = this._target
		return copy
	}
	_set(key, value) {
		const copy = this._copy()
		copy[key] = value
		return copy
	}
	_concat(key, value) {
		const copy = this._copy()
		copy[key] = copy[key].concat(value)
		return copy
	}
	target(value) {
		return this._concat('_target', value)
	}
	action(value) {
		return this._concat('_action', value)
	}
	effect(value) {
		if(value !== 'allow' || value !== 'deny') {
			throw new Error('Effect "' + value + '" is not valid')
		}
		return this._set('_effect', value)
	}
	allow() {
		return this._policySet.concat(this).allow()
	}
	deny() {
		return this._policySet.concat(this).deny()
	}
	concat(item) {
		return this._policySet.concat(this, item)
	}

	condition(value) {
		if(value) {
			return this._set('_condition', value.tests)
		} else {
			const o = this._oIs()
			o._policy = this
			return o
		}
	}

	toJSON() {
		return this._policySet.concat(this).toJSON()
	}

	static fromJSON(policySet, obj) {
		const policy = new Policy(policySet, obj.effect)
		policy._target = obj.target
		policy._action = obj.action
		policy._condition = obj.condition
		return policy
	}

	/**
	 * Returns true if the decision was made to allow access, false if denied,
	 * undefined if unable to reach decision.
	 */
	decision(context) {

		if(typeof context.action !== 'string') {
			throw new Error('Action must be a string.')
		}

		if(typeof context.target !== 'string') {
			throw new Error('Target must be a string.')
		}

		for(const action of this._action) {
			for(const target of this._target) {
				if(context.action === action &&
						context.target === target &&
						this._oIs.test(this._oIs.assertions, context, this._condition)) {
					switch(this._effect) {
					case 'allow':
						return true
					case 'deny':
						return false
					default:
						throw new Error('Invalid effect "' + this._effect + '"')
					}
				}
			}
		}
	}

	/**
	 * Concatenates the policy to the policy set and returns the policy set.
	 */
	end() {
		return this._policySet.concat(this)
	}
}

module.exports = Policy
