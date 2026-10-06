# Java interop

Scripts use Java classes directly. Under an [access policy](/security/access-policies) only the classes and methods it allows are visible.

## Naming classes

```jumper
import java.util.HashMap;       // one class per import, no * and no static imports

HashMap scores = new HashMap(); // a Java class works as a type
StringBuilder sb = new StringBuilder();   // java.lang needs no import
dyn date = new java.util.Date(0L);        // a full name works without import
```

A nested class is written through its outer class: `java.util.Map.Entry`, not imported.

## Objects, methods, fields

```jumper
import java.util.HashMap;

HashMap scores = new HashMap();
scores.put("ann", 10);
println(scores.get("ann"), scores.size());   // 10 1

StringBuilder sb = new StringBuilder();
sb.append("a").append(1).append(true);
println(sb.toString());                       // a1true

println(Math.sqrt(16), Integer.MAX_VALUE);    // 4.0 2147483647
```

- Overloads are picked by the argument values at the call: `append(1)` calls `append(int)`, `append(true)` calls `append(boolean)`.
- Numbers convert to the parameter's type (`int`, `long`, `double`, `float`...). A one-letter string passes as a `char`.
- Static methods and fields are used through the class: `Math.max(1, 2)`, `Integer.MAX_VALUE`.

## Properties

`obj.name` reads a public field, or calls `getName()` or `isName()`. Assigning `obj.name = v` sets a public field or calls `setName(v)`.

```jumper
dyn date = new java.util.Date(0L);
println(date.time);        // 0 - date.getTime()
dyn list = new java.util.ArrayList();
println(list.empty);       // true - list.isEmpty()
```

On a Java `Map`, `m.key` is a property too, not `m.get("key")`. Use `m["key"]` to read and write entries.

## Functions, tables and arrays as Java values

| Jumper value | Passed to a Java parameter of type |
|---|---|
| a function or lambda | any functional interface: `Runnable`, `Comparator`, `Consumer`, an interface of your API... |
| an array | `List`, `Collection` (as is), a Java array (copied) |
| a table | `Map` |

```jumper
import java.util.ArrayList;

dyn list = new ArrayList();
list.add(3); list.add(1); list.add(2);
list.sort((a, b) -> a - b);                 // a lambda as a Comparator
println(list);                              // [1, 2, 3]
println(String.join("-", ["a", "b"]));      // a-b - an array as an Iterable
new Thread(() -> println("run")).run();     // a lambda as a Runnable
```

## Java arrays

```jumper
dyn ints = new int[3];
dyn names = new String[]{"x", "y"};
println(names[1], names.length, type(ints));   // y 2 int[]
```

## Exceptions

A Java exception reaches `catch` as the exception object:

```jumper
try {
    Integer.parseInt("x");
} catch (e) {
    println(isa(e, NumberFormatException), e.getMessage());   // true For input string: "x"
}
```

## What values look like from Java

| Jumper | Java |
|---|---|
| `null`, numbers, booleans, strings | `null`, `Integer` / `Long` / `Double`, `Boolean`, `String` |
| array | `me.padej.jumper.runtime.JArray` (a `java.util.List`) |
| table, object of a Jumper class | `me.padej.jumper.runtime.JTable` (`get`, `put`, `keys`, `asMap()`) |
| function | `me.padej.jumper.runtime.JFunction` (`call(Object[])`) |
