# Classes

```jumper
class Point {
    int x;
    int y;

    Point(int x, int y) {          // the constructor: the class name, no return type
        this.x = x;
        this.y = y;
    }

    int sum() {
        return x + y;              // fields by their bare name, or this.x
    }

    String toString() {            // used by println and string joining
        return "(" + x + ", " + y + ")";
    }
}

Point p = new Point(1, 2);
println(p, p.sum());               // (1, 2) 3
```

- Fields have a type (`dyn`, `int`, `String`, a class...) and an optional initial value: `int hp = 20;`.
- Methods need a return type: `void`, `dyn`, `int`...
- One constructor at most. Without one, `new C()` takes no arguments (or the parent's).
- There is no overloading, no `private`/`public`, no nested classes.

An object has exactly the fields of its class: reading or writing an unknown field is an error (`No field 'z' in Point`). For free-form data use a [table](/language/tables-and-arrays).

## Inheritance

```jumper
class Point3 extends Point {
    int z;

    Point3(int x, int y, int z) {
        super(x, y);               // the parent's constructor
        this.z = z;
    }

    int sum() {
        return super.sum() + z;    // the parent's method
    }
}

dyn q = new Point3(1, 2, 3);
println(q.sum());                  // 6
println(isa(q, Point), type(q));   // true Point3
```

Methods are virtual: `q.sum()` calls `Point3.sum` even through a `Point` variable.

A class extends only another Jumper class. A Java interface is implemented by passing a function (see [Java interop](/language/java-interop)).

Field initializers of the whole chain run before any constructor, parents first.

## Static members

```jumper
class Registry {
    static int count = 0;
    static void add() { count++; }
}

Registry.add();
Registry.add();
println(Registry.count);   // 2
```

Static fields are set up when the `class` statement runs.

## Classes as values

A class is a value: keep it in a variable or a table, create objects from it later.

```jumper
class Cat { String name; Cat(String name) { this.name = name; } }

dyn kinds = { cat: Cat };
dyn tom = new kinds.cat("Tom");
println(tom.name);   // Tom
```
