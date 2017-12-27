'use strict'

const get = require('lodash.get')
const strategies = require('./strategies')

const format = (req, res, options, result, fields) => {
	res.status(401)
	if(fields.length === 0) {
		res.send({
			message: 'Access Denied'
		})
	} else {
		res.send({
			message: 'Not permitted to modify fields',
			fields
		})
	}
}

const fetchOptions = (optionKeys, req, res, options) => {
	const tasks = []
	const accessOptions = {
		target: options.target,
		action: options.action
	}
	const setOption = (key) => (value) => {
		accessOptions[key] = value
	}

	for(const key of optionKeys) {
		if(typeof options[key] === 'function') {
			const promise = Promise
				.resolve(options[key](req, res, options))
				.then(setOption(key))
			tasks.push(promise)
		} else if(key === 'policySet') {
			accessOptions.policySet = options.policySet
		} else {
			accessOptions[key] = get(req, options[key])
		}
	}

	return Promise.all(tasks).then(() => accessOptions)
}

const deniedFields = (options, result) => {
	return result.omit.filter((path) => {
		const updated = get(options.resource, path)
		const previous = get(options.previousResource, path)
		// TODO: handle more complext structured data
		return updated !== previous
	})
}

// policySet can be an object or function.
// resource, previousResource, subject, and environment can be a path
// on the request object or a function.
// additionally accepts a format function for when there is an error.
exports.crud = (baseOptions) => {
	const optionKeys = [
		'policySet',
		'resource',
		'previousResource',
		'subject',
		'environment'
	]
	for(const key of optionKeys) {
		if(!baseOptions[key]) {
			throw new Error(key + ' must be specified')
		}
	}

	return (middlewareOptions) => {
		const options = Object.assign({ format }, baseOptions, middlewareOptions)
		if(!options.target) {
			throw new Error('Target must be specified')
		}
		if(!options.action) {
			throw new Error('Action must be specified')
		}
		return (req, res, next) => {
			fetchOptions(optionKeys, req, res, options).then((accessOptions) => {
				const result = strategies.crud(accessOptions.policySet, accessOptions)
				if(!result.authorize) {
					options.format(req, res, options, result, [])
				} else if(options.action === 'update') {
					const fields = deniedFields(options, result)
					if(fields.length > 0) {
						options.format(req, res, options, result, fields)
					} else {
						req.auth = Object.assign({ result }, accessOptions)
						// TODO: handle omitting fields from read calls.
						next()
					}
				}
			}, next)
		}
	}
}
