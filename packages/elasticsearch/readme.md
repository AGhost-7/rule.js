## Rule.js: Elasticsearch converter
Convert the `Rule` object into an elasticsearch query.

```javascript
const ruleElasticsearch = require('@rule.js/elasticsearch')()
const Rule = require('@rule.js/core').extend({}, {
	elasticsearch: ruleElasticsearch
})

Rule()
	.or()
		.and().equal('name', 'foobar').gt('age', 20).end()
		.lt('age', 10)
	.end()
	.elasticsearch()
```

Outputs:
```json
{
  "bool": {
    "must": [
      {
        "bool": {
          "should": [
            {
              "bool": {
                "must": [
                  {
                    "term": {
                      "name": "foobar"
                    }
                  },
                  {
                    "range": {
                      "age": {
                        "gt": 20
                      }
                    }
                  }
                ]
              }
            },
            {
              "range": {
                "age": {
                  "lt": 10
                }
              }
            }
          ]
        }
      }
    ]
  }
}
```
