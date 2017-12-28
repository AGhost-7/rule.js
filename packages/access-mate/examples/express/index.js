'use strict'

const AccessMate = require('../index')
const express = require('express')
const _ = require('lodash')
const uuid = require('uuid')
const knex = require('knex')(require('./knexfile').development)
const policySet = require('./lib/policy-set')

const app = express()

app.use(express.json())

const authorize = (options) => {
	const fullOptions = Object.assign({
		environment: process.env // meh.
	}, options)

	return AccessMate.strategies.crud(policySet, fullOptions)
}

// pre-load the subject that way it is always available
app.use((req, res, next) => {
	if(req.cookies.sessionUser) {
		knex('user')
			.where('id', '=', req.cookies.sessionUser)
			.then(([user]) => {
				req.subject = user || { admin: false, banned: false }
				next()
			})
			.catch(next)
	} else {
		// not logged in, use a subject which makes the most sense.
		req.subject = {
			admin: false,
			banned: false
		}
		next()
	}
})

// Get a single user by id.
app.get('/user/:id', (req, res, next) => {
	knex('user')
		.where('id', '=', req.params.id)
		.then((users) => {
			if(users.length === 0) {
				res.status(404).end()
			} else {
				const [user] = users
				const auth = authorize({
					target: 'user',
					action: 'read',
					resource: user,
					subject: req.subject
				})
				if(!auth.authorize) {
					res.status(401).end()
				} else {
					res.status(200).send(_.omit(auth.omit, user))
				}
			}
		})
		.catch(next)
})

// Post here is used for creating new users.
app.post('/user', (req, res, next) => {
	const auth = authorize({
		target: 'user',
		action: 'create',
		resource: req.body,
		subject: req.subject
	})

	if(!auth.authorize) {
		res.status(401).end()
	} else {
		const user = Object.assign({}, res.body, { id: uuid.v4() })
		knex('user')
			.insert(user)
			.then((user) => {
				res.status(200).send(_.omit(auth.omit, user))
			})
			.catch(next)
	}
})

// Return true if allowed to edit the resource. If not allowed to edit the
// resource this will send an appropriate 401 response and return false.
const canEdit = (req, res, user, updated) => {

	const auth = authorize({
		target: 'user',
		action: 'update',
		resource: updated,
		previousResource: user,
		subject: req.subject
	})

	// Return an error if access to the document as a whole is not permitted.
	if(!auth.authorize) {
		res.status(401).end()
		return false
	} else {
		// Return an error if there are any fields being modified which
		// aren't permitted.
		const fields = auth.omit.filter((field) => {
			return _.has(req.body, field)
		})
		if(fields.length > 0) {
			res.status(401).send({
				fields
			})
			return false
		} else {
			return true
		}
	}
}

// Handles sending a properly filtered response after the user has been
// successfully updated.
const updateResponse = (req, res, updated) => {
	// Now that the update has occured, we need to return a
	// response of the updated resource. We could always return a
	// 204 to avoid the read check but from a frontend dev's
	// perspective this isn't a very nice thing to do :P
	const readAuth = authorize({
		target: 'user',
		action: 'read',
		resource: req.body,
		subject: req.subject
	})
	// If for some bizare reason the subject is allowed to update but not read
	// the object will return a 204 with no body (not sure what would truly be
	// appropriate here, more of an edge case).
	if(!readAuth.authorize) {
		res.status(204).end()
	} else {
		const body = _.omit(readAuth.omit, updated)
		res.status(200).send(body)
	}
}

// patch is for partial updates - which does what we want for our acl here.
app.patch('/user/:id', (req, res, next) => {
	knex('user')
		.where('user', '=', req.params.id)
		.then(([user]) => {
			if(!user) {
				res.status(404).end()
			} else {
				const updated = Object.assign({}, user, req.body)
				if(canEdit(req, res, user, updated)) {
					// Make sure that no one can edit the id.
					delete req.body.id
					// Make the update in the database.
					return knex('user')
						.update(req.body)
						.where('id', '=', req.params.id)
						.then(() => {
							updateResponse(req, res, updated)
						})
				}
			}
		})
		.catch(next)
})

