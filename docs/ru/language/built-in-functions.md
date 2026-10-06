# Встроенные функции

| Функция | Что делает |
|---|---|
| `print(a, b, ...)` | печатает значения через пробел |
| `println(a, b, ...)` | то же и перевод строки |
| `len(x)` | длина строки, массива, таблицы, коллекции, map или массива Java |
| `str(x)` | значение в виде строки, как его показывает `println` |
| `type(x)` | `"int"`, `"long"`, `"double"`, `"boolean"`, `"string"`, `"table"`, `"array"`, `"function"`, `"null"`, имя класса или имя Java-класса для объекта Java |
| `int(x)`, `long(x)`, `double(x)` | преобразует число или строку; строка, которая не является числом, даёт `null` |
| `keys(t)` | ключи таблицы или Java map в виде массива |
| `range(n)`, `range(a, b)`, `range(a, b, step)` | массив целых от `a` (0) до `b`, не включая `b` |
| `array(n, fill)` | массив из `n` элементов, все равны `fill` |
| `table()` | новая пустая таблица |
| `isa(v, C)` | является ли `v` экземпляром класса Jumper или Java-класса `C` |
| `format(fmt, ...)` | `String.format` |
| `error(msg)` | бросает ошибку с этим сообщением |
| `assert(cond, msg)` | бросает `Assertion failed: msg`, если `cond` ложно |
| `millis()`, `nanoTime()` | текущее время, как в `System` |

```jumper
println(len("abc"), len([1, 2]), len({ a: 1 }));   // 3 2 1
println(type(1), type(1.5), type("s"), type([]));  // int double string array
println(int("42") + 1, int("x"));                  // 43 null
println(range(1, 7, 2));                           // [1, 3, 5]
println(format("%.2f", 3.14159));                  // 3.14
println(isa(1, Integer), isa("s", Number));        // true false
```

Хост может добавить скриптам свои функции и значения, см. [Встраивание](/ru/java/embedding).
