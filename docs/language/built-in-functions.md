# Built-in functions

| Function | What it does |
|---|---|
| `print(a, b, ...)` | prints the values separated by spaces |
| `println(a, b, ...)` | the same and a line break |
| `len(x)` | length of a string, array, table, Java collection, map or array |
| `str(x)` | the value as a string, as `println` shows it |
| `type(x)` | `"int"`, `"long"`, `"double"`, `"boolean"`, `"string"`, `"table"`, `"array"`, `"function"`, `"null"`, a class name, or the Java class name of a Java object |
| `int(x)`, `long(x)`, `double(x)` | convert a number or a string; a string that is not a number gives `null` |
| `keys(t)` | the keys of a table or a Java map, as an array |
| `range(n)`, `range(a, b)`, `range(a, b, step)` | an array of integers from `a` (0) up to `b`, not included |
| `array(n, fill)` | an array of `n` elements, all `fill` |
| `table()` | a new empty table |
| `isa(v, C)` | whether `v` is an instance of a Jumper class or a Java class `C` |
| `format(fmt, ...)` | `String.format` |
| `error(msg)` | throws an error with this message |
| `assert(cond, msg)` | throws `Assertion failed: msg` when `cond` is false |
| `millis()`, `nanoTime()` | the current time, as in `System` |

```jumper
println(len("abc"), len([1, 2]), len({ a: 1 }));   // 3 2 1
println(type(1), type(1.5), type("s"), type([]));  // int double string array
println(int("42") + 1, int("x"));                  // 43 null
println(range(1, 7, 2));                           // [1, 3, 5]
println(format("%.2f", 3.14159));                  // 3.14
println(isa(1, Integer), isa("s", Number));        // true false
```

A host can add its own functions and values to scripts, see [Embedding](/java/embedding).
