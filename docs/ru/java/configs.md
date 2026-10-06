# Конфиги

Конфиг (файл `.jmc`) - это Jumper, урезанный до данных: значения, переменные, выражения и условия. Он заменяет YAML или JSON и умеет вычислять одно значение из другого, но никогда не выполняет ничего опасного: циклов и Java в этом языке нет.

## Как написать конфиг

Конфиг - это переменные верхнего уровня:

```jumper
// server.jmc
int port = 25565;
boolean dev = false;
int maxPlayers = dev ? 5 : 100;
dyn motd = ["Welcome", "to the server"];
dyn db = { url: "jdbc:mysql://localhost/mc", pool: { min: 2, max: 10 } };

if (dev) {
    maxPlayers = 1;
}
```

Его значение - таблица `{port: 25565, dev: false, maxPlayers: 100, motd: [...], db: {...}}` в порядке объявления. Переменные, которые в итоге равны `null`, в неё не попадают.

Вместо этого конфиг может закончиться на `return <значение>;`, и тогда конфигом будет это значение:

```jumper
dyn ports = [25565, 25566];
return { main: ports[0], fallback: ports[1] };
```

## Что может быть в конфиге

| Можно | Нельзя |
|---|---|
| объявления переменных (с типом или `dyn`) и присваивания | циклы |
| литералы: числа, строки, `true`, `false`, `null`, таблицы, массивы | функции и лямбды |
| операторы, `?:`, `+` для строк | классы |
| `if` / `else`, `switch` | `import` |
| `return` | `try` / `throw` |
| комментарии | классы Java, встроенные функции |

Типы проверяются так же, как в скриптах: `int a = "s";` - ошибка. Всё запрещённое - синтаксическая ошибка с номером строки и столбца:

```
Syntax error: A loop is not allowed in a config (.jmc) (line 1, col 1)
```

## Вывод конфига

Командная строка «запускает» файл `.jmc`, печатая его значение:

```
java -jar jmp.jar server.jmc
{port: 25565, dev: false, maxPlayers: 100, motd: [Welcome, to the server], db: {url: jdbc:mysql://localhost/mc, pool: {min: 2, max: 10}}}
```

## Чтение конфига из Java

```java
import me.padej.jumper.interp.Config;
import me.padej.jumper.runtime.JTable;

JTable cfg = (JTable) Config.load(Path.of("server.jmc"));

int port = (Integer) cfg.get("port");                           // 25565
List<?> motd = (List<?>) cfg.get("motd");                       // [Welcome, to the server]
JTable pool = (JTable) ((JTable) cfg.get("db")).get("pool");
int max = (Integer) pool.get("max");                            // 10
```

| | |
|---|---|
| `Config.load(Path)` | прочитать и вычислить файл |
| `Config.parse(String)` | вычислить текст конфига |

Значение - это `JTable` для конфига из переменных (или то, что вернул `return`). Числа приходят как `Integer`, `Long`, `Double`, строки как `String`, массивы как `List`, таблицы как `JTable` (`get`, `has`, `keys`, `size`, `asMap`).

Конфиг, нарушающий правила, бросает `ParseError` (`me.padej.jumper.parser`), ошибка при вычислении значения бросает `JmpError`. В обоих есть номер строки.

Конфиг выполняется вообще без доступа к Java, какую бы политику хост ни использовал для скриптов, поэтому загружать конфиг, написанный кем-то другим, безопасно.
