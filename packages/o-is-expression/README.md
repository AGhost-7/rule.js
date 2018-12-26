## Object Is: Expression Language
A simple language for expressing business rules.

### API
This module exports a single function. The function accepts an optional
constructor for the `oIs` module.

Example:
```js
const oIs = require('o-is').extend({}, {
	elasticsearch: require('o-is-elasticsearch')
})
const oIsExpression = require('o-is-expression')(oIs)

const condition = oIsExpression('"name" equal "sample"')
const query = condition.elasticsearch()

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
