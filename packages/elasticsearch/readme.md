## Object Is: Elasticsearch converter
Convert the `Rule` object into an elasticsearch query.

```javascript
const ruleElasticsearch = require('@rule.js/elasticsearch')
const Rule = require('@rule.js/core').extend({
	elasticsearch: ruleElasticsearch
})

Rule()
	.if()
		.equal('name', 'foobar')
	.then()
		.gt('age', 20)
	.else()
		.lt('age', '10')
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
              "bool": {
                "must": [
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
    ]
  }
}
```
