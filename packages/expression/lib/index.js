'use strict'

const Rule = require('@rule.js/core')
const peg = require('pegjs')
const fs = require('fs')
const path = require('path')

const grammar = fs.readFileSync(path.join(__dirname, './grammar.pegjs'), 'utf8')
const parser = peg.generate(grammar)

module.exports = function(RuleConstructor = Rule) {
  return function(condition) {
    let parsed = parser.parse(condition.trim(), {
      startRule: 'Start'
    })
    if (!Array.isArray(parsed)) parsed = [parsed]
    return RuleConstructor(parsed)
  }
}
