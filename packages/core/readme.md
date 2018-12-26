Module for testing objects. There's a variety of uses for this module, such as
schema validation.

Motivation for this is that there isn't anything of expressive/flexible enough 
for my needs. The closest thing would have to be Joi, but for some reason there
isn't much in terms of serialization solutions. I also don't like the API...

Performance should be pretty good, since the underlying data structure used to
store the data is already json-convertable (just stringify it). The method
chaining only provides a more fluid api.

```javascript
const Rule = require('rule.js/core'
const test = Rule()
	.equal('foo.bar', 'hello world!')
	.test;

test({
	foo: {
		bar: 'hello world!'
	}
}); // =>  true
```

This module can be useful for creating serializable conditions based on a certain context.
In other words, user defined logic.
```javascript
const data = Rule()
	.null('created')
	.serialize(); // outputs an array of objects ready to be stored.

// ... imagine pulling this out of a db
const test = Rule(data).test;

if(test({ created: new Date() })) {
	sendEmail({...}); // etc...
}

```

## Core Comparison Methods

### `equal(key, value)`
Does a strict equality check against a property in the object.

```javascript
const result = Rule().equal('foo', 1).test({ foo: 1 }) // => true
```

### `propsEqual(key1, key2)`
Does a strict equality check on two properties in the object.

```javascript
const result = Rule()
	.propsEqual('foo', 'bar')
	.test({ foo: 1, bar: 1 }) // => true
```

### `null(key)`
Will be true if the key is equal to null (not strict).

```javascript
const result = Rule().null('foo').test({ foo: null }) // => true
```
### `true(key)`
Checks if the given property is equal to true.

```javascript
const result = Rule().true('foo').test({ foo: false }) // => returns false
```

### `false(key)`
Checks if the given property is equal to false.

```javascript
const result = Rule().false('foo').test({ foo: false }) // => true
```

### `gt(key, value)`
Checks if the given property is greater than the given value.


```javascript
const result1 = Rule().gt('one', 1).test({ one: 1 }) // => false

const result2 = Rule().gt('two', 1).test({ two: 2 }) // => true
```

### `lt(key, value)`
Checks if the given property is less than the given value

```javascript
const result = Rule().lt('one', 2).test({ one: 1 }) // => true
```

### `any(key, values)`
Checks if the given property(key) is equal to any of the values.

```javascript
const result = Rule().any('letter', ['a', 'b']).test({ letter: 'a' }) // => true
```

## Not (Logical Inversion)
When you call `not`, the next method chain's result will be inverted.
```javascript
Rule()
	.not().equal('a', 1)
	.not().exist('c')
	.test({ a: 2 }); // => true
```

## Conditional Properties
```javascript
Rule()
	.if()
		.equal('type', 'human')
	.then()
		.exist('name')
	.end()
	.assert({
		type: 'bear',
		age: 5
	}); // doesn't throw an error
```

## Binding to a specific key
```javascript
Rule()
	.bind('fullName')
	.equal('firstName', 'Jonathan')
	.equal('lastName', 'Boudreau')
	.end()
	.test({
		fullName: {
			firstName: 'Jonathan',
			lastName: 'Boudreau'
		}
	}); // => true
```

## Or Statement
```javascript
Rule()
	.or()
		.equal('a', 1)
		.equal('a', 2)
	.end()
	.test({ a: 2 }); // => true

Rule()
	.or()
		.equal('a', 1)
		.and()
			.equal('a', 2)
			.equal('b', 3)
		.end()
	.end()
	.test({ a: 2, b: 3 }) // => true
```

## Composition
Because the instances are immutable, you can use an existing instance to
concatenate it with another.
```javascript
// you can currently do this
const cond = Rule().equal('name', 'Jonathan');
// You get a new object which will test for both properties.
const merged = Rule().equal('fullName.lastName', 'Boudreau').concat(cond);
```

## Extensions
This module is somewhat extendable. The first argument is the series of asserts runners,
and the second argument is the set of methods to add to the builder.
```javascript
const objectIs = Rule.extend({
	foo(context, args) {
		return Rule.get(context, args.key) === 'bar';
	}
}, {
	foo(key) {
		return this.concat({
			type: 'foo', // this specifies what assertion to call
			key
		});
	}
});

objectIs
	.foo('a')
	.exist('today') // previous methods remain, but they can be overriden.
	.test({ today: new Date(), a: 'bar' }); // returns true!
```

Or even...

```javascript
const eql = require('deep-eql');
const objectIs = Rule.extend({
	eql(context, args) {
		return eql(args.compare);
	}
}, {
	eql(compare) {
		return this.concat({
			type: 'eql',
			compare
		});
	}
});

```

To keep this module lightweight I decided to not include a ton of depdencies.
Instead the module aims to be extendable for your specific needs. Mainly, this
module defines a "grammar", you can add whatever "nouns" you want.

