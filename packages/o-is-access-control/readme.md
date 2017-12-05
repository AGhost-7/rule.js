# o-is-access-control
[Attribute-based access control][1] inspired by [xacml][2]

## Glossary
- resource: The data that wants to be accessed.
- target: Name of the resource.
- action: What the request wants to do with the resource.
- subject: In most cases this is essentially the authenticated user.
- environment: Data which is not specific to the resource or subject, e.g.,
global settings/configurations.
- effect: If the rule passes, what effect it will have (either deny or allow).
- policy: A policy is the smallest unit of access control. It represents a
single rule. A policy reaches a decision based on the context it is given,
which is the action, resource, subject,
- policy set: A policy set is a list of policies.
- strategy: A strategy decides how to use policies. Mainly, these define
how actions behave, and pass the context over to the policies.


## Example
```javascript
const ABAC = require('o-is-access-control')
const oIs = require('o-is')

// conditions can be re-used.
const isOwner = oIs().propsEqual('subject.id', 'resource.owner')

const policySet = ABAC.policySet()
	.deny()
		.target('todo_item')
		.action('create')
		.condition()
			.false('subject.premium_account')
			.gt('subject.total_items', 50)
		.end()
	.allow()
		.target('todo_item')
		.action('create', 'update', 'delete', 'read')
		.condition(isOwner)


// Rules can be composed together.
const policy = ABAC.policy()
	.allow()
		.target('todo_item')
		.action('read')
		.condition()
			.propsEqual('subject.id', 'resource.collaborators')
		.end()

const fullPolicySet = policySet.concat(rule)

const decision = ABAC.strategies.simple(fullPolicySet, {
	environment: {
		someGlobalConfigurations: {}
	},
	resource: {
		owner: 'foobar',
		value: 'example todo item',
		collaborators: []
	},
	action: 'create',
	target: 'todo_item'
	subject: {
		id: 'foobar'
	}
})

```

This access control module can be serialized/deserialized. The above example
would look like the following when converted to JSON:
```json
[
	{
		"effect": "deny",
		"target": "todo_item",
		"action": ["create"],
		"condition": [
			{ "type": "false", "key": "subject.premium_account" },
			{ "type": "gt", "key": "subject.total_items", "value": 50 }
		]
	},
	{
		"effect": "allow",
		"target": "todo_item",
		"action": ["create", "update", "delete", "read"],
		"condition": [
			{ "type": "propsEqual", "keys": ["subject.id", "resource.collaborator"] }
		]
	},
	{
		"effect": "allow",
		"target": "todo_item",
		"action": ["read"],
		"condition": [
			{ "type": "propsEqual", "keys": ["subject.id", "resource.collaborator"] }
		]
	}
]

## Benefits
Using this model, one can implement virtually any kind of access control; role
based access control, multi-level access control, etc.

```

[1]: https://en.wikipedia.org/wiki/Attribute-based_access_control
[2]: http://docs.oasis-open.org/xacml/3.0/errata01/os/xacml-3.0-core-spec-errata01-os-complete.html
