# Работа с Java

Скрипты используют классы Java напрямую. Под [политикой доступа](/ru/security/access-policies) видны только те классы и методы, которые она разрешает.

## Имена классов

```jumper
import java.util.HashMap;       // один класс на import, без * и без статических импортов

HashMap scores = new HashMap(); // класс Java работает как тип
StringBuilder sb = new StringBuilder();   // java.lang не требует import
dyn date = new java.util.Date(0L);        // полное имя работает без import
```

Вложенный класс пишется через внешний: `java.util.Map.Entry`, импортировать его нельзя.

## Объекты, методы, поля

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

- Перегрузка выбирается по значениям аргументов в момент вызова: `append(1)` вызывает `append(int)`, `append(true)` вызывает `append(boolean)`.
- Числа приводятся к типу параметра (`int`, `long`, `double`, `float`...). Строка из одной буквы передаётся как `char`.
- Статические методы и поля используются через класс: `Math.max(1, 2)`, `Integer.MAX_VALUE`.

## Свойства

`obj.name` читает публичное поле или вызывает `getName()` либо `isName()`. Присваивание `obj.name = v` записывает публичное поле или вызывает `setName(v)`.

```jumper
dyn date = new java.util.Date(0L);
println(date.time);        // 0 - date.getTime()
dyn list = new java.util.ArrayList();
println(list.empty);       // true - list.isEmpty()
```

У Java `Map` запись `m.key` тоже означает свойство, а не `m.get("key")`. Для чтения и записи элементов используйте `m["key"]`.

## Функции, таблицы и массивы как значения Java

| Значение Jumper | Передаётся в параметр Java типа |
|---|---|
| функция или лямбда | любой функциональный интерфейс: `Runnable`, `Comparator`, `Consumer`, интерфейс вашего API... |
| массив | `List`, `Collection` (как есть), массив Java (копируется) |
| таблица | `Map` |

```jumper
import java.util.ArrayList;

dyn list = new ArrayList();
list.add(3); list.add(1); list.add(2);
list.sort((a, b) -> a - b);                 // лямбда как Comparator
println(list);                              // [1, 2, 3]
println(String.join("-", ["a", "b"]));      // a-b - массив как Iterable
new Thread(() -> println("run")).run();     // лямбда как Runnable
```

## Массивы Java

```jumper
dyn ints = new int[3];
dyn names = new String[]{"x", "y"};
println(names[1], names.length, type(ints));   // y 2 int[]
```

## Исключения

Исключение Java попадает в `catch` как объект исключения:

```jumper
try {
    Integer.parseInt("x");
} catch (e) {
    println(isa(e, NumberFormatException), e.getMessage());   // true For input string: "x"
}
```

## Как значения выглядят из Java

| Jumper | Java |
|---|---|
| `null`, числа, логические значения, строки | `null`, `Integer` / `Long` / `Double`, `Boolean`, `String` |
| массив | `me.padej.jumper.runtime.JArray` (это `java.util.List`) |
| таблица, объект класса Jumper | `me.padej.jumper.runtime.JTable` (`get`, `put`, `keys`, `asMap()`) |
| функция | `me.padej.jumper.runtime.JFunction` (`call(Object[])`) |
