# Object Is: Constraints Module
Serializable constraints with complex conditions (provided by [o-is][1]
module).

Example:
```javascript
const constraint = require('o-is-constraint')()

const errors = constraint
	// `when()` starts a condition builder which ends the moment you call a
	// constraint.
	.when()
		.if().gt('clearance', 4).then()
			.false('admin')
			.false('supervisor')
		.else()
			.false('admin')
		.end()
	.mandatory(['region'])
	// We want the name to always require a minium of 5 characters, hence we
	// don't specify a condition here.
	.minLength(5, ['name'])
	.errors({ admin: false })
```
In this example, the region field is mandatory for supervisors with a clearance
lower than 5 and any non-administrators. The name must also be 5 characters
long at a minimum.

## API

### Built-in Constraints

#### `mandatory(fields)`
Fields must not be null, undefined, or and empty string.

#### `minLength(length, fields)`
Fields must contain a length of at least the specified `length` parameter.
Handles arrays and strings.

#### `maxLength(length, fields)`
Same as `minLength`, but for the maximum length.

#### `constant(value, fields)`
Fields must be equal the specified value. This is only really useful when
combined with a condition. For example:

```javascript
const bug = {
	status: 'closed',
	resolution: 'nofix'
}

const errors = constraint
	.when()
		.equal('status', 'closed')
	.constant('fixed', ['resolution'])
	.errors(bug)
```
In the above example, a bug cannot be closed if it is a "nofix".

#### `pattern(regex, fields)`
A regex constraint.

### Additional methods

#### `fromJSON(data)`
Takes a parsed json object and returns a constraints instance.

#### `toJSON()`
Returns a json serializable object.

#### `concat(constraints)`
Takes two sets of constraints and combines them.

#### `errors(object)`
Returns an array of errors

#### `assert(object)`
Throws an exception at the first constaint failure.

### Customization
You can extend this module to add methods to the condition builder or the
constraints builder. This is done by specifying some options when initializing
the module.

#### `options.constraintTypes`
This option allows you to specify additional constraint types or even override
existing ones. `constraintTypes` is an object where the key is the name of the
new constraint and the value is a function.

The function should accept two arguments, one is the object you want to
check if the constraint fails on and the second are the arguments passed into
the builder when calling your constraint type.

A minimal example would be the following:
```javascript
const get = require('lodash.get')

const constraint = require('o-is-constraint')({
	constraintTypes: {
		nan: function(context, args) {
			const errors = []
			// The custom constraint will only accept one argument which is a array
			// of fields, hence the `args[0]`.
			for(const key of args[0]) {
				const value = get(context, key)
				if(!isNaN(value)) {
					errors.push({
						type: 'nan',
						value: value,
						key: key
					})
				}
			}
			return errors
		}
	}
})

// Example usage...
constraint
	.nan(['name'])
	.assert({ name: 'foobar' })

```
In this example, we define a constraint which checks if the value of the
property is not a number (NaN).

#### `options.members`
Allows you to add methods to the [o-is][1] condition builder.

#### `options.assertions`
Allows you to add new condition types to the [o-is][1] condition builder.

[1]: https://github.com/AGhost-7/o-is/tree/master/packages/o-is
