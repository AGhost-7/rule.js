module.exports = `
Start
  = Sequence

Sequence
  = items:(operation:Operation _+ type:("and"i/"or"i) _+)+ last:Operation {
    items.reverse();

    return items.reduce((condition, right) => {
      const [operation,,type] = right
      return {
        type: type.toLowerCase(),
        tests: [operation, condition]
      };
    }, last);
  }
  / Test

Operation
  = "(" _* sequence:Sequence _* ")" { return sequence; }
  / Test

Test "test"
  = Equal
  / NotEqual
  / Any
  / NotAny
  / Contains
  / NotContains
  / Empty
  / NotEmpty
  / Range

Range
  = key:Key _+ operator:("less"i/"greater"i) _* "than"i _+ value:Value {
    return {
      type: operator.toLowerCase() === 'less' ? 'lt' : 'gt',
      key: key,
      value: value
    }
  }

Empty
  = key:Key _ "is"i _ "empty"i {
    return {
      type: 'empty',
      key: key
    }
  }

NotEmpty
  = key:Key _ "is"i _ "not"i _ "empty"i {
    return {
      type: 'not',
      args:{
        type: 'empty',
        key: key
      }
    }
  }


NotEqual "not equal"
  = key:Key _ "not"i _ "equal"i _ value:Value {
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
  = key:Key _ "equal"i _ value:Value {
    return {
      type: 'equal',
      key: key,
      value: value
    }
  }

Any "any"
  = key:Key _+ "any"i _* "(" _* head:Value tail: (_* "," _* Value)* ")" {
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

NotAny "not any"
  = key:Key _+ "not"i _+ "any"i _* "(" _* head:Value tail: (_* "," _* Value)* ")" {
    const values = [head]
    tail.forEach(function(group) {
        values.push(group[3])
    })
    return {
      type: 'not',
      args: {
        type: 'any',
        key: key,
        values: values
      }
    }
  }

NotContains "not contains"
  = key:Key _+ "not"i _+ "contains"i _+ value:Value {
    return {
      type: 'not',
      args: {
        type: 'contains',
        key: key,
        value: value
      }
    }
  }

Contains
  = key:Key _+ "contains"i _+ value:Value {
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
  / FloatLiteral
  / IntegerLiteral

BooleanLiteral "boolean"
  = "true" { return true; }
  / "false" { return false; }

StringLiteral "string"
  = Quote chars:Char* Quote {
    return chars.join('')
  }

FloatLiteral "float"
  = [0-9]+ "." [0-9]+ {
    return Number(text())
  }

IntegerLiteral "integer"
  = [0-9]+ {
    return Number(text())
  }

Char
  = Unescaped
  / Escape 
    sequence:(
      '"'
      / "\\\\"
      / "n"
    )
  { return sequence; }

Escape = "\\\\"

Quote = '"'

Unescaped = [^\\0-\\x1F\\x22\\x5C]

_ "whitespace"
  = [\\n\\t ]+
`
