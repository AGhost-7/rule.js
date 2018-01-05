## Object Is: Contextualize
The idea behind this module is to allow to bind properties on
every call done to an oIs object as though the property was
present on every object you're testing against. This allows,
for example, one to use the elasticsearch generator _with_
user login data. For example:

```javascript
const oIs = require('o-is').extend({
	contextualize: require('o-is-contextualize'),
	elasticsearch: require('o-is-elasticsearch')
})

const condition = oIs()
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
