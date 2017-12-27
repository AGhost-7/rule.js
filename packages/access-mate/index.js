'use strict'

const Policy = require('./lib/policy')
const PolicySet = require('./lib/policy-set')
const oIsDefault = require('./lib/o-is-default')
const strategies = require('./lib/strategies')
const middlewares = require('./lib/middlewares')

exports.PolicySet = PolicySet
exports.Policy = Policy

exports.policySet = function(policies, oIs) {
	return PolicySet.fromJSON(policies || [], oIs || oIsDefault)
}

exports.policy = function(oIs) {
	return new Policy(oIs || oIsDefault)
}

exports.strategies = strategies
exports.middlewares = middlewares
