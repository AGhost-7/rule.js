Module for testing objects. `o-is` == "Object Is". There's a variety of uses
for this module, such as schema validation.

Motivation for this is that there isn't anything of expressive/flexible enough 
for my needs. The closest thing would have to be Joi, but for some reason there
isn't much in terms of serialization solutions. I also don't like the API...

Performance should be pretty good, since the underlying data structure used to
store the data is already json-convertable (just stringify it). The method
chaining only provides a more fluid api.

```javascript
const oIs = require('o-is');
const test = oIs()
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
const data = oIs()
	.exist('created')
	.serialize(); // outputs an array of objects ready to be stored.

// ... imagine pulling this out of a db
const test = oIs(data).test;

if(test({ created: new Date() })) {
	sendEmail({...}); // etc...
}

```

You can also use this for testing.
```javascript
const complex = {
	name: 'Jonathan',
	fullName: {
		firstName: 'Jonathan',
		lastName: 'Boudreau'
	},
	age: null
};

oIs()
	.equal('name', 'Jonathan')
	.propsEqual('name', 'fullName.lastName')
	.number('age')
	.assert(complex); // => throws error...

```

## Extensions
This module is somewhat extendable as well. The first argument is the series of asserts runners,
and the second argument is the set of methods to add to the builder.
```javascript
const objectIs = oIs.extend({
	foo(context, args) {
		return oIs.get(context, args.key) === 'bar';
	}
}, {
	foo(key) {
		return this.cons({
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
const objectIs = oIs.extend({
	eql(context, args) {
		return eql(args.compare);
	}
}, {
	eql(compare) {
		return this.cons({
			type: 'eql',
			compare
		});
	}
});

```

To keep this module lightweight I decided to not include a ton of depdencies.
Instead the module aims to be extendable for your specific needs. Mainly, this
module defines a "grammar", you can add whatever "nouns" you want.

## Composition
Because the instances are immutable, you can use an existing instance to
concatenate it with another.
```javascript
// you can currently do this
const cond = oIs().equal('name', 'Jonathan');
// You get a new object which will test for both properties.
const merged = oIs().equal('fullName.lastName', 'Boudreau').cons(cond);

```

## Not (Logical Inversion)
When you call `not`, the next method chain's result will be inverted.
```
oIs()
	.not().equal('a', 1)
	.not().exist('c')
	.test({ a: 2 }); // => true
```

## Conditional Properties
```javascript
oIs()
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
oIs()
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
```
oIs()
	.or()
		.equal('a', 1)
		.equal('a', 2)
	.end()
	.test({ a: 2 }); // => true
```

# TODO

Provide enough data for phrase construction:
```javascript
const phrase = (results) => {
	return results.reduce((accu, part) => {
		if(part.type === 'if') {
			return accu + ' when ' ...
		} else if(part.type === 'equal') {
			return accu + ' ' + type.key + ' should be equal ' + part.value;
		}
		...
	}, '');
};

// ...or something

```

