'use strict'

const assert = require('assert')
const constraint = require('../index')()

describe('o-is-constraint', () => {
  it('mandatory', () => {
    assert.throws(() => {
      constraint.mandatory(['name']).assert({ boom: true })
    })
    constraint.mandatory(['name']).assert({ name: 'foobar' })
  })

  it('when', () => {
    constraint
      .when()
      .false('admin')
      .mandatory('name')
      .assert({ admin: true })
  })

  it('errors', () => {
    const errors = constraint.mandatory(['foobar']).errors({ foobar: null })
    assert.equal(errors.length, 1)
  })

  it('pattern', () => {
    const errors = constraint
      .pattern(/^[a-z]$/gi, ['a', 'b'])
      .errors({ a: '1', b: 'a' })
    assert.equal(errors.length, 1)
    assert.equal(errors[0].value, '1')
  })

  it('minLength and maxLength', () => {
    constraint
      .when()
      .equal('role', 'admin')
      .equal('subRole', 'super')
      .minLength(1, ['hobbies'])
      .assert({ role: 'admin', subRole: 'super', hobbies: ['guitar'] })

    const constraints = constraint
      .minLength(1, ['locations'])
      .when()
      .false('largeCorp')
      .maxLength(4, ['locations'])

    let errors = constraints.errors({
      locations: []
    })
    assert.equal(errors.length, 1)

    errors = constraints.errors({
      locations: ['a', 'b', 'c', 'd', 'e'],
      largeCorp: false
    })
    assert.equal(errors.length, 1)
  })

  it('constant', () => {
    const constraints = constraint
      .when()
      .not()
      .null('datePublished')
      .constant('published', ['status'])

    constraints.assert({
      datePublished: new Date(),
      status: 'published'
    })

    constraints.assert({
      datePublished: null,
      status: 'published'
    })
  })

  it('toJSON/fromJSON', () => {
    const constraints = constraint
      .when()
      .true('admin')
      .minLength(5, ['password'])
      .minLength(4, ['password'])
    const pass = { admin: false, password: 'helloworld' }
    const fail = { admin: true, password: '1234' }

    assert.equal(constraints.errors(pass), 0)
    assert.equal(constraints.errors(fail).length, 1)
    const js = constraints.toJSON()
    const deserialized = constraint.fromJSON(js)
    assert.equal(deserialized.errors(pass).length, 0)
    assert.equal(deserialized.errors(fail).length, 1)
  })

  it('concat', () => {
    const constraint1 = constraint.mandatory(['firstName'])
    const constraint2 = constraint.mandatory(['lastName'])
    const constraints = constraint1.concat(constraint2)
    const assertErrors = (obj, length) => {
      const errors = constraints.errors(obj)
      assert.equal(errors.length, length)
    }
    assertErrors({ firstName: null, lastName: 'b' }, 1)
    assertErrors({ firstName: 'a', lastName: 'b' }, 0)
    assertErrors({ firstName: 'a', lastName: '' }, 1)
    assertErrors({ firstName: ' ', lastName: undefined }, 2)
  })
})
