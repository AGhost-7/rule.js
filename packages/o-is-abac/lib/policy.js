/**
 * Immutable builder for policies.
 */

'use strict'

function Policy(policySet, effect) {
	this._policySet = policySet
	this._target = null
	this._action = null
	this._condition = null
	this._effect = effect || null
}

Policy.prototype._copy = function() {
	const copy = new Policy(this._policySet)
	copy._effect = this._effect 
	copy._action = this._action
	copy._condition = this._condition
	copy._target = this._target
	return copy
}

const chainableSetter = function(property) {
	return function(value) {
		const copy = this._copy()
		copy[property] = value
		return copy
	}
}

Policy.prototype.target = chainableSetter('_target')
Policy.prototype.action = chainableSetter('_action')
Policy.prototype.effect = chainableSetter('_effect')

Policy.prototype.allow = function() {
	return this._policySet.concat(this).allow()
}

Policy.prototype.deny = function() {
	return this._policySet.concat(this).deny()
}

Policy.prototype.condition = function() {
	const o = this._policySet._oIs()
	o._policy = this
	return o
}

Policy.prototype.toJSON = function() {
	return {
		effect: this._effect,
		action: this._action,
		condition: this._condition,
		target: this._target
	}
}

module.exports = Policy
