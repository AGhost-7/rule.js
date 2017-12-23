# Access Mate
[Attribute-based access control][1] inspired by [xacml][2].

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


## API

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

#### `fields(...values)`
Returns a new policy which will only apply to certain fields. This means that
if the policy denies access, it will add the specified fields to the `omit`
array in the result instead of causing the entire record to fail authorization.

#### `condition(value)`
Optionally accepts a value which will be "set" as the policie's condition.
If no value is given this will instead return an `o-is` instance, allowing
construction of the condition immediately.

Example when specifying the condition value: 
```javascript
const isAdmin = oIs().true('isAdmin')

// You can define your conditions first and use them on policies later.
const policy = AccessMate.policy()
	.condition(isAdmin)
	.target('comment')
	.effect('allow')
	.action('update')
```

Example when not specifying the condition (results in the same thing as the 
previous example):
```javascript
const policy = AccessMate.policy()
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


### PolicySet
Much like the `Policy`, the `PolicySet` class is immutable. All calls
return a new policy set instead of mutating itself.

#### `concat(value)`
Concatenates policy sets together.

#### `allow()`
Returns a new policy with an "allow" effect.

#### `deny()`
Returns a new policy with a "deny" effect.

#### `toJSON()`
Returns a serializable representation of the policy set.

#### `static fromJSON(json)`
Takes the serializable representation and returns a policy set.

#### `authorize(context)`
Returns an object containing two properties: `authorize` and `omit`. If
`authorize` is true, the user has access to the resource. `omit` is a list of
fields that the user does not have access to.

The context object must contain an `action` (string), `target` (string),
`environment` (object), `resource` (object), and `subject` (object) property.


### strategies
Strategies determine how actions behave. Policy sets only use actions to
determine if a policy should be applied or not, strategies define additional
behaviour on top of this. All strategies require a policy set and an options
object. The options object requires at least `resource`, `subject`, and
`environment`.

#### `simple(policySet, options)`
A very basic strategy which simply returns the result of the policy set. There
is no special behaviour for this strategy.

#### `crud(policySet, options)`
The CRUD strategy is identical to the simple strategy except it defines
special behaviour for the updates. For update actions, you will need to pass in
an additional property `previousResource` which is the resource that was last
updated. There are 3 different kind of update actions which your policies can
use:
- `update-into`: This action is only applied on the resource which is to be
updated.
- `update-from`: This action is only applied on the previous revision of the
resource.
- `update`: This is just a combination of `update-into` and `update-from`.

### `bread(policySet, options)`
`BREAD` stands for "browse", "read", "edit", "add", "delete". "Edit" has the
"edit-from" and "edit-into" similar to the CRUD strategy. Browse represents a
request to list multiple records, in which case if the resource doesn't have
access to one of the requests it will return false.


## Full Example
```javascript
const AccessMate = require('access-mate')
const oIs = require('o-is')

// conditions can be re-used.
const isOwner = oIs().propsEqual('subject.id', 'resource.owner')

const policySet = AcessMate.policySet()
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
const policy = AccessMate.policy()
	.allow()
		.target('todo_item')
		.action('read')
		.condition()
			.propsEqual('subject.id', 'resource.collaborators')
		.end()

const fullPolicySet = policySet.concat(rule)

const decision = AccessMate.strategies.simple(fullPolicySet, {
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
