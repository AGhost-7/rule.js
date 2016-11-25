
const conversions = {
	_expand(ts) {
		return ts.map((t) => {
			return this[t.type](t)
		})
	},
	equal(obj) {
		const t = { term: {} }
		t.term[obj.key] = obj.value
		return t
	},
	lt(obj) {
		const r = { range: {} }
		r.range[obj.key] = {
			lt: obj.value
		}
		return r
	},
	gt(obj) {
		const r = { range: {} }
		r.range[obj.key] = {
			gt: obj.value
		}
		return r
	},
	if(obj) {
		return {
			bool: {
				should: [
					{
						bool: {
							must: this._expand(obj.conds).concat(this._expand(obj.ifTrue))
						},
					},
					{
						bool: {
							must: this._expand(obj.ifFalse)
						}
					}
				]
			}
		}
	}
}

const convert = function() {
	return {
		bool: {
			must: conversions._expand(this.tests)
		}
	}
}

module.exports = convert
