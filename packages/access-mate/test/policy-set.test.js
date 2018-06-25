'use strict'

var assert = require('assert')
var AccessMate = require('../index')

describe('policy set', () => {
  it('basic', () => {
    const control = AccessMate.policySet()
      .deny()
      .target('todo_item')
      .action('create')
      .condition()
      .false('subject.premium_account')
      .gt('subject.total_items', 50)
      .end()
      .toJSON()
    const deny = control[0]
    assert.equal(deny.effect, 'deny')
    assert.equal(deny.action, 'create')
  })

  it('multiple', () => {
    const control = AccessMate.policySet()
      .deny()
      .target('todo_item')
      .action('create')
      .condition()
      .false('subject.premium_account')
      .gt('subject.total_items', 50)
      .end()
      .allow()
      .target('todo_item')
      .action('create', 'update', 'delete', 'read')
      .condition()
      .propsEqual('subject.id', 'resource.owner')
      .end()
      .toJSON()
    assert.equal(control[0].effect, 'deny')
    assert.equal(control[1].target, 'todo_item')
  })

  it('composes', () => {
    const policy = AccessMate.policy()
      .effect('allow')
      .target('forum_post')
      .action('update')
      .condition()
      .true('resource.creator')
      .end()
    const control = AccessMate.policySet()
      .deny()
      .target('forum_post')
      .action('create')
      .condition()
      .true('resource.locked')
      .end()
      .concat(policy)

    assert.equal(control.toJSON().length, 2)
  })

  it('fields', () => {
    const policies = AccessMate.policySet()
      .deny()
      .fields('email')
      .target('user')
      .action('read')
      .condition()
      .not()
      .propsEqual('subject.id', 'resource.id')
      .end()
      .end()

    const { omit, authorize } = policies.authorize({
      action: 'read',
      target: 'user',
      resource: { id: 1 },
      subject: { id: 2 },
      environment: {}
    })

    assert.equal(omit[0], 'email')
    assert.equal(authorize, false)
  })

  it('defaults', () => {
    const policies = AccessMate.policySet()
      .defaults({ target: 'example' })
      .allow()
      .action('read')
      .deny()
      .action('update')
      .end()
    let policy = policies._policies[0]
    assert.equal(policy._target, 'example')
    assert.equal(policy._effect, 'allow')
    assert.equal(policy._action, 'read')
    policy = policies._policies[1]
    assert.equal(policy._target, 'example')
  })

  describe('filters', () => {
    const policySet = AccessMate.policySet()
      .deny()
      .name('banned users cannot edit')
      .target('user')
      .action('update')
      .condition()
      .true('subject.banned')
      .end()
      .deny()
      .name('only admins can ban users')
      .fields('banned')
      .target('user')
      .action('update')
      .condition()
      .not()
      .true('subject.admin')
      .end()
      .allow()
      .name('users can edit themselves')
      .target('user')
      .action('update')
      .condition()
      .propsEqual('resource.id', 'subject.id')
      .end()
      .allow()
      .name('admins can edit other users')
      .target('user')
      .action('update')
      .condition()
      .true('subject.admin')
      .end()
      .end()

    it('filters records', () => {
      const resources = [
        { id: 1, admin: false, banned: false },
        { id: 2, admin: true, banned: false },
        { id: 3, admin: false, banned: true }
      ]
      const withSubject = subject => {
        return policySet.filter({
          resources,
          subject,
          action: 'update',
          target: 'user',
          environment: {}
        })
      }
      assert.equal(withSubject(resources[2]).length, 0)
      assert.equal(withSubject(resources[0]).length, 1)
      assert.equal(withSubject(resources[1]).length, 3)
    })

    it('filters fields', () => {
      const result = policySet.filter({
        resources: [{ id: 1, admin: false, banned: false }],
        subject: { id: 1, admin: false, banned: false },
        action: 'update',
        target: 'user',
        environment: {}
      })

      assert(!('banned' in result[0]))
      assert.equal(result.length, 1)
    })
  })
})
