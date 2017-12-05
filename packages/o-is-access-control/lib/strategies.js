'use strict'


/**
 * A very basic strategy which simply returns true or false. It does not matter
 * what kind of action you specify in your policies.
 */
const simpleStrategy = exports.simple = (policySet, options) => {
	const context = {
		action: options.action,
		target: options.target,
		environment: options.environment || {},
		subject: options.subject || {},
		resource: options.resource || {}
	}

	return policySet.authorize((policy) => {
		const res = policy.decision(context)
		return res
	}, false)
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

/**
 * CRUD strategy is quite similar to the simple strategy except on update the
 * subject must be allowed to access the document before and after it was
 * modified.
 */
exports.crud = (policySet, options) => {
	if(options.action !== 'update') {
		return simpleStrategy(policySet, options)
	}

	if(!simpleStrategy(policySet, options)) {
		return false
	} else {
		return previousResourceStrategy(policySet, options)
	}
}

/**
 * BREAD (Browse [AKA - List], Read, Edit, Add, Delete) is probably the most
 * appropriate strategy for a REST API... Behaves essentially the same as
 * CRUD with the exception of browse; browse requires a "resources" option
 * instead of "resource". If the action is browse this strategy will iterate
 * over every resource and return false if the subject does not have access
 * to all resources (true otherwise).
 */
exports.bread = (policySet, options) => {
	switch(options.action) {
	case 'browse':
		if(!Array.isArray(options.resources)) {
			throw new Error('Option "resources" must be specified')
		}
		return options.resources.every((resource) => {
			return simpleStrategy(policySet, {
				resource,
				environment: options.environment,
				subject: options.subject,
				action: options.action,
				target: options.target
			})
		})
	case 'edit':
		return previousResourceStrategy(policySet, options)
	case 'read':
	case 'add':
	case 'delete':
		return simpleStrategy(policySet, options)
	default:
		throw new Error('Invalid action "' + options.action + '"')
	}
}
