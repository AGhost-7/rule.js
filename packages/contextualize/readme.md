## Object Is: Contextualize
The idea behind this module is to allow to bind properties on
every call done to a `Rule` object as though the property was
present on every object you're testing against. This allows,
for example, one to use the elasticsearch generator _with_
user login data. For example:

```javascript
const Rule = require('@rule.js/core').extend({
	contextualize: require('@rule.js/contextualize'),
	elasticsearch: require('@rule.js/elasticsearch')
})

const condition = Rule()
	.propEqual('user.name', 'creator')

const query = condition
	.contextualize({
		user: {
			name: 'foobar'
		}
	})
	.elasticsearch()

```

The `query` variable would then contain an elasticsearch query which looks
like the following:
```json
{
	"term": {
		"creator": "foobar"
	}
}
```
