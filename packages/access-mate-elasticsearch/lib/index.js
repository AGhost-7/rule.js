const assert = require('assert')
const toPath = require('lodash.topath')

const toEsKey = key => {
  const path = toPath(key)
  return path.slice(1).join('.')
}

const DefaultRule = require('@rule.js/core').extend(
  {},
  {
    contextualize: require('@rule.js/contextualize'),
    elasticsearch: require('@rule.js/elasticsearch')(toEsKey)
  }
)

const esCondition = (policy, context, Rule) => {
  if (!policy.condition || policy.condition.length === 0) {
    return {
      match_all: {}
    }
  }
  const rule = Rule(policy.condition).contextualize({
    environment: context.environment,
    subject: context.subject
  })

  if (rule.tests.length === 1 && rule.tests[0].type === 'pass') {
    return {
      match_all: {}
    }
  }
  return rule.elasticsearch()
}

const buildQuery = (policies, context, index, Rule) => {
  let policy = policies[index]

  while (policy) {
    if (
      policy.action.includes(context.action) &&
      policy.target.includes(context.target)
    ) {
      break
    } else {
      index += 1
      policy = policies[index]
    }
  }

  if (!policy) return null

  let next = null
  if (policies.length - 1 > index) {
    next = buildQuery(policies, context, index + 1, Rule)
  }

  const condition = esCondition(policy, context, Rule)

  if (policy.effect === 'allow') {
    if (next === null) {
      return {
        bool: {
          must: condition
        }
      }
    } else {
      return {
        bool: {
          should: [condition, next]
        }
      }
    }
  } else if (policy.effect === 'deny') {
    if (next === null) {
      return {
        bool: {
          must_not: condition
        }
      }
    } else {
      return {
        bool: {
          must_not: condition,
          must: [next]
        }
      }
    }
  } else {
    throw new Error('Invalid effect ' + policy.effect)
  }
}

module.exports = (policies, context, Rule = DefaultRule) => {
  assert(context.environment, 'environment is required')
  assert(context.subject, 'subject is required')
  assert(context.action, 'action is required')
  assert(context.target, 'target is required')
  if (policies.toJSON) policies = policies.toJSON()
  return buildQuery(policies, context, 0, Rule)
}
