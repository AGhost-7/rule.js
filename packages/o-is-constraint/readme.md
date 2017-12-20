## Object Is: Constraints Module
Serializable constraints with complex conditions (provided by [o-is][1]
module).

Example:
```javascript
const oIs = require('o-is')
const constraint = require('o-is-constraint')

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
	.mandatory('region')
	// We want the name to always require a minium of 5 characters, hence we
	// don't specify a condition here.
	.minLength(5, 'name')
	.errors({ admin: false })
```
In this example, the region field is mandatory for supervisors with a clearance
lower than 5 and any non-administrators. The name must also be 5 characters
long at a minimum.

[1]: https://github.com/AGhost-7/o-is/tree/master/packages/o-is
