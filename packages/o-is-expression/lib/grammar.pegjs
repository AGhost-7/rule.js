Start
	= Expression
  / Test

Expression
  = left:Test right:OrExpression {
		return {
			type: 'or',
			tests: [left, right]
		}
	}
	/ left:Test right:AndExpression {
		return {
			type: 'and',
			tests: [left, right]
		}
	}
	/ Test

OrExpression
  = _ "or" _ expression:Expression {
		return expression;
	}

AndExpression
  = _ "and" _ expression:Expression {
		return expression;
	}

Test "test"
  = NotEqual
	/ Equal
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
				key: Key
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

Key = StringLiteral

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
	= [\t ]+
