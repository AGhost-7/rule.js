'use strict'

const AccessMate = require('../index')
const express = require('express')
const oIs = require('o-is')
const _ = require('lodash')
const uuid = require('uuid')


// a louzy in-memory store.
const store = {
	user: [
		{
			email: 'foo@bar.com',
			password: 'beepboop',
			admin: true,
			banned: false
		}
	]
}

const app = express()

app.use(express.json())

const isNotSelf = oIs().not().propsEqual('resource.id', 'subject.id')
const policySet = AccessMate.policySet()
	.deny()
		.name('user can only read own password/email')
		.target('user')
		.action('read')
		.fields('password', 'email')
		.condition(isNotSelf)
	.allow()
		.name('owner or admin can edit some of the user fields.')
		.target('user')
		.action('update')
		.condition()
			.or()
				.propsEqual('resource.id', 'subject.id')
				.true('subject.admin')
			.end()
		.end()
	.deny()
		.name('only owner can edit password and email')
		.target('user')
		.action('update', 'read')
		.fields('password', 'email')
		.condition(isNotSelf)
	.deny()
		.name('only admins can ban or set admin field')
		.target('user')
		.action('update')
		.fields('banned', 'admin')
		.condition()
			.not().true('resource.admin')
		.end()
	.allow()
		.name('anyone can create and read users')
		.target('user')
		.action('create', 'read')
	.end()

const fullOptions = (baseOptions, req) => {
	const user = store.user.filter((user) => req.cookies.session === user.id)
	// fallback to a non-logged in subject if there is not matching user.
	const subject = user[0] || { isAdmin: false, banned: false }

	const opts = Object.assign({ subject }, baseOptions)
	switch(baseOptions.action) {
	case 'create':
		opts.resource = req.body
		break
	case 'update':
		opts.resource = req.body
		opts.previousResource = store[opts.target][req.params.id]
		break
	case 'delete':
	case 'read':
		opts.resource = store[opts.target][req.params.id]
		break
	}

	return opts
}

const authorize = (baseOptions) => (req, res, next) => {
	store[baseOptions.target] = store[baseOptions.target] || []

	const options = fullOptions(baseOptions, req)

	const result = AccessMate.strategies.crud(policySet, options)

	if(!result.authorize) {
		req.status(401).send({
			message: 'Access Denied'
		})
	}	else {

		// Might find this information useful later on...
		req.resource = options.resource
		req.previousResource = options.previousResource
		req.subject = options.subject
		// the response resource is also going to be useful
		res.resource = options.resource

		if(result.omit.length > 0) {
			if(options.action === 'update') {
				// check if there is a field that we're trying to edit
				const fields = _.filter(result.omit, (path) => {
					const updated = _.get(options.resource, path)
					const previous = _.get(options.previousResource, path)
					return updated !== previous
				})
				if(fields.length > 0) {
					req.status(401).send({
						message: 'Access Denied',
						fields
					})
				} else {
					next()
				}
			} else {
				if(options.action === 'read') {
					res.resource = _.omit(result.omit) 
				}
				next()
			}
		}
	}

}

app.get('/user/:id', authorize({ target: 'user', action: 'read' }), (req, res) => {
	res.status(200).send(res.resource)
})

app.post('/user', authorize({ target: 'user', action: 'create' }), (req, res) => {
	res.resource.id = uuid.v4()
	store.user.push(res.resource)
	res.status(200).send(res.resource)
})

app.put('/user/:id', authorize({ target: 'user', action: 'update' }), (req, res) => {
	for(const user of store.user) {
		if(user.id === req.params.id) {
			_.assign(user, res.resource)
		}
	}
	res.status(200).send(res.resource)
})

