# Tables and arrays

## Tables

A table maps keys to values, like a JSON object or a Lua table. Keys keep the order they were added in.

```jumper
dyn player = { name: "Ann", level: 3 };

println(player.name);        // Ann
println(player["level"]);    // 3

player.city = "Oslo";        // add a key
player.level += 1;
player.city = null;          // assigning null removes the key

println(player);             // {name: Ann, level: 4}
println(len(player));        // 2
println(keys(player));       // [name, level]
println(player.missing);     // null - a missing key reads as null
```

Keys in a literal: a name (`name:`), a string (`"with space":`), a number (`2:`) or a computed key (`[expr]:`). Values can be anything, including tables, arrays and functions:

```jumper
dyn config = {
    title: "demo",
    "max players": 20,
    1: "first",
    ["key" + 1]: "computed",
    limits: { min: 1, max: 10 },
    double: x -> x * 2
};
println(config.limits.max, config.double(21));   // 10 42
```

`table()` makes an empty table, as does `{}`.

Walk the keys with for-each:

```jumper
dyn prices = { apple: 3, pear: 5 };
for (dyn k : prices) println(k + " costs " + prices[k]);
```

## Arrays

```jumper
dyn xs = [10, 20, 30];       // {10, 20, 30} works too, as in Java

println(xs[0], xs.length, len(xs));   // 10 3 3
xs.add(40);                  // add to the end
xs[4] = 50;                  // writing at index == length also adds
dyn last = xs.pop();         // remove and return the last one
println(xs, last);           // [10, 20, 30, 40] 50

for (dyn x : xs) print(x, "");
println();
```

Indexes start at 0. Reading or writing outside the array is an error.

An array is a `java.util.List`, so its methods work too: `contains`, `indexOf`, `remove`, `sort`, `subList`, `stream`, `forEach` and others.

```jumper
dyn names = ["Cid", "Ann", "Bob"];
names.sort(null);
println(names, names.contains("Bob"));   // [Ann, Bob, Cid] true
```

`range(n)` gives `[0, 1, ..., n-1]`, `range(a, b, step)` counts from `a` up to `b` (not included). `array(n, fill)` makes an array of `n` copies of `fill`.

## Java arrays

`new int[3]`, `new String[]{"a", "b"}` and `new dyn[5]` (an `Object[]`) make real Java arrays, for Java methods that need them. Index and walk them like arrays.
