'use strict'

const assert = require('assert')
const expression = require('../lib/')

describe('compiler', () => {

	describe('operator', () => {
		it('is', () => {
			assert.deepEqual(expression('value is null'), [
				{
					type: 'null',
					key: 'value'
				}
			])
			assert.deepEqual(expression('value is true'), [
				{
					type: 'true',
					key: 'value'
				}
			])
			assert.deepEqual(expression('value is false'), [
				{
					type: 'false',
					key: 'value'
				}
			])
		})

		it('=', () => {
			assert.deepEqual(expression('foo = bar'), [
				{
					type: 'equal',
					key: 'foo',
					value: 'bar'
				}
			])
		})

		it('.=', () => {
			assert.deepEqual(expression('resource.id .= subject.id'), [
				{
					type: 'propsEqual',
					keys: ['resource.id', 'subject.id']
				}
			])
		})

		it('!=', () => {
			assert.deepEqual(expression('foo != bar'), [
				{
					type: 'not',
					args: {
						type: 'equal',
						key: 'foo',
						value: 'bar'
					}
				}
			])
		})

		it('in', () => {
			assert.deepEqual(expression('foo in (bar baz)'), [
				{
					type: 'any',
					key: 'foo',
					values: ['bar', 'baz']
				}
			])
		})

	})
})

