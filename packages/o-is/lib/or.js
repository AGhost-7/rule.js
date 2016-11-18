'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.assertOr = exports.createOrClass = undefined;

var _lodash = require('lodash.assign');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createOrClass = function createOrClass(oIsProto) {
	function Or(parent, tests, boundKeys) {
		this.parent = parent;
		this._boundKeys = boundKeys;
		this.tests = tests;
	}
	Or.prototype = (0, _lodash2.default)(Object.create(null), oIsProto);
	Or.prototype._create = function (tests, boundKeys) {
		return new Or(this.parent, tests, boundKeys);
	};
	Or.prototype.end = function () {
		return this.parent._cons({
			type: 'or',
			tests: this.tests
		});
	};
	return Or;
};

var assertOr = function assertOr(context, args, self) {
	for (var i = 0; i < args.tests.length; i++) {
		var test = args.tests[i];
		if (self[test.type](context, test, self)) {
			return true;
		}
	}
	return false;
};

exports.createOrClass = createOrClass;
exports.assertOr = assertOr;