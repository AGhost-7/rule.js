'use strict';
// a not statement just inverts the next call. Since it doesn't make sense
// to have `if().not().end()`, I can just derive from the OIs prototype.

Object.defineProperty(exports, "__esModule", {
	value: true
});
var createNotClass = function createNotClass(oIsProto) {
	function Not(parent) {
		this.parent = parent;
	}

	Not.prototype = Object.create(null);
	Object.keys(oIsProto).forEach(function (key) {
		Not.prototype[key] = function () {
			var args = this.parent[key].apply(this.parent, arguments).tests[0];
			return this.parent._cons({
				type: 'not',
				args: args
			});
		};
	});
	return Not;
};

var assertNot = function assertNot(context, args, self) {
	return !self[args.args.type](context, args.args, self, false);
};

exports.createNotClass = createNotClass;
exports.assertNot = assertNot;