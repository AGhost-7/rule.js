'use strict'

import clone from 'lodash.clone'
import assign from 'lodash.assign'
import get from 'lodash.get'
import {createIfClass, assertIf} from './if'
import {createNotClass, assertNot} from'./not'
import {createOrClass, assertOr} from './or'

const testFn = (assertions, context, tests) => {
	for(var i = 0; i < tests.length; i++) {
		var test = tests[i]
		var res = assertions[test.type](context, test, assertions, false)
		if(res !== true) {
			return false
		}
	}
	return true
}

const testDetailed = (assertions, context, tests) => {
	var arr = []
	for(var i = 0; i < tests.length; i++) {
		var test = tests[i]
		var res = assertions[test.type](context, test, assertions, true)
		if(res !== true) {
			arr.push({
				context,
				test,
				result: res
			})
		}
	}
	return arr
}

const assert = (assertions, context, tests) => {
	for(var i = 0; i < tests.length; i++) {
		var test = tests[i]
		var res = assertions[test.type](context, test, assertions, false)
		if(res !== true) {
			throw new Error('Failed for type ' + test.type)
		}
	}
}

const assertions = {
	not(context, args, self) {
		return assertNot(context, args, self)
	},
	equal(context, args) {
		return args.value === get(context, args.key)
	},
	notEqual(context, args, self) {
		return !self.equal(context, args)
	},
	propsEqual(context, args) {
		return get(context, args.keys[0]) === get(context, args.keys[0])
	},
	undefined(context, args) {
		return get(context, args.key) === undefined
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
	},
	nil(context, args) {
		const val = get(context, args.key)
		return val === null || val === undefined
	},
	number(context, args) {
		const val = get(context, args.key)
		return !isNaN(val)
	},
	empty(context, args) {
		const v = get(context, args.key)
		if(v === null) {
			return true
		}
		if(v === undefined) {
			return true
		}
		if(typeof v === 'string') {
			return v.trim().length === 0
		}
		if(Array.isArray(v)) {
			return v.length === 0
		}
		return false
	},
	exist(context, args) {
		return !this.nil(context, args)
	},
	string(context, args) {
		return typeof get(context, args.key) === 'string'
	}
}

assertions.if = assertIf
assertions.or = assertOr

// below are the sort-of-but-not-really "builders".

const memberTestMethods = {
	_decomposeEqualObject(obj) {
		var arr = []
		for(var k in obj) {
			arr.push({
				key: this._key(k),
				value: obj[k],
				type: 'equal'
			})
		}
		return arr
	},
	equal(arg1, arg2) {
		if(typeof arg1 !== 'string') {
			return this._cons(this._decomposeEqualObject(arg1))
		}
		return this._cons({
			key: this._key(arg1),
			value: arg2,
			type: 'equal'
		})
	},
	propsEqual(...keys) {
		return this._cons({
			keys: keys.map((k) => this._key(k)),
			type: 'propsEqual'
		})
	}
}

const keyOnlyTestMethods = [
	'undefined',
	'null',
	'true',
	'false',
	'nil',
	'empty',
	'exist',
	'number'
]

const kvOnlyTestMethods = [
	'lt',
	'gt'
]

keyOnlyTestMethods.forEach((name) => {
	memberTestMethods[name] = function(key) {
		return this._cons({
			key: this._key(key),
			type: name
		})
	}
})

kvOnlyTestMethods.forEach((name) => {
	memberTestMethods[name] = function(key, value) {
		return this._cons({
			key: this._key(key),
			value,
			type: name
		})
	}
})

const members = {
	_cons(val) {
		return this._create(this.tests.concat(val), this._boundKeys)
	},
	cons(val) {
		if(this._isInstance(val)) {
			return this._create(this.tests.concat(val.tests))
		}
		return this._cons(val)
	},
	_kCons(type, key) {
		return this._cons({ type, key })
	},
	// Used to override...
	_key(k) {
		return this._boundKeys.concat(k).join('.')
	},
	if() {
		return new this._If(this, [], this._boundKeys)
	},
	not() {
		return new this._Not(this)
	},
	or() {
		return new this._Or(this, [], this._boundKeys)
	},
	bind(key) {
		return this._create(this.tests, this._boundKeys.concat(key))
	},
	unbind() {
		return this._create(this.tests, this._boundKeys.slice(1))
	},
	unbindAll() {
		return this._create(this.tests, [])
	},
	toJSON() {
		return this.tests
	},
	serialize() {
		return this.tests
	},
	print(opt) {
		/* eslint no-console: "off" */
		console.log((opt ? opt : '') + JSON.stringify(this.tests, null, 2))
		return this
	},
	test(obj) {
		return testFn(this.assertions, obj, this.tests)
	},
	testDetailed(obj) {
		return testDetailed(this.assertions, obj, this.tests)
	},
	fails(obj) {
		return !this.test(obj)
	},
	assert(obj) {
		assert(this.assertions, obj, this.tests)
	}
}

assign(members, memberTestMethods)

const createClass = (assertions, members) => {
	function OIs(tests, boundKeys) {
		this._boundKeys = boundKeys
		this.tests = tests
	}
	OIs.prototype = Object.create(null)
	assign(OIs.prototype, members)
	OIs.prototype._create = function (tests, boundKeys) {
		return new OIs(tests, boundKeys)
	}
	OIs.prototype._isInstance = (obj) => obj instanceof OIs
	OIs.prototype.assertions = assertions

	var Or = createOrClass(OIs.prototype)
	OIs.prototype._Or = Or

	const Not = createNotClass(OIs.prototype)
	OIs.prototype._Not = Not
	Or.prototype._Not = Not

	const If = createIfClass(OIs.prototype)
	OIs.prototype._If = If
	Or.prototype._If = If
	Not.prototype._If = If

	return OIs
}

const ObjectIs = createClass(assertions, members)

const mod = (items) => {
	return new ObjectIs(items || [], [])
}

const extend = (a, m) => {
	const newAsserts = assign(clone(assertions), a)
	const newMembers = assign(clone(members), m)
	return createClass(newAsserts, newMembers)
}

mod.ObjectIs = ObjectIs
mod.test = testFn
mod.testDetailed = testDetailed
mod.assertions = assertions
mod.get = get
mod.extend = extend

export default mod

