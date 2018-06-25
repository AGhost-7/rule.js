'use strict'

const casual = require('casual')
const supertest = require('supertest')

const request = supertest('localhost:3000')

describe('user', () => {
  it('denies creating admin user', () => {
    return request
      .post('/user')
      .send({
        admin: true,
        email: casual.email,
        password: casual.password,
        name: casual.name
      })
      .expect(401)
  })

  it('allows creating a regular user', () => {
    return request
      .post('/user')
      .send({
        email: casual.email,
        password: casual.password,
        name: casual.name
      })
      .expect(200)
  })

  it.skip('denies non-admins from banning users', () => {})
  it.skip('allows admins to ban users', () => {})
  it.skip('denies non-owner from editing email', () => {})
  it.skip('allows user from editing own email', () => {})
  it.skip('denies others from seeing password', () => {})
  it.skip('allows seeing own password', () => {})
})
