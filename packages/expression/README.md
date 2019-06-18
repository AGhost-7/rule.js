## Rule.js: Expression Language
A simple language for expressing business rules.

### API
This module exports a single function. The function accepts an optional
constructor for the `@rule.js/core` module.

Example:
```js
const Rule = require('@rule.js/core').extend({}, {
	elasticsearch: require('@rule.js/elasticsearch')
})
const ruleExpression = require('@rule.js/expression')(Rule)

const rule = ruleExpression('"name" equal "sample"')
const query = rule.elasticsearch()

// query:
// {
//   "bool": {
//     "must": [
//       {
//         "term": {
//           "name": "sample"
//         }
//       }
//     ]
//   }
// }
```

### Language
The language is meant to be easy enough for non-programmers to pick up. There
are no functions or other more complex constructs.

#### Literals
There are currently only two types of literals: strings and booleans. Strings
_must_ always be double quoted. To place a double quote inside of a string, an
escape sequence must be used (`\"`).

Valid:
- `"hello"`
- `"this is \"a quote\""`
- `"this is a backslash: \\"`

Invalid:
- `'single quotes'`
- `"hello "quotes""`

#### Comparison Operators

##### `equal`
Tests if the key is equal to the given property.

Example:
```
"enabled" equal true
```

##### `not equal`
Compares if the key is not equal to the given property.

Example:
```
"status" not equal "disabled"
```

##### `is empty`
Tests if the given key is empty.

Example:
```
"quantity" is empty
```

##### `is not empty`
Inversion of the `is empty` operator.

Example:
```
"quantity" is not empty
```

##### `any`
Tests if the key is equal any of the given values.

Example:
```
"status" any ("open", "draft")
```

##### `contains`
Test if the key contains the given value.

Example:
```
"hobbies" contains "Guitar"
```

##### `greater than`
Test if the key is less than the specified value.

Example:
```
"age" less than 21
```

##### `less than`
Test if the key is greater than the specified value.

Example:
```
"income" greater than 55374.19
```

#### Logical Operators

##### `and`
Combines two rules together. If one of them is false, the result from the
operator will be false.

Example:
```
"quantity" is not empty and "status" not equal "disabled"
```

##### `or`
Combines two rules togther. If one of them is truthful, the result from the
operator will be true.

Example:
```
"quantity" is empty or "status" equal "disabled"
```

You can mix logical operators together. For example:

```
"quantity" is empty or "status" is empty and "owner" is empty
```

#### Keys
You can do deep lookups with the following:

```
"person"."name" equal "Rick"
```
