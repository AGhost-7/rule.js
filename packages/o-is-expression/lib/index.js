'use strict'

const oIs = require('o-is')
const peg = require('pegjs')
const fs = require('fs')
const path = require('path')

const grammar = fs.readFileSync(path.join(__dirname, './grammar.pegjs'), 'utf8')
const parser = peg.generate(grammar)

module.exports = function(oIsConstructor = oIs) {
  return function(condition) {
    let parsed = parser.parse(condition.trim(), {
      startRule: 'Start'
    })
    if (!Array.isArray(parsed)) parsed = [parsed]
    return oIsConstructor(parsed)
  }
}
