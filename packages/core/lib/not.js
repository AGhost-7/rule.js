'use strict'

// a not statement just inverts the next call. Since it doesn't make sense
// to have `if().not().end()`, I can just derive from the Rule prototype.
const createNotClass = ruleProto => {
  function Not(parent) {
    this.parent = parent
  }

  Not.prototype = Object.create(null)
  Object.keys(ruleProto).forEach(key => {
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

module.exports = { createNotClass }
