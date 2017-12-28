'use strict'

const uuid = require('uuid')

exports.up = function(knex, Promise) {
	return knex.schema.createTable('user', (table) => {
		table.string('id')
		table.primary('id')
		table.string('email')
		table.string('name')
		table.boolean('admin')
		table.string('password')
		table.boolean('banned')
	}).then(() => {
		return knex('user').insert({
			id: uuid.v4(),
			email: 'foo@bar.com',
			password: 'beepbop',
			admin: true,
			banned: false
		})
	})
}

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('user') 
}
