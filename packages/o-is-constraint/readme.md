# Object Is: Constraints Module
Serializable constraints with complex conditions (provided by [o-is][1]
module).

Example:
```javascript
const oIs = require('o-is')
const constraint = require('o-is-constraint')(oIs)

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

## Built-in Constraints

### `mandatory(fields)`
Fields must not be null, undefined, or and empty string.

### `minLength(length, fields)`
Fields must contain a length of at least the specified `length` parameter.
Handles arrays and strings.

### `maxLength(length, fields)`
Same as `minLength`, but for the maximum length.

### `constant(value, fields)`
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

### `pattern(regex, fields)`
A regex constraint.

## Additional methods

### `fromJSON(data)`
Takes a parsed json object and returns

### `toJSON()`
Returns a json serializable object.

### `concat(constraints)`
Takes two sets of constraints and combines them.

### `errors(object)`
Returns an array of errors

### `assert(object)`
Throws an exception at the first constaint failure.


[1]: https://github.com/AGhost-7/o-is/tree/master/packages/o-is
