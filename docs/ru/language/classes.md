# Классы

```jumper
class Point {
    int x;
    int y;

    Point(int x, int y) {          // конструктор: имя класса, без типа результата
        this.x = x;
        this.y = y;
    }

    int sum() {
        return x + y;              // поля по имени или через this.x
    }

    String toString() {            // используется println и склейкой строк
        return "(" + x + ", " + y + ")";
    }
}

Point p = new Point(1, 2);
println(p, p.sum());               // (1, 2) 3
```

- У полей есть тип (`dyn`, `int`, `String`, класс...) и необязательное начальное значение: `int hp = 20;`.
- У методов обязателен тип результата: `void`, `dyn`, `int`...
- Конструктор максимум один. Без него `new C()` не принимает аргументов (или принимает аргументы родителя).
- Перегрузки, `private`/`public` и вложенных классов нет.

У объекта ровно те поля, что объявлены в классе: чтение или запись неизвестного поля - ошибка (`No field 'z' in Point`). Для данных произвольной формы используйте [таблицу](/ru/language/tables-and-arrays).

## Наследование

```jumper
class Point3 extends Point {
    int z;

    Point3(int x, int y, int z) {
        super(x, y);               // конструктор родителя
        this.z = z;
    }

    int sum() {
        return super.sum() + z;    // метод родителя
    }
}

dyn q = new Point3(1, 2, 3);
println(q.sum());                  // 6
println(isa(q, Point), type(q));   // true Point3
```

Методы виртуальные: `q.sum()` вызывает `Point3.sum`, даже если `q` хранится в переменной типа `Point`.

Класс может наследовать только другой класс Jumper. Интерфейс Java реализуется передачей функции (см. [Работа с Java](/ru/language/java-interop)).

Инициализаторы полей всей цепочки выполняются до любого конструктора, начиная с родителей.

## Статические члены

```jumper
class Registry {
    static int count = 0;
    static void add() { count++; }
}

Registry.add();
Registry.add();
println(Registry.count);   // 2
```

Статические поля инициализируются, когда выполняется инструкция `class`.

## Классы как значения

Класс - это значение: его можно положить в переменную или таблицу и создавать объекты позже.

```jumper
class Cat { String name; Cat(String name) { this.name = name; } }

dyn kinds = { cat: Cat };
dyn tom = new kinds.cat("Tom");
println(tom.name);   // Tom
```
