'use strict'

/**
 * Used to tokenise the expressions.
 */


const tokenTypes = [
	{
		type: 'quoted-value',
		pattern: '"([^\\"]|\\"|\\\\)*"'
	},
	{
		type: 'operator',
		pattern: '='
	},
	{
		type: 'operator',
		pattern: '!='
	},
	{
		type: 'operator',
		pattern: '\\.='
	},
	{
		type: 'block-start',
		pattern: '\\('
	},
	{
		type: 'block-end',
		pattern: '\\)'
	},
	{
		type: 'operator',
		pattern: 'or'
	},
	{
		type: 'operator',
		pattern: 'is'
	},
	{
		type: 'operator',
		pattern: 'and'
	},
	{
		type: 'operator',
		pattern: 'in'
	},
	{
		type: 'value',
		pattern: '[a-zA-Z0-9_.-]+'
	}
].map(({ type, pattern }) => ({ pattern: new RegExp('^' + pattern), type }))

const findToken = exports.findToken = (rest) => {
	for(const tokenType of tokenTypes) {
		const result = tokenType.pattern.exec(rest)
		if(result) {
			return {
				type: tokenType.type,
				pattern: tokenType.pattern,
				token: result[0]
			}
		}
	}
	return null
}

exports.parse = (source) => {
	const parts = []
	let rest = source
	while(rest.length > 0) {
		const found = findToken(rest)
		if(found) {
			parts.push(found)
			rest = rest.substring(found.token.length)
		} else {
			rest = rest.substring(1)
		}
	}
	return parts
}
