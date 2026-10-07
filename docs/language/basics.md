# Language basics

Jumper reads like Java. The differences: types are optional, there are tables and functions as values, and a script is just statements from top to bottom - no `class Main`, no `main` method. The full list, with the Java equivalent and the bytecode of each difference: [Differences from Java](/language/differences).

```jumper
// a line comment
/* a block comment */
println("statements run from top to bottom");
```

## Variables and types

```jumper
dyn x = 1;          // dynamic: holds any value, can change type
x = "now a string";

int count = 0;      // typed: checked when the script is parsed and when it runs
long big = 9000000000L;
double ratio = 0.75;
boolean ready = true;
String name = "Jumper";
```

| Type | Values | Default |
|---|---|---|
| `dyn` | anything | `null` |
| `int`, `long`, `double` | numbers | `0` |
| `boolean` | `true`, `false` | `false` |
| `String` | text or `null` | `null` |
| a class (script or Java) | an instance of it or `null` | `null` |

A wrong value in a typed variable is an error. When the type is known before the script runs, it is reported right away:

```jumper
int n = "five";   // Syntax error: Cannot assign string to int
```

Numbers widen (`int` to `long` to `double`), they never narrow by themselves. Convert explicitly with `int(x)`, `long(x)`, `double(x)` - there are no casts like `(int) x`.

Several variables in one declaration: `int a = 1, b = 2;`.

## Numbers

```jumper
int i = 42;
int hex = 0xFF;
int million = 1_000_000;
long l = 10L;
double d = 3.14e-2;

println(7 / 2);     // 3 - int division
println(7 / 2.0);   // 3.5
println(7 % 3);     // 1
```

Integer division by zero is an error, `double` division gives `Infinity` or `NaN`. Overflow wraps around as in Java.

## Strings

`"..."` and `'...'` are the same: a string of any length (there is no `char`). Escapes: `\n \t \r \0 \\ \" \'` and `\uXXXX`.

```jumper
String s = "Jumper";
println(s.length);          // 6
println(s.toUpperCase());   // JUMPER - any method of java.lang.String
println(s[0]);              // J - a one-letter string
println("a" + 1 + 2);       // a12
```

## Truth

Only `null` and `false` are false. `0`, `""` and empty tables are true.

`&&` and `||` return one of their operands, so `||` gives a default value:

```jumper
dyn nick = null;
println(nick || "guest");   // guest
```

## Operators

| | |
|---|---|
| arithmetic | `+ - * / %` (`+` also joins strings) |
| comparison | `== != < <= > >=` |
| logic | `&& \|\| !` |
| bits | `& \| ^ << >> >>>` |
| assignment | `= += -= *= /= %=`, `++`, `--` |
| conditional | `cond ? a : b` |

`==` compares numbers by value (`1 == 1L` is true), strings and arrays by content, tables and objects by reference.

## Control flow

```jumper
int n = 7;

if (n > 5) {
    println("big");
} else {
    println("small");
}

while (n > 0) n--;

do {
    n++;
} while (n < 3);

for (int i = 0; i < 3; i++) {
    if (i == 1) continue;
    println(i);
}

for (dyn item : ["a", "b", "c"]) {   // for-each needs a type: dyn, int, String...
    println(item);
}
```

`for-each` walks arrays, Java collections and iterators, the keys of a table or a Java `Map`, and the characters of a string.

`break` and `continue` work in loops. There are no labels.

## switch

Arrows only, no fall-through. Several values in one `case`:

```jumper
int day = 6;

switch (day) {
    case 6, 7 -> println("weekend");
    default   -> println("weekday");
}

String kind = switch (day) {
    case 1  -> "start";
    case 6, 7 -> "rest";
    default -> "work";
};
println(kind);   // rest
```

A `switch` used as a value must have a `default`.

## Errors

`throw` throws any value. `catch` has no type: it gets whatever was thrown.

```jumper
try {
    throw { code: 404, reason: "not found" };
} catch (e) {
    println(e.code);          // 404
} finally {
    println("done");
}

try {
    error("something broke");  // a Jumper error with a message
} catch (e) {
    println(e.message);        // something broke
}
```

An exception from a Java call reaches `catch` as the Java exception itself, so `isa(e, NumberFormatException)` works.

Errors of the [access policy](/security/access-policies) and cancellation by the host cannot be caught by the script.

## Scopes

- A block `{ }` is a scope. Variables are visible after their declaration, until the end of the block.
- A function can be called above its declaration in the same block. A class cannot be used with `new` before its declaration has run.
- An inner block may declare a name that already exists outside (it hides the outer one); the same name twice in one block is an error.
