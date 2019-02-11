'use strict'

module.exports = [
  {
    name: 'todo',
    policies(AccessMate) {
      return AccessMate.policySet()
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

        .allow()
        .name('read non-private todos')
        .target('todo')
        .action('read')
        .condition()
        .false('resource.private')
        .end()

        .end()
    },
    data: [
      {
        id: 1,
        owner: 1,
        private: false
      },
      {
        id: 2,
        owner: 2,
        private: true
      }
    ],
    assertions: [
      {
        target: 'todo',
        subject: {
          id: 1,
          admin: false
        },
        gives: [1]
      },
      {
        target: 'todo',
        subject: {
          id: 2,
          admin: false
        },
        gives: [1, 2]
      },
      {
        target: 'todo',
        subject: {
          id: 3,
          admin: true
        },
        gives: [1, 2]
      }
    ]
  }
]
