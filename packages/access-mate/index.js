'use strict'

const Policy = require('./lib/policy')
const PolicySet = require('./lib/policy-set')
const RuleDefault = require('./lib/rule-default')
const strategies = require('./lib/strategies')

exports.PolicySet = PolicySet
exports.Policy = Policy

exports.policySet = function(policies, Rule) {
  return PolicySet.fromJSON(policies || [], Rule || RuleDefault)
}

exports.policy = function(Rule) {
  return new Policy(Rule || RuleDefault)
}

exports.strategies = strategies
