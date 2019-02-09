# Access Mate: Elasticsearch Converter
Convert [Access-Mate][access-mate] access control lists to Elasticsearch
filters.

Usage:
```javascript
const AccessMate = require('@rule.js/access-mate')
const toElasticsearch = require('@rule.js/access-mate-elasticsearch')

const policies = AccessMate.policySet()
	.allow()
	.name('view any todo')
	.target('todo')
	.action('read')
	.condition()
	.true('subject.admin')
	.end()

	.allow()
	.name('read own todos')
	.target('todo')
	.action('read')
	.condition()
	.propsEqual('resource.owner', 'subject.id')
	.end()

	.deny()
	.name('read private todos')
	.target('todo')
	.action('read')
	.condition()
	.true('resource.private')
	.end()

const filter = toElasticsearch(policies, {
	target: 'todo',
	action: 'read',
	subject: {
		id: 1,
		admin: false
	},
	environment: {}
})

console.log(JSON.stringify(filter, null, 2))
```

Would print the following:
```json
{
  "bool": {
    "should": [
      {
        "bool": {
          "must": [
            {
              "match_none": {}
            }
          ]
        }
      },
      {
        "bool": {
          "should": [
            {
              "bool": {
                "must": [
                  {
                    "term": {
                      "owner": 1
                    }
                  }
                ]
              }
            },
            {
              "bool": {
                "must_not": {
                  "bool": {
                    "must": [
                      {
                        "term": {
                          "private": true
                        }
                      }
                    ]
                  }
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

[access-mate]: https://github.com/AGhost-7/rule.js/tree/master/packages/access-mate
