
Start
	= Expression

Expression
  = "(" _* left:Operation _* ")" _* type:("and"/"or") _* "(" _* right:Operation _* ")" {
		return {
			type: type,
			tests: [left, right]
		}
	}
	/ "(" _* left:Operation _* ")" _* type:("and"/"or") _ right:Operation {
	  return {
		  type: type,
			tests: [left, right]
		};
	}
	/ left:Operation _ type:("and"/"or") _* "(" _* right:Operation _* ")" {
		return {
			type: type,
			tests: [left, right]
		}
	}
	/ Operation

Operation
  = left:Test _ type:("and"/"or") _ right:Expression {
		return {
			type: type,
			tests: [left, right]
		}
	}
	/ Test

Test "test"
  = NotEqual
	/ Equal
	/ Any
	/ Contains
	/ NotEmpty
	/ Empty

Empty
  = key:Key _ "is" _ "empty" {
		return {
			type: 'null',
			key: key
		}
	}

NotEmpty
  = key:Key _ "is" _ "not" _ "empty" {
	  return {
			type: 'not',
			args:{
			  type: 'null',
				key: key
			}
		}
	}


NotEqual "not equal"
  = key:Key _ "not" _ "equal" _ value:Value {
    return {
      type: 'not',
			args: {
				type: 'equal',
				key: key,
				value: value
			}
    }
  }

Equal "equal"
  = key:Key _ "equal" _ value:Value {
		return {
			type: 'equal',
			key: key,
			value: value
		}
	}

Any "any"
	= key:Key _+ "any" _* "(" _* head:Value tail: (_* "," _* Value)* ")" {
		const values = [head]
		tail.forEach(function(group) {
				values.push(group[3])
		})
		return {
			type: 'any',
			key: key,
			values: values
		}
	}

Contains
	= key:Key _+ "contains" _+ value:Value {
		return {
			type: 'contains',
			key: key,
			value: value
		}
	}

Key = 
	head:StringLiteral tail: ("." StringLiteral)+ {
		const result = tail.map(token => token[1])
		result.unshift(head)
		return options.toPath(result)
	}
	/ key:StringLiteral {
		return options.toPath(key)
	}

Value
  = StringLiteral
	/ BooleanLiteral

BooleanLiteral "boolean"
  = "true" { return true; }
	/ "false" { return false; }

StringLiteral "string"
  = Quote chars:Char* Quote {
    return chars.join('')
  }

Char
  = Unescaped
  / Escape 
    sequence:(
      '"'
      / "\\"
      / "n"
    )
  { return sequence; }

Escape = "\\"

Quote = '"'

Unescaped = [^\0-\x1F\x22\x5C]

_ "whitespace"
	= [\n\t ]+
