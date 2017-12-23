'use strict'

const uniq = require('lodash.uniq')

const simpleStrategy = exports.simple = (policySet, options) => {
	const context = {
		action: options.action,
		target: options.target,
		environment: options.environment || {},
		subject: options.subject || {},
		resource: options.resource || {}
	}

	return policySet.authorize(context)
}

const previousResourceStrategy = (policySet, options) => {
	if(options.previousResource === null ||
			typeof options.previousResource !== 'object') {
		throw new Error('Option "previousResource" must be specified.')
	}

	return simpleStrategy(policySet, {
		environment: options.environment,
		subject: options.subject,
		resource: options.previousResource,
		action: options.action,
		target: options.target
	})

}

const mergeResults = (result1, result2) => {
	return {
		authorize: result1.authorize && result2.authorize,
		omit: uniq(result1.omit, result2.uniq)
	}
}

exports.crud = (policySet, options) => {

	switch(options.action) {
	case 'update':
		return mergeResults(
			simpleStrategy(policySet, options),
			previousResourceStrategy(policySet, options)
		)
	case 'update-from':
		return previousResourceStrategy(policySet, options)
	case 'update-into':
		return simpleStrategy(policySet, options)
	default:
		return simpleStrategy(policySet, options)
	}
}

exports.bread = (policySet, options) => {
	switch(options.action) {
	case 'browse':
		if(!Array.isArray(options.resources)) {
			throw new Error('Option "resources" must be specified')
		}
		const results = []
		for(const resource of options.resources) {
			const result = simpleStrategy(policySet, {
				resource,
				environment: options.environment,
				subject: options.subject,
				action: options.action,
				target: options.target
			})
			results.push(result)
		}
		return results
	case 'edit':
		return mergeResults(
			simpleStrategy(policySet, options),
			previousResourceStrategy(policySet, options)
		)
	case 'edit-from':
		return previousResourceStrategy(policySet, options)
	case 'edit-into':
		return simpleStrategy(policySet, options)
	case 'read':
	case 'add':
	case 'delete':
		return simpleStrategy(policySet, options)
	default:
		throw new Error('Invalid action "' + options.action + '"')
	}
}
