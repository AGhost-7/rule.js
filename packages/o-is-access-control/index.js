'use strict'

const Policy = require('./lib/policy')
const PolicySet = require('./lib/policy-set')
const oIsDefault = require('./lib/o-is-default')


exports.PolicySet = PolicySet
exports.Policy = Policy

exports.policySet = function(options) {
	return new PolicySet(options && options.oIs) || oIsDefault
}

exports.policy = function(options) {
	var oIs = (options && options.oIs) || oIsDefault
	return new Policy(oIs)
}

