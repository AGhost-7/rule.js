'use strict'

const compiler = require('./compiler')
const lexer = require('./lexer')

module.exports = (source) => {
	const tokens = lexer.parse(source)
	return compiler.compile(tokens)
}
