'use strict'

const assert = require('assert')
const lexer = require('../lib/lexer')

const assertTokens = (shouldEqual, tokens) => {
	for(let i = 0; i < shouldEqual.length; i++) {
		assert.equal(shouldEqual[i], tokens[i].token)
	}
}

describe('lexer', () => {

	it('lexes values', () => {
		assert.equal(lexer.parse('hello world').length, 2)
	})

	it('lexes quoted values', () => {
		assert(lexer.findToken('"some spaces"'))
		assert.equal(lexer.parse('"some spaces"').length, 1)
		assert.equal(lexer.parse('"woops \\""').length, 1)
		assert.equal(lexer.parse('"\\\\"').length, 1)
	})

	it('lexes simple comparisons', () => {
		let tokens = lexer.parse('key = value')
		assert.equal(tokens[1].type, 'operator')
		assert.equal(tokens.length, 3)

		tokens = lexer.parse('key = "some value"')
		assert.equal(tokens.length, 3)
		assert.equal(tokens[1].type, 'operator')

		tokens = lexer.parse('key != "some value"')
		assert.equal(tokens.length, 3)
		assert.equal(tokens[1].type, 'operator')
		
		tokens = lexer.parse('key = "one \\" two"')
		assert.equal(tokens[0].token, 'key')
		assert.equal(tokens[1].type, 'operator')
		assert.equal(tokens[1].token, '=')
		assert.equal(tokens[2].token, '"one \\" two"')
	})

	it('lexes ors', () => {

		let tokens = lexer.parse('this or that')
		assert.equal(tokens[0].type, 'value')
		assert.equal(tokens[1].type, 'operator')
		assert.equal(tokens[1].token, 'or')
		assert.equal(tokens[2].type, 'value')

		tokens = lexer.parse('something = else or bleh = yeh')
		assertTokens(['something', '=', 'else', 'or', 'bleh', '=', 'yeh'], tokens)
		assert.equal(tokens[3].token, 'or')
	})

	it('lexes parens', () => {
		let tokens = lexer.parse('(name .= Jonathan)')
		assertTokens(['(', 'name', '.=', 'Jonathan', ')'], tokens)

		tokens = lexer.parse('(name = Jonathan or (name = Foo))')
		assertTokens(['(', 'name', '=', 'Jonathan', 'or', '(', 'name', '=', 'Foo'], tokens)

		tokens = lexer.parse('foo in (a b c)')
		assertTokens(['foo', 'in', '(', 'a', 'b', 'c', ')'], tokens)
	})

})
