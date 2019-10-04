const assert = require('assert').strict
const toElasticsearch = require('..')
const AccessMate = require('@rule.js/access-mate')

describe('access-mate-elasticsearch', () => {
  const policies = AccessMate.policySet()
    .allow()
    .name('view any todo')
    .target('todo')
    .action('read')
    .condition()
    .true('subject.admin')
    .end()

    .allow()
    .name('read own todos')
    .target('todo')
    .action('read')
    .condition()
    .propsEqual('resource.owner', 'subject.id')
    .end()

    .deny()
    .name('read private todos')
    .target('todo')
    .action('read')
    .condition()
    .true('resource.private')
    .end()

    .end()

  it('allows all', () => {
    const filter = toElasticsearch(policies, {
      target: 'todo',
      action: 'read',
      subject: {
        id: 1,
        admin: true
      },
      environment: {}
    })
    assert(filter.bool.should[0].match_all)
  })

  it.skip('runs', () => {
    const filter = toElasticsearch(policies, {
      target: 'todo',
      action: 'read',
      subject: {
        id: 1
      },
      environment: {}
    })

    console.log('filter:', JSON.stringify(filter, null, 2))
  })
})
