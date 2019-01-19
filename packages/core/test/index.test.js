'use strict'

const Rule = require('../index')
const assert = require('assert')

describe('@rule.js/core', () => {
  describe('assertions', () => {
    const obj = {
      name: 'jonathan',
      age: 23145,
      musician: true,
      fullName: {
        first: 'jonathan',
        last: 'boudreau'
      }
    }

    const tests = [
      {
        type: 'true',
        key: 'musician'
      },
      {
        type: 'equal',
        key: 'fullName.first',
        value: 'jonathan'
      },
      {
        type: 'propsEqual',
        keys: ['name', 'fullName.first']
      },
      {
        type: 'any',
        key: 'name',
        values: ['jonathan']
      }
    ]

    it('should pass basic assertions', () => {
      Rule.test(Rule.assertions, obj, tests)
    })

    it('should fail', () => {
      const res = Rule.test(Rule.assertions, {}, [
        {
          type: 'fail'
        }
      ])
      assert(!res)
    })
    it('should pass', () => {
      const res = Rule.test(Rule.assertions, {}, [
        {
          type: 'pass'
        }
      ])
      assert(res)
    })
  })

  describe('builder basics', () => {
    it('should build', () => {
      const res = Rule()
        .equal('a', 1)
        .test({ a: 1 })
      assert.ok(res)
    })
    it('should assert', () => {
      assert.throws(() => {
        Rule()
          .equal('a', 2)
          .assert({ a: 1 })
      })
    })
    it('should chain', () => {
      Rule()
        .equal('a', 1)
        .lt('a', 10)
        .gt('a', 0)
        .equal('a', 1)
        .propsEqual('a', 'foo.bar')
        .equal('arr[0]', 1)
        .assert({
          a: 1,
          foo: {
            bar: 1
          },
          arr: [1]
        })
    })
    it('equal object', () => {
      Rule()
        .equal({
          'name.first': 'Jonathan',
          age: 23
        })
        .assert({
          name: {
            first: 'Jonathan'
          },
          age: 23
        })
    })
  })

  describe('binding', () => {
    it('binds for simple cases', () => {
      const res = Rule()
        .bind('name')
        .equal('first', 'Jonathan')
        .equal('last', 'Boudreau')
        .test({
          name: {
            first: 'Jonathan',
            last: 'Boudreau'
          }
        })
      assert(res)
    })
    it('unbinds', () => {
      const res = Rule()
        .bind('name')
        .equal('first', 'Jonathan')
        .unbind()
        .equal('name.last', 'Boudreau')
        .test({
          name: {
            first: 'Jonathan',
            last: 'Boudreau'
          }
        })
      assert(res)
    })
    it('binds multiple times', () => {
      const obj = {
        a: { b: { c: 1 } }
      }
      Rule()
        .bind('a')
        .unbind()
        .bind('a')
        .bind('b')
        .equal('c', 1)
        .assert(obj)
    })
  })
  describe('not', () => {
    it('inverts equals', () => {
      Rule()
        .not()
        .equal('a', 1)
        .assert({ a: 2 })
    })
    it('inverts only the first statement', () => {
      Rule()
        .not()
        .equal('a', 1)
        .equal('b', 2)
        .assert({
          a: 2,
          b: 2
        })
    })
  })

  describe('or', () => {
    it('eithers...', () => {
      const o = Rule()
        .or()
        .equal('a', 1)
        .equal('a', 2)
        .end()
      o.assert({ a: 1 })
      o.assert({ a: 2 })
      assert(!o.test({ a: 3 }))
      assert(o.test({ a: 1 }))
      assert(o.test({ a: 2 }))
    })
    it('allows multiple strict conditions', () => {
      const o = Rule()
        .equal('a', 1)
        .or()
        .equal('b', 1)
        .equal('b', 2)
        .end()
      o.assert({ a: 1, b: 1 })
      o.assert({ a: 1, b: 2 })
      assert(!o.test({ a: 2, b: 1 }))
    })
    it('binds', () => {
      const o = Rule()
        .or()
        .bind('name')
        .equal('first', 'jonathan')
        .equal('first', 'Jonathan')
        .end()
      o.assert({ name: { first: 'jonathan' } })
      o.assert({ name: { first: 'Jonathan' } })
    })
    it('should allow mixtures of ors and ands', () => {
      const o = Rule()
        .or()
        .equal('a', 1)
        .and()
        .equal('a', 2)
        .equal('b', 3)
        .end()
        .end()
      assert(o.test({ a: 1 }))
      assert(o.test({ a: 2, b: 3 }))
      assert(!o.test({ a: 2 }))
      assert(!o.test({ b: 3 }))
    })
  })

  describe('extensions', () => {
    it('should allow extensions', () => {
      var Rule2 = Rule.extend({}, {})
      Rule2()
        .equal('a', 1)
        .assert({ a: 1 })
    })
    it('should allow adding new methods', () => {
      var Rule2 = Rule.extend(
        {},
        {
          foo() {
            return 'bar'
          }
        }
      )
      assert.equal(
        Rule2()
          .equal('foo', 'baz')
          .foo(),
        'bar'
      )
    })
  })
})
