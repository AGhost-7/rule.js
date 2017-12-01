'use strict'

const oIs = require('o-is')

const OIsClass = oIs.createClass(oIs.assertions, oIs.members)

OIsClass.prototype.end = function() {
	const copy = this._policy._copy()
	copy._condition = this.tests
	console.log('copy:', copy)
	return copy
}

OIsClass.prototype._create = function(tests, boundKeys) {
	const o = new OIsClass(tests, boundKeys)
	o._policy = this._policy
	return o
}

module.exports = (items) => new OIsClass(items || [], [])
