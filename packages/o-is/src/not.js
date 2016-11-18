'use strict'
// a not statement just inverts the next call. Since it doesn't make sense
// to have `if().not().end()`, I can just derive from the OIs prototype.
const createNotClass = (oIsProto) => {
	function Not(parent) {
		this.parent = parent
	}

	Not.prototype = Object.create(null)
	Object.keys(oIsProto).forEach((key) => {
		Not.prototype[key] = function() {
			const args = this.parent[key].apply(this.parent, arguments).tests[0]
			return this.parent._cons({
				type: 'not',
				args
			})
		}
	})
	return Not
}

const assertNot = (context, args, self) => {
	return !self[args.args.type](context, args.args, self, false)
}

export {createNotClass, assertNot}

