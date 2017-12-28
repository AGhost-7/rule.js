'use strict'

exports.up = function(knex, Promise) {
	return knex.schema.createTable('user', (table) => {
		table.string('email')
		table.string('name')
		table.boolean('admin')
		table.string('password')
		table.boolean('banned')
	}).then(() => {
		return knex('user').insert({
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
