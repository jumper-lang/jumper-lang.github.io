# Functions

## Declaring

A function starts with its return type - `void`, `dyn`, a typed one or a class:

```jumper
void greet(String name) {
    println("Hello, " + name);
}

int add(int a, int b) {
    return a + b;
}

dyn pair(a, b) {          // a parameter without a type is dyn
    return [a, b];
}

greet("Ann");
println(add(2, 3));       // 5
println(pair(1, 2));      // [1, 2]
```

- A typed result is checked: `int f()` cannot return a string.
- Arguments are not counted: a missing one is `null`, extra ones are ignored. `pair(1)` gives `[1, null]`.
- There are no default values, no varargs and no overloading.
- Functions can be called above their declaration, and declared inside other functions.

## Lambdas

```jumper
dyn square = x -> x * x;
dyn add = (a, b) -> a + b;
dyn log = (String msg) -> {
    println("[log] " + msg);
};

println(square(7), add(2, 3));   // 49 5
log("started");
```

Functions are values: store them in variables, tables and arrays, pass them and return them.

```jumper
dyn twice(f) { return x -> f(f(x)); }
println(twice(x -> x * 10)(1));              // 100
```

A lambda can go wherever Java expects a functional interface (`Runnable`, `Comparator`, `Consumer`...), see [Java interop](/language/java-interop).

## Closures

A function sees the variables around it - the variables themselves, not copies:

```jumper
dyn counter() {
    int n = 0;
    return () -> { n++; return n; };
}

dyn next = counter();
next();
println(next());   // 2
```

Variables declared inside a loop are shared by all closures made in that call. To keep each value, make the closure in a function:

```jumper
dyn keep(k) { return () -> k; }

dyn fs = [];
for (int i = 0; i < 3; i++) fs.add(keep(i));
println(fs[0](), fs[2]());   // 0 2
```

## Functions the host calls

A host can call the functions a script declares at the top level - for events, commands, ticks. Which names it calls is up to the host (see [Hosts](/security/hosts)):

```jumper
void onJoin(dyn player) {
    player.send("Welcome!");
}
```
