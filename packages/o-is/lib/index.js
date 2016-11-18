'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _lodash = require('lodash.clone');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.assign');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.get');

var _lodash6 = _interopRequireDefault(_lodash5);

var _if2 = require('./if');

var _not = require('./not');

var _or = require('./or');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var testFn = function testFn(assertions, context, tests) {
	for (var i = 0; i < tests.length; i++) {
		var test = tests[i];
		var res = assertions[test.type](context, test, assertions, false);
		if (res !== true) {
			return false;
		}
	}
	return true;
};

var _testDetailed = function _testDetailed(assertions, context, tests) {
	var arr = [];
	for (var i = 0; i < tests.length; i++) {
		var test = tests[i];
		var res = assertions[test.type](context, test, assertions, true);
		if (res !== true) {
			arr.push({
				context: context,
				test: test,
				result: res
			});
		}
	}
	return arr;
};

var _assert = function _assert(assertions, context, tests) {
	for (var i = 0; i < tests.length; i++) {
		var test = tests[i];
		var res = assertions[test.type](context, test, assertions, false);
		if (res !== true) {
			throw new Error('Failed for type ' + test.type);
		}
	}
};

var assertions = {
	not: function not(context, args, self) {
		return (0, _not.assertNot)(context, args, self);
	},
	equal: function equal(context, args) {
		return args.value === (0, _lodash6.default)(context, args.key);
	},
	notEqual: function notEqual(context, args, self) {
		return !self.equal(context, args);
	},
	propsEqual: function propsEqual(context, args) {
		return (0, _lodash6.default)(context, args.keys[0]) === (0, _lodash6.default)(context, args.keys[0]);
	},
	undefined: function (_undefined) {
		function undefined(_x, _x2) {
			return _undefined.apply(this, arguments);
		}

		undefined.toString = function () {
			return _undefined.toString();
		};

		return undefined;
	}(function (context, args) {
		return (0, _lodash6.default)(context, args.key) === undefined;
	}),
	null: function _null(context, args) {
		return (0, _lodash6.default)(context, args.key) === null;
	},
	true: function _true(context, args) {
		return (0, _lodash6.default)(context, args.key) === true;
	},
	false: function _false(context, args) {
		return (0, _lodash6.default)(context, args.key) === false;
	},
	gt: function gt(context, args) {
		return (0, _lodash6.default)(context, args.key) > args.value;
	},
	lt: function lt(context, args) {
		return (0, _lodash6.default)(context, args.key) < args.value;
	},
	nil: function nil(context, args) {
		var val = (0, _lodash6.default)(context, args.key);
		return val === null || val === undefined;
	},
	number: function number(context, args) {
		var val = (0, _lodash6.default)(context, args.key);
		return !isNaN(val);
	},
	empty: function empty(context, args) {
		var v = (0, _lodash6.default)(context, args.key);
		if (v === null) {
			return true;
		}
		if (v === undefined) {
			return true;
		}
		if (typeof v === 'string') {
			return v.trim().length === 0;
		}
		if (Array.isArray(v)) {
			return v.length === 0;
		}
		return false;
	},
	exist: function exist(context, args) {
		return !this.nil(context, args);
	},
	string: function string(context, args) {
		return typeof (0, _lodash6.default)(context, args.key) === 'string';
	}
};

assertions.if = _if2.assertIf;
assertions.or = _or.assertOr;

// below are the sort-of-but-not-really "builders".

var memberTestMethods = {
	_decomposeEqualObject: function _decomposeEqualObject(obj) {
		var arr = [];
		for (var k in obj) {
			arr.push({
				key: this._key(k),
				value: obj[k],
				type: 'equal'
			});
		}
		return arr;
	},
	equal: function equal(arg1, arg2) {
		if (typeof arg1 !== 'string') {
			return this._cons(this._decomposeEqualObject(arg1));
		}
		return this._cons({
			key: this._key(arg1),
			value: arg2,
			type: 'equal'
		});
	},
	propsEqual: function propsEqual() {
		var _this = this;

		for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
			keys[_key] = arguments[_key];
		}

		return this._cons({
			keys: keys.map(function (k) {
				return _this._key(k);
			}),
			type: 'propsEqual'
		});
	}
};

var keyOnlyTestMethods = ['undefined', 'null', 'true', 'false', 'nil', 'empty', 'exist', 'number'];

var kvOnlyTestMethods = ['lt', 'gt'];

keyOnlyTestMethods.forEach(function (name) {
	memberTestMethods[name] = function (key) {
		return this._cons({
			key: this._key(key),
			type: name
		});
	};
});

kvOnlyTestMethods.forEach(function (name) {
	memberTestMethods[name] = function (key, value) {
		return this._cons({
			key: this._key(key),
			value: value,
			type: name
		});
	};
});

var members = {
	_cons: function _cons(val) {
		return this._create(this.tests.concat(val), this._boundKeys);
	},
	cons: function cons(val) {
		if (this._isInstance(val)) {
			return this._create(this.tests.concat(val.tests));
		}
		return this._cons(val);
	},
	_kCons: function _kCons(type, key) {
		return this._cons({ type: type, key: key });
	},

	// Used to override...
	_key: function _key(k) {
		return this._boundKeys.concat(k).join('.');
	},
	if: function _if() {
		return new this._If(this, [], this._boundKeys);
	},
	not: function not() {
		return new this._Not(this);
	},
	or: function or() {
		return new this._Or(this, [], this._boundKeys);
	},
	bind: function bind(key) {
		return this._create(this.tests, this._boundKeys.concat(key));
	},
	unbind: function unbind() {
		return this._create(this.tests, this._boundKeys.slice(1));
	},
	unbindAll: function unbindAll() {
		return this._create(this.tests, []);
	},
	toJSON: function toJSON() {
		return this.tests;
	},
	serialize: function serialize() {
		return this.tests;
	},
	print: function print(opt) {
		/* eslint no-console: "off" */
		console.log((opt ? opt : '') + JSON.stringify(this.tests, null, 2));
		return this;
	},
	test: function test(obj) {
		return testFn(this.assertions, obj, this.tests);
	},
	testDetailed: function testDetailed(obj) {
		return _testDetailed(this.assertions, obj, this.tests);
	},
	fails: function fails(obj) {
		return !this.test(obj);
	},
	assert: function assert(obj) {
		_assert(this.assertions, obj, this.tests);
	}
};

(0, _lodash4.default)(members, memberTestMethods);

var createClass = function createClass(assertions, members) {
	function OIs(tests, boundKeys) {
		this._boundKeys = boundKeys;
		this.tests = tests;
	}
	OIs.prototype = Object.create(null);
	(0, _lodash4.default)(OIs.prototype, members);
	OIs.prototype._create = function (tests, boundKeys) {
		return new OIs(tests, boundKeys);
	};
	OIs.prototype._isInstance = function (obj) {
		return obj instanceof OIs;
	};
	OIs.prototype.assertions = assertions;

	var Or = (0, _or.createOrClass)(OIs.prototype);
	OIs.prototype._Or = Or;

	var Not = (0, _not.createNotClass)(OIs.prototype);
	OIs.prototype._Not = Not;
	Or.prototype._Not = Not;

	var If = (0, _if2.createIfClass)(OIs.prototype);
	OIs.prototype._If = If;
	Or.prototype._If = If;
	Not.prototype._If = If;

	return OIs;
};

var ObjectIs = createClass(assertions, members);

var mod = function mod(items) {
	return new ObjectIs(items || [], []);
};

var extend = function extend(a, m) {
	var newAsserts = (0, _lodash4.default)((0, _lodash2.default)(assertions), a);
	var newMembers = (0, _lodash4.default)((0, _lodash2.default)(members), m);
	return createClass(newAsserts, newMembers);
};

mod.ObjectIs = ObjectIs;
mod.test = testFn;
mod.testDetailed = _testDetailed;
mod.assertions = assertions;
mod.get = _lodash6.default;
mod.extend = extend;

exports.default = mod;