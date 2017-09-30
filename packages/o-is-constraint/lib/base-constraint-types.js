'use strict'

const get = require('lodash.get')

const lengthComparer = (type, test) => (context, args) => {
	const errors = []
	const compareTo = args[0]
	for(const key of args[1]) {
		const value = get(context, key)
		if((typeof value === 'string' || Array.isArray(value)) &&
				!test(compareTo, value.length)) {
			errors.push({
				type: type,
				value: value,
				key: key
			})
		}
	}
	return errors
}

module.exports = {
	mandatory(context, args) {
		const errors = []
		for(const key of args[0]) {
			const value = get(context, key)
			if(value === null ||
					value === undefined ||
					(typeof value === 'string' && value.trim().length === 0)) {
				errors.push({
					type: 'mandatory',
					value: value,
					key: key
				})
			}
		}
		return errors
	},
	pattern(context, args) {
		const reg = args[0] instanceof RegExp ? args[0] : new RegExp(args[0])
		const errors = []
		for(const key of args[1]) {
			const value = get(context, key)
			if(!reg.test(value)) {
				errors.push({
					type: 'pattern',
					value: value,
					key: key
				})
			}
		}
		return errors
	},
	const(context, args) {
		const errors = []
		for(const key of args[1]) {
			const value = get(context, key)
			if(value !== args[0]) {
				errors.push({
					type: 'const',
					value: value,
					key: key
				})
			}
		}
		return errors
	},
	minLength: lengthComparer('minLength', (compareTo, length) => length >= compareTo),
	maxLength: lengthComparer('maxLength', (compareTo, length) => length <= compareTo)
}

