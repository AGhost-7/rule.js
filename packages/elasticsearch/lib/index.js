'use strict'

const objOf = (key, val) => {
  const obj = {}
  obj[key] = val
  return obj
}

const term = (key, val) => {
  return {
    term: objOf(key, val)
  }
}

const conversions = {
  _expand(toEs, ts) {
    return ts.map(t => {
      return this[t.type](toEs, t)
    })
  },
  any(toEs, obj) {
    return {
      terms: objOf(toEs(obj.key), obj.values)
    }
  },
  lt(toEs, obj) {
    const r = { range: {} }
    r.range[toEs(obj.key)] = {
      lt: obj.value
    }
    return r
  },
  gt(toEs, obj) {
    const r = { range: {} }
    r.range[toEs(obj.key)] = {
      gt: obj.value
    }
    return r
  },
  pass(toEs, obj) {
    return {
      match_all: {}
    }
  },
  fail(toEs, obj) {
    return {
      match_none: {}
    }
  },
  exists(toEs, obj) {
    return {
      exists: objOf('field', obj.key)
    }
  },
  not(toEs, obj) {
    return {
      bool: {
        must_not: conversions[obj.args.type](toEs, obj.args)
      }
    }
  },
  or(toEs, obj) {
    return {
      bool: {
        should: this._expand(toEs, obj.tests)
      }
    }
  },
  and(toEs, obj) {
    return {
      bool: {
        must: this._expand(toEs, obj.tests)
      }
    }
  },
  true(toEs, obj) {
    return term(toEs(obj.key), true)
  },
  false(toEs, obj) {
    return term(toEs(obj.key), false)
  },
  // Since there are no undefined fields I just check for nulls.
  // The storing logic should then set the fields to the correct
  // values.
  nil(toEs, obj) {
    return term(toEs(obj.key), null)
  },
  undefined(toEs, obj) {
    return term(toEs(obj.key), null)
  },
  null(toEs, obj) {
    return {
      bool: {
        must_not: [
          {
            exists: objOf('field', toEs(obj.key))
          }
        ]
      }
    }
  },
  empty(toEs, obj) {
    return {
      bool: {
        must_not: [
          {
            exists: objOf('field', toEs(obj.key))
          }
        ]
      }
    }
  },
  // This is the only possible way to handle this in elasticsearch.
  // Normally you're not going to need this when running elasticsearch
  // queries.
  propsEqual(toEs, obj) {
    return {
      script: {
        script: {
          lang: 'painless',
          inline: 'doc[params.val1].value == doc[params.val2].value',
          params: {
            val1: toEs(obj.keys[0]),
            val2: toEs(obj.keys[1])
          }
        }
      }
    }
  },
  equal(toEs, obj) {
    return term(toEs(obj.key), obj.value)
  },
  notEqual(toEs, obj) {
    return {
      bool: {
        must_not: [term(toEs(obj.key), obj.value)]
      }
    }
  },
  // TODO: I think I need to change the original assert to match this.
  exist(toEs, obj) {
    return {
      exists: objOf('field', toEs(obj.key))
    }
  },
  contains(toEs, obj) {
    return term(toEs(obj.key), obj.value)
  }
}

const identity = key => key

module.exports = toEs => {
  if (!toEs) toEs = identity
  return function() {
    return {
      bool: {
        must: conversions._expand(toEs, this.tests)
      }
    }
  }
}
