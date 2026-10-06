# Таблицы и массивы

## Таблицы

Таблица сопоставляет ключам значения, как объект JSON или таблица Lua. Ключи хранятся в порядке добавления.

```jumper
dyn player = { name: "Ann", level: 3 };

println(player.name);        // Ann
println(player["level"]);    // 3

player.city = "Oslo";        // добавить ключ
player.level += 1;
player.city = null;          // присваивание null удаляет ключ

println(player);             // {name: Ann, level: 4}
println(len(player));        // 2
println(keys(player));       // [name, level]
println(player.missing);     // null - отсутствующий ключ читается как null
```

Ключи в литерале: имя (`name:`), строка (`"with space":`), число (`2:`) или вычисляемый ключ (`[expr]:`). Значения могут быть любыми, включая таблицы, массивы и функции:

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

`table()` создаёт пустую таблицу, как и `{}`.

Обход ключей через for-each:

```jumper
dyn prices = { apple: 3, pear: 5 };
for (dyn k : prices) println(k + " costs " + prices[k]);
```

## Массивы

```jumper
dyn xs = [10, 20, 30];       // {10, 20, 30} тоже работает, как в Java

println(xs[0], xs.length, len(xs));   // 10 3 3
xs.add(40);                  // добавить в конец
xs[4] = 50;                  // запись по индексу == length тоже добавляет
dyn last = xs.pop();         // убрать и вернуть последний
println(xs, last);           // [10, 20, 30, 40] 50

for (dyn x : xs) print(x, "");
println();
```

Индексы начинаются с 0. Чтение или запись за пределами массива - ошибка.

Массив - это `java.util.List`, поэтому работают и его методы: `contains`, `indexOf`, `remove`, `sort`, `subList`, `stream`, `forEach` и другие.

```jumper
dyn names = ["Cid", "Ann", "Bob"];
names.sort(null);
println(names, names.contains("Bob"));   // [Ann, Bob, Cid] true
```

`range(n)` даёт `[0, 1, ..., n-1]`, `range(a, b, step)` считает от `a` до `b` (не включая). `array(n, fill)` создаёт массив из `n` копий `fill`.

## Массивы Java

`new int[3]`, `new String[]{"a", "b"}` и `new dyn[5]` (это `Object[]`) создают настоящие массивы Java, для Java-методов, которым они нужны. Индексировать и обходить их можно так же, как обычные массивы.
