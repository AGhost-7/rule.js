"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var conversions = {
	_expand: function _expand(ts) {
		var _this = this;

		return ts.map(function (t) {
			return _this[t.type](t);
		});
	},
	equal: function equal(obj) {
		var t = { term: {} };
		t.term[obj.key] = obj.value;
		return t;
	},
	lt: function lt(obj) {
		var r = { range: {} };
		r.range[obj.key] = {
			lt: obj.value
		};
		return r;
	},
	gt: function gt(obj) {
		var r = { range: {} };
		r.range[obj.key] = {
			gt: obj.value
		};
		return r;
	},
	if: function _if(obj) {
		return {
			bool: {
				should: [{
					bool: {
						must: this._expand(obj.conds).concat(this._expand(obj.ifTrue))
					}
				}, {
					bool: {
						must: this._expand(obj.ifFalse)
					}
				}]
			}
		};
	}
};

var convert = function convert() {
	return {
		bool: {
			must: conversions._expand(this.tests)
		}
	};
};

exports.default = convert;