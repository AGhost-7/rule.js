# o-is-expression
A very simple expression-based language that outputs an o-is object.

## Grammar

### Equal
```
description = "You can write text in quotes"
```

### Properties Equal
```
subject.id .= resource.id
```

### Any
```
role in (admin moderator)
```

### Not Equal
```
name != foobar
```

### True

```
isAdmin is true
```

### False

```
isAdmin is false
```

### Null
```
name is null
```

