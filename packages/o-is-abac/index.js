'use strict'

const Policy = require('./lib/policy')
const oIsDefault = require('./lib/o-is-default')

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

module.exports = PolicySet
PolicySet.policy = function(options) {
	var oIs = (options && options.oIs) || oIs
	return new Policy(oIs)
}
