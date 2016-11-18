'use strict'

import assign from 'lodash.assign'

const createOrClass = (oIsProto) => {
	function Or(parent, tests, boundKeys) {
		this.parent = parent
		this._boundKeys = boundKeys
		this.tests = tests
	}
	Or.prototype = assign(Object.create(null), oIsProto)
	Or.prototype._create = function(tests, boundKeys) {
		return new Or(this.parent, tests, boundKeys)
	}
	Or.prototype.end = function() {
		return this.parent._cons({
			type: 'or',
			tests: this.tests
		})
	}
	return Or
}

const assertOr = (context, args, self) => {
	for(var i = 0; i < args.tests.length; i++) {
		var test = args.tests[i]
		if(self[test.type](context, test, self)) {
			return true
		}
	}
	return false
}

export {createOrClass, assertOr}

