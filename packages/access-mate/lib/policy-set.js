'use strict'

const oIsDefault = require('./o-is-default')

const Policy = require('./policy')
const packageName = require('../package').name
const debug = require('debug')(packageName)
const omit = require('lodash.omit')

class PolicySet {

	constructor(oIs, policies) {
		this._policies = policies || []
		this._oIs = oIs || oIsDefault
		this._defaults = null
	}

	defaults(defaults) {
		const policySet = new PolicySet(this._oIs, this._policies)
		policySet._defaults = defaults
		return policySet
	}

	_createPolicy(effect) {
		const policy = new Policy(this, effect)
		if(this._defaults) {
			const properties = [
				'fields',
				'action',
				'condition',
				'target',
				'name'
			]
			for(const property of properties) {
				if(property in this._defaults) {
					policy['_' + property] = this._defaults[property]
				}
			}
		}
		return policy
	}

	deny() {
		return this._createPolicy('deny')
	}

	allow() {
		return this._createPolicy('allow')
	}

	concat() {
		var policies = Array.prototype.concat.apply(this._policies, arguments)
		return new PolicySet(this._oIs, policies)
	}

	toJSON() {
		return this._policies.map((policy) => {
			const serializable = {
				effect: policy._effect,
				action: policy._action,
				condition: policy._condition,
				name: policy._name,
				target: policy._target
			}
			if(policy._fields) serializable.fields = policy._fields
			return serializable
		})
	}

	authorize(context) {
		const fieldDecisions = {}
		let allDecision = null

		for(const policy of this._policies) {
			debug('Evaluating policy "%s"', policy._name)
			const result = policy.decision(context)
			if(result !== undefined) {
				if(policy._fields !== null) {
					for(const field of policy._fields) {
						if(fieldDecisions[field] === undefined) {
							debug('Decision "%s" for field "%s" reached', result, field)
							fieldDecisions[field] = result
						}
					}
				} else if(allDecision === null) {
					debug('Decision "%s" for all reached', result)
					allDecision = result
				}
			}
		}

		const omit = Object
			.keys(fieldDecisions)
			.filter((key) => !fieldDecisions[key])

		let authorize = null
		if(allDecision === null) {
			debug('No all decision reached in policy set')
			authorize = false
		} else {
			authorize = allDecision
		}

		return { omit, authorize }
	}

	filter(context) {
		const resources = []
		for(const resource of context.resources) {
			const decision = this.authorize(Object.assign({ resource }, context))
			if(decision.authorize) {
				resources.push(omit(resource, decision.omit))
			}
		}
		return resources
	}

	static fromJSON(policies, oIs) {
		const policySet = new PolicySet(oIs)
		policySet._policies = policies.map(policy => Policy.fromJSON(policySet, policy))
		return policySet
	}

}

module.exports = PolicySet
