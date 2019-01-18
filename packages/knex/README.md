# Rule.js: KnexJs Module
Use your rule.js conditions with KnexJs!

Example:

```js
const Rule = require('@rule.js/core').extend({}, {
	knex: require('@rule.js/knex')()
})

const knex = require('knex')({ client: 'pg' })

knex('user')
	.select()
	.where(function() {
		Rule().equal('name', 'Joe Pass').knex(this)
	})
```

**Note**: This module automatically converts keys to snake case. If you don't
want it to do this, you can override it with:

```js
const Rule = require('@rule.js/core').extend({}, {
	knex: require('@rule.js/knex')(function(key) { return key })
})
```
