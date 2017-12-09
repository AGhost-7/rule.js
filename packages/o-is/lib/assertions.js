'use strict'

const get = require('lodash.get')

exports.testRunner = (assertions, context, tests) => {
	for(const test of tests) {
		var res = assertions[test.type](context, test, assertions)
		if(res !== true) {
			return false
		}
	}
	return true
}

exports.assertRunner = (assertions, context, tests) => {
	const result = exports.testRunner(assertions, context, tests)
	if(!result) {
		throw new Error('Assertion failed')
	}
}

const ifBase = function(context, tests, self) {
	for(const test of tests) {
		if(!self[test.type](context, test, self)) {
			return false
		}
	}
	return true
}

exports.assertions = {
	not(context, args, self) {
		return !self[args.args.type](context, args.args, self)
	},
	and(context, args, self) {
		for(const test of args.tests) {
			if(!self[test.type](context, test, self)) {
				return false
			}
		}
		return true
	},
	or(context, args, self) {
		for(const test of args.tests) {
			if(self[test.type](context, test, self)) {
				return true
			}
		}
		return false
	},
	if(context, args, self) {
		if(!ifBase(context, args.conds, self)) {
			if(args.ifFalse.length > 0) {
				return ifBase(context, args.ifFalse, self)
			} else {
				return true
			}
		} else {
			return ifBase(context, args.ifTrue, self)
		}
	},
	fail() {
		return false
	},
	pass() {
		return true
	},
	equal(context, args) {
		return args.value === get(context, args.key)
	},
	notEqual(context, args, self) {
		return !self.equal(context, args)
	},
	propsEqual(context, args) {
		return get(context, args.keys[0]) === get(context, args.keys[1])
	},
	null(context, args) {
		return get(context, args.key) === null
	},
	true(context, args) {
		return get(context, args.key) === true
	},
	false(context, args) {
		return get(context, args.key) === false
	},
	gt(context, args) {
		return get(context, args.key) > args.value
	},
	lt(context, args) {
		return get(context, args.key) < args.value
	}
}
