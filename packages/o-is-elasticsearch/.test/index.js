'use strict';

var _sourceMapSupport = require('source-map-support');

var _sourceMapSupport2 = _interopRequireDefault(_sourceMapSupport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_sourceMapSupport2.default.install();

var oIsElasticsearch = require('../index');
var oIs = require('o-is').extend({}, {
	elasticsearch: oIsElasticsearch
});

var assert = require('assert');

describe('o-is-elasticsearch', function () {

	it('converts arbitrary comparisons', function () {
		var query = oIs().equal('foo', 'bar').elasticsearch();
		console.log(query);
		assert.equal(query.bool.must[0].term.foo, 'bar');
	});

	it('converts lt and gt', function () {
		var query = oIs().gt('age', 10).lt('age', 20).elasticsearch();
		var rg1 = query.bool.must[0];
		var rg2 = query.bool.must[1];
	});

	it('converts conditions to es queries', function () {
		var query = oIs().if().equal('name', 'foobar').then().gt('age', 20).else().lt('age', 10).end().elasticsearch();
		var trueCond = query.bool.must[0].bool.should[0];
		var falseCond = query.bool.must[0].bool.should[1];
		console.log(JSON.stringify(query, null, 2));

		assert(trueCond.bool.must[0].term.name === 'foobar', 'the condition is preset');
		assert(trueCond.bool.must[1].range.age.gt === 20, 'the test when true');
		assert(falseCond.bool.must[0].range.age.lt === 10, 'the test when false');
	});
});