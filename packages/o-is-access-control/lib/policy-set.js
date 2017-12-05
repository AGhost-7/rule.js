'use strict'

const oIsDefault = require('./o-is-default')

const Policy = require('./policy')

const authorize = function(oIs, policies, options) {
	const context = {
		environment: options.environment || {},
		subject: options.subject || {},
		resource: options.resource || {}
	}
	const assertions = oIs.assertions

	for(const policy of policies) {
		const condition = policy.condition
		if(policy.action === options.action &&
				policy.target === options.target &&
				oIs.test(assertions, context, condition)) {
			switch(policy.effect) {
			case 'allow':
				return true
			case 'deny':
				return false
			default:
				throw new Error('Invalid effect "' + policy.effect + '"')
			}
		}
	}

	return false
}


function PolicySet(oIs, policies) {
	this._policies = policies || []
	this._oIs = oIs || oIsDefault
}

PolicySet.prototype.deny = function() {
	return new Policy(this, 'deny')
}

PolicySet.prototype.allow = function() {
	return new Policy(this, 'allow')
}

PolicySet.prototype.concat = function() {
	var policies = Array.prototype.concat.apply(this._policies, arguments)
	return new PolicySet(this._oIs, policies)
}

PolicySet.prototype.toJSON = function() {
	return this._policies.map((policy) => {
		return {
			effect: policy._effect,
			action: policy._action,
			condition: policy._condition,
			target: policy._target
		}
	})
}

PolicySet.prototype.authorize = function(options) {
	return authorize(this._oIs, this._policies, options)
}

module.exports = PolicySet
