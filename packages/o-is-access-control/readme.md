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

## Conditions
Conditions are generated using the `o-is` module. See [documentation][3] for
details.

### API

### Policy
The policy class is an immutable builder. Methods returning a policy will
return a new instance with the same properties as the previous policy with some
additions done by the method call. For example, if you have a policy with an
action of "update" and decide to call `target('user')`, this will return a new
policy with an action of "update" and a target of "user" instead of mutating
the current existing one.

#### `decision(context)`
Returns true if the decision was made to allow access, false if denied,
undefined if unable to reach decision (meaning the condition didn't apply).

#### `target(value)`
Returns a new policy with the specified targets. Accepts multiple string values
or an array of values.

#### `action(value)`
Returns a new policy with the specified action. Accepts multiple string values
or an array of values.

#### `effect(value)`
Returns a new policy with the specified effect. Valid effects are "allow" and
"deny".

#### `condition(value)`
Optionally accepts a value which will be "set" as the policie's condition.
If no value is given this will instead return an `o-is` instance, allowing
construction of the condition immediately.

Example when specifying the condition value: 
```javascript
const isAdmin = oIs().true('isAdmin')

// You can define your conditions first and use them on policies later.
const policy = ABAC.policy()
	.condition(isAdmin)
	.target('comment')
	.effect('allow')
	.action('update')
```

Example when not specifying the condition (results in the same thing as the 
previous example):
```javascript
const policy = ABAC.policy()
	.condition()
		.true('isAdmin')
	.end()
	.target('comment')
	.effect('allow')
	.action('update')
```

#### `deny()`
Concatenates the current policy to the policy set and returns a new policy with
a deny effect.

#### `allow()`
Concatenates the current policy to the policy set and returns a new policy with
an allow effect.

#### `end()`
Concatenates the policy to the policy set and returns the policy set.


## Full Example
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

```

## Benefits
Using this model, one can implement virtually any kind of access control; role
based access control, multi-level access control, etc.

## Debugging
This module uses the `debug` package for managing debug logs. Simply set your
`DEBUG` environment variable to include this package's name to enable it.


[1]: https://en.wikipedia.org/wiki/Attribute-based_access_control
[2]: http://docs.oasis-open.org/xacml/3.0/errata01/os/xacml-3.0-core-spec-errata01-os-complete.html
