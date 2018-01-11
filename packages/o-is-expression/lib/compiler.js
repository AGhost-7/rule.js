'use strict'

const value = (token) => {
	switch(token.type) {
	case 'quoted-value':
		return token.token.substring(1, token.token.length - 1)
	case 'value':
		return token.token
	}
	throw new Error('Expected a value but instead got "' + token.type + '"')
}

const isOperator = (tokens) => {
	const isKind = tokens[2].token
	switch(isKind) {
	case 'true':
	case 'false':
	case 'null':
		return {
			type: isKind,
			key: tokens[0].token
		}
	}
	throw new Error('Invalid kind "' + isKind + '" for "is" operator')
}

const inOperator = (tokens) => {

	if(tokens[0].type !== 'value' && tokens[0].type !== 'quoted-value') {
		throw new Error('Expected value at start of "in" operator')
	}
	// one in (a)
	if(!tokens[2] || tokens[2].type !== 'block-start') {
		throw new Error('Expected opening parenthesis after "in" operator')
	}
	if(!tokens[3] || tokens[3].type !== 'value') {
		throw new Error('Expected value after parenthesis for "in" operator')
	}

	const values = []
	let remove = 3
	for(let i = 3; i < tokens.length; i++) {
		const token = tokens[i]
		remove += 1
		if(token.type === 'block-end') {
			return {
				remove,
				result: {
					type: 'any',
					key: value(tokens[0]),
					values
				}
			}
		} else if(token.type === 'value' || token.type === 'quoted-value') {
			values.push(value(token))
		} else if(token.type === 'operator') {
			throw new Error('Unexpected operator "' + token.token + '"')
		} else {
			throw new Error('Unexpected token ' + token.token)
		}

	}

	throw new Error('Unterminated block statement')
}

const equalOperator = (tokens) => {
	return {
		type: 'equal',
		key: value(tokens[0]),
		value: value(tokens[2])
	}
}

const operator = (tokens) => {
	const operatorToken = tokens[1].token
	let result, remove = 3
	switch(operatorToken) {
	case 'is':
		result = isOperator(tokens)
		break
	case '=':
		result = equalOperator(tokens)
		break
	case '.=':
		result = {
			type: 'propsEqual',
			keys: [
				value(tokens[0]),
				value(tokens[2])
			]
		}
		break
	case '!=':
		result = {
			type: 'not',
			args: equalOperator(tokens)
		}
		break
	case 'in':
		var returned = inOperator(tokens)
		result = returned.result
		remove = returned.remove
		break
	default:
		throw new Error('Invalid token "' + operatorToken + '" for operator')

	}
	tokens.splice(0, remove)
	return result
}

exports.compile = (tokens) => {
	const result = []
	const rest = tokens.slice()
	while(rest.length > 0) {

		if(rest[1].type === 'operator') {
			result.push(operator(rest))
		} else {
			throw new Error('Expected an operator at the second position')
		}
	}
	return result
}
