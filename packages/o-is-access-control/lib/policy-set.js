'use strict'

const oIsDefault = require('./o-is-default')

const Policy = require('./policy')

class PolicySet {

	constructor(oIs, policies) {
		this._policies = policies || []
		this._oIs = oIs || oIsDefault
	}

	deny() {
		return new Policy(this, 'deny')
	}

	allow() {
		return new Policy(this, 'allow')
	}

	concat() {
		var policies = Array.prototype.concat.apply(this._policies, arguments)
		return new PolicySet(this._oIs, policies)
	}

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
	 * Iteration utility which will return the result of the first function call
	 * which does not return undefined. Second parameter is the default return
	 * value if the iterator returns undefined for all policies.
	 */
	authorize(iterator, defaultResult) {
		for(const policy of this._policies) {
			const result = iterator(policy)
			if(result !== undefined) {
				return result
			}
		}
		return defaultResult
	}

	static fromJSON(policies, oIs) {
		const policySet = new PolicySet(oIs)
		policySet._policies = policies.map(policy => Policy.fromJSON(policySet, policy))
		return policySet
	}

}

module.exports = PolicySet
