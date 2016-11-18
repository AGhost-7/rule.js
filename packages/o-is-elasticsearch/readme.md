## Object Is: Elasticsearch converter
Convert the oIs object into an elasticsearch query.

```javascript
const oIsElasticsearch = require('o-is-elasticsearch')
const oIs = require('o-is').extend({
	elasticsearch: oIsElasticsearch
})

oIs()
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
