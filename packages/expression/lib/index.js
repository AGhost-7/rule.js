'use strict'

const Rule = require('@rule.js/core')
const peg = require('pegjs')

const grammar = require('./grammar')
const parser = peg.generate(grammar)

const identity = a => a

module.exports = function(RuleConstructor = Rule, toPath = identity) {
  return function(condition) {
    if (typeof condition !== 'string') {
      throw new Error('Invalid argument ' + condition)
    }
    if (condition.trim() === '') return RuleConstructor()
    let parsed = parser.parse(condition.trim(), {
      startRule: 'Start',
      toPath
    })
    if (!Array.isArray(parsed)) parsed = [parsed]
    return RuleConstructor(parsed)
  }
}
