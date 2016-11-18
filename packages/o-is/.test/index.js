'use strict';

var _sourceMapSupport = require('source-map-support');

var _sourceMapSupport2 = _interopRequireDefault(_sourceMapSupport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_sourceMapSupport2.default.install();
var oIs = require('../index');
var assert = require('assert');

describe('o-is', function () {
	describe('assertions', function () {
		var obj = {
			name: 'jonathan',
			age: 23145,
			fullName: {
				first: 'jonathan',
				last: 'boudreau'
			}
		};

		var tests = [{
			type: 'exist',
			key: 'name'
		}, {
			type: 'equal',
			key: 'fullName.first',
			value: 'jonathan'
		}, {
			type: 'propsEqual',
			keys: ['name', 'fullName.first']
		}, {
			type: 'string',
			key: 'name'
		}];

		it('should pass basic assertions', function () {
			oIs.test(oIs.assertions, obj, tests);
		});

		it('should return the type of failure', function () {
			var res = oIs.test(oIs.assertions, { a: 'BOOM' }, [{
				type: 'number',
				key: 'a'
			}]);

			assert.ok(!res);
		});

		// This will be handy for client-side generation of error messages.
		it('should gimme more detailed errors', function () {
			var res = oIs.testDetailed(oIs.assertions, obj, [{
				type: 'equal',
				key: 'name',
				value: 'jonathan'
			}, {
				type: 'number',
				key: 'name'
			}]);

			assert.equal(res[0].test.key, 'name');
			assert.equal(res[0].test.type, 'number');
		});
	});

	describe('builder basics', function () {
		it('should build', function () {
			var res = oIs().equal('a', 1).test({ a: 1 });
			assert.ok(res);
		});
		it('should assert', function () {
			assert.throws(function () {
				oIs().equal('a', 2).assert({ a: 1 });
			});
		});
		it('should chain', function () {
			oIs().equal('a', 1).lt('a', 10).gt('a', 0).exist('a').number('a').propsEqual('a', 'foo.bar').equal('arr[0]', 1).assert({
				a: 1,
				foo: {
					bar: 1
				},
				arr: [1]
			});
		});
		it('equal object', function () {
			oIs().equal({
				'name.first': 'Jonathan',
				age: 23
			}).assert({
				name: {
					first: 'Jonathan'
				},
				age: 23
			});
		});
	});

	describe('conditionals', function () {
		it('should handle simple cases', function () {
			var o = oIs().if().true('validate').then().exist('name').end();
			assert(o.test({ validate: false, foo: 'bar' }), 'dont run validation');
			assert(o.test({ validate: true, name: 'jo' }), 'run validation');
			assert(!o.test({ validate: true, foo: 'bar' }), 'run validation (failing)');
		});

		it('else statements', function () {
			var o = oIs().if().gt('income', 100).then().gt('contributions', 10).else().gt('contributions', 5).end();
			assert(o.test({ income: 101, contributions: 20 }));
			assert(o.test({ income: 50, contributions: 6 }));
			assert(!o.test({ income: 101, contributions: 5 }));
			assert(!o.test({ income: 50, contributions: 3 }));
		});
		it('should handle compound conditions', function () {
			var o = oIs().if().gt('a', 10).lt('a', 20).then().equal('a', 15).end().exist('a');
			assert(o.test({ a: 15 }));
			assert(!o.test({ a: 16 }));
			assert(o.test({ a: 10 }));
		});
		it('should handle nested conditions', function () {
			// idk...
			var o = oIs().if().true('validate').if().gt('age', 60).then().true('senior').end().if().lt('age', '16').then().true('junior').end().then().lt('money', 20).end();
			assert(o.test({ age: 70, senior: true, money: 15 }));
		});
	});

	describe('binding', function () {
		it('binds for simple cases', function () {
			var res = oIs().bind('name').equal('first', 'Jonathan').equal('last', 'Boudreau').test({
				name: {
					first: 'Jonathan',
					last: 'Boudreau'
				}
			});
			assert(res);
		});
		it('unbinds', function () {
			var res = oIs().bind('name').equal('first', 'Jonathan').unbind().equal('name.last', 'Boudreau').test({
				name: {
					first: 'Jonathan',
					last: 'Boudreau'
				}
			});
			assert(res);
		});
		it('binds inside conditions', function () {
			var o = oIs().if().equal('type', 'human').then().bind('name').equal({
				first: 'Jonathan',
				last: 'Boudreau'
			}).end();
			assert(o.test({ type: 'bear' }));
			assert(o.test({
				type: 'human',
				name: {
					first: 'Jonathan',
					last: 'Boudreau'
				}
			}));
			assert(!o.test({ type: 'human' }));
		});
		it('binds multiple times', function () {
			var obj = {
				a: { b: { c: 1 } }
			};
			oIs().bind('a').unbind().bind('a').bind('b').equal('c', 1).assert(obj);
		});
	});
	describe('not', function () {
		it('inverts equals', function () {
			oIs().not().equal('a', 1).assert({ a: 2 });
		});
		it('inverts only the first statement', function () {
			oIs().not().equal('a', 1).equal('b', 2).assert({
				a: 2,
				b: 2
			});
		});
		it('inverts in ifs', function () {
			oIs().if().not().equal('a', 1).then().equal('b', 1).else().equal('b', 2).end().assert({
				a: 2, b: 1
			});
		});
	});

	describe('or', function () {
		it('eithers...', function () {
			var o = oIs().or().equal('a', 1).equal('a', 2).end();
			o.assert({ a: 1 });
			o.assert({ a: 2 });
			assert(!o.test({ a: 3 }));
		});
		it('allows multiple strict conditions', function () {
			var o = oIs().equal('a', 1).or().equal('b', 1).equal('b', 2).end();
			o.assert({ a: 1, b: 1 });
			o.assert({ a: 1, b: 2 });
			assert(!o.test({ a: 2, b: 1 }));
		});
		it('functions inside if blocks', function () {
			var o = oIs().if().or().equal({ a: 1, b: 2 }).end().then().equal('c', 3).else().equal('c', 4).end();
			o.assert({ b: 2, c: 3 });
			o.assert({ a: 1, c: 3 });
			o.assert({ c: 4 });
		});
		it('functions inside then block', function () {
			var o = oIs().if().equal('a', 1).then().or().equal('b', 2).equal('b', 3).end().end();
			o.assert({ a: 1, b: 2 });
			o.assert({ a: 2, b: 3 });
		});
		it('functions inside else block', function () {
			var o = oIs().if().equal('a', 1).then().equal('b', 2).else().or().equal('b', 3).equal('b', 4).end().end();
			o.assert({ b: 3 });
			o.assert({ b: 4 });
		});
		it('binds', function () {
			var o = oIs().or().bind('name').equal('first', 'jonathan').equal('first', 'Jonathan').end();
			o.assert({ name: { first: 'jonathan' } });
			o.assert({ name: { first: 'Jonathan' } });
		});
	});

	describe('extensions', function () {
		it('should allow extensions', function () {
			var oIs2 = oIs.extend({}, {});
			oIs2().equal('a', 1).assert({ a: 1 });
		});
		it('should allow adding new methods', function () {
			var oIs2 = oIs.extend({}, {
				foo: function foo() {
					return 'bar';
				}
			});
			assert.equal(oIs2().equal('foo', 'baz').foo(), 'bar');
		});
	});
});