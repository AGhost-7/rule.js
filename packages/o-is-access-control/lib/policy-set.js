'use strict'

const oIsDefault = require('./o-is-default')

const Policy = require('./policy')
const packageName = require('../package').name
const debug = require('debug')(packageName)

class PolicySet {

	constructor(oIs, policies) {
		this._policies = policies || []
		this._oIs = oIs || oIsDefault
	}

	/**
	 * Returns a new policy with a "deny" effect.
	 */
	deny() {
		return new Policy(this, 'deny')
	}

	/**
	 * Returns a new policy with an "allow" effect.
	 */
	allow() {
		return new Policy(this, 'allow')
	}

	/**
	 * Concatenate policy sets together.
	 */
	concat() {
		var policies = Array.prototype.concat.apply(this._policies, arguments)
		return new PolicySet(this._oIs, policies)
	}

	/**
	 * Returns a serializable representation of the policy set.
	 */
	toJSON() {
		return this._policies.map((policy) => {
			return {
				effect: policy._effect,
				action: policy._action,
				condition: policy._condition,
				target: policy._target
			}
		})
	}

	/**
	 * Function returns true if you are authorized or false if denied.
	 */
	authorize(context) {
		for(const policy of this._policies) {
			if(debug.enabled) {
				debug('Evaluating policy %O', policy.toJSON())
			}
			const result = policy.decision(context)
			if(result !== undefined) {
				debug('Decision "%s" reached', result)
				return result
			}
		}
		debug('No decision reached in policy set')
		return false
	}

	static fromJSON(policies, oIs) {
		const policySet = new PolicySet(oIs)
		policySet._policies = policies.map(policy => Policy.fromJSON(policySet, policy))
		return policySet
	}

}

module.exports = PolicySet
