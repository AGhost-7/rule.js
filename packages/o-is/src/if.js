'use strict'

import assign from 'lodash.assign'

const createIfClass = (oIsProto) => {

	function Else(parent, conds, ifTests, tests, boundKeys) {
		this.parent = parent
		this.conds = conds
		this.ifTests = ifTests
		this.tests = tests
		this._boundKeys = boundKeys
	}

	Else.prototype = assign(Object.create(null), oIsProto)

	Else.prototype._create = function(tests, boundKeys) {
		return new Else(this.parent, this.conds, this.ifTests, tests, boundKeys)
	}

	Else.prototype.end = function() {
		return this.parent._cons({
			type: 'if',
			conds: this.conds,
			ifTrue: this.ifTests,
			ifFalse: this.tests
		})
	}

	const Then = function(parent, conds, tests, boundKeys) {
		this.parent = parent
		this.conds = conds
		this.tests = tests
		this._boundKeys = boundKeys
	}

	Then.prototype = assign(Object.create(null), oIsProto)

	Then.prototype.end = function() {
		return this.parent._cons({
			type: 'if',
			conds: this.conds,
			ifTrue: this.tests,
			ifFalse: []
		})
	}

	Then.prototype._create = function(tests, boundKeys) {
		return new Then(this.parent, this.conds, tests, boundKeys)
	}

	Then.prototype.else = function() {
		return new Else(this.parent, this.conds, this.tests, [], this._boundKeys)
	}
	const If = function(parent, tests, boundKeys) {
		this.parent = parent
		this.tests = tests
		this._boundKeys = boundKeys
	}

	If.prototype = assign(Object.create(null), oIsProto)
	If.prototype.then = function() {
		return new this._Then(this.parent, this.tests, [], this._boundKeys)
	}
	If.prototype._create = function(tests, boundKeys) {
		return new this._If(this.parent, tests, boundKeys)
	}

	If.prototype._If = If
	If.prototype._Then = Then
	If.prototype._Else = Else
	Then.prototype._If = If
	Else.prototype._If = If

	return If
}

// this will evaluate everything and aggregate the result instead of returning
// as soon as one of the tests fail.
const ifAsContinual = (context, tests, self) => {
	var arr = []
	for(var i = 0; i < tests.length; i++) {
		var test = tests[i]
		var res = self[test.type](context, test, self, true)
		if(res !== true) {
			arr.push({
				context,
				test,
				result: res
			})
		}
	}
	return arr.length === 0 ? true : arr
}

const ifQuick = (context, tests, self) => {
	for(var i = 0; i < tests.length; i++) {
		var test = tests[i]
		if(!self[test.type](context, test, self, false)) {
			return false
		}
	}
	return true
}

const assertIf = (context, args, self, shouldContinue) => {
	if(!ifQuick(context, args.conds, self)) {
		if(args.ifFalse.length > 0) {
			return shouldContinue ?
				ifAsContinual(context, args.ifFalse, self) :
				ifQuick(context, args.ifFalse, self)
		}
		return true
	}
	return shouldContinue ?
		ifAsContinual(context, args.ifTrue, self) :
		ifQuick(context, args.ifTrue, self)
}

export {assertIf, createIfClass}

