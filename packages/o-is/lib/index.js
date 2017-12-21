'use strict'

const {assertions, testRunner, assertRunner} = require('./assertions')
const clone = require('lodash.clone')
const assign = require('lodash.assign')
const get = require('lodash.get')
const {createIfClass} = require('./if')
const {createNotClass} = require('./not')
const {createOrClass} = require('./or')

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
	},
	any(key, values) {
		return this._cons({
			type: 'any',
			key: key,
			values: values
		})
	}
}

const keyOnlyTestMethods = [
	'null',
	'true',
	'false'
]

const kvOnlyTestMethods = [
	'lt',
	'gt',
	'notEqual'
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
	concat(val) {
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
		return this._create(this.tests, [], [])
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
		return testRunner(this.assertions, obj, this.tests)
	},
	fails(obj) {
		return !this.test(obj)
	},
	assert(obj) {
		assertRunner(this.assertions, obj, this.tests)
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
	const Class = createClass(newAsserts, newMembers)
	return (items) => {
		return new Class(items || [], [])
	}
}

mod.ObjectIs = ObjectIs
mod.test = testRunner
mod.assertions = assertions
mod.members = members
mod.get = get
mod.extend = extend
mod.createClass = createClass

module.exports = mod

