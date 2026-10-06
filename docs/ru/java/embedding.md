# Встраивание

Подключите Jumper к проекту ([Быстрый старт](/ru/getting-started)) и запускайте скрипты через `javax.script` или через собственный `Interpreter` Jumper. Для хоста, который загружает файлы скриптов и вызывает их функции, подходит `Interpreter`.

## javax.script

Движок зарегистрирован под именем `jumper` (а также `jmp`):

```java
ScriptEngine engine = new ScriptEngineManager().getEngineByName("jumper");
engine.put("name", "world");
engine.eval("println(\"Hello, \" + name);");

engine.eval("dyn twice(x) { return x * 2; }");
Object r = ((Invocable) engine).invokeFunction("twice", 21);   // 42
```

`((JmpScriptEngine) engine).access(policy)` задаёт для него [политику доступа](/ru/security/access-policies). Ошибки приходят как `ScriptException` с файлом, строкой и столбцом, нарушение политики - как `SecurityException`.

## Interpreter

Хост передаёт скриптам свои объекты, запускает файл скрипта и вызывает объявленные в нём функции:

```java
import me.padej.jumper.interp.Interpreter;
import me.padej.jumper.interp.Script;
import me.padej.jumper.runtime.Access;

Interpreter jumper = new Interpreter()
        .access(Access.load(Path.of("scripts.jma")))   // что скрипту можно использовать
        .define("server", server);                      // имя, которое видит скрипт

Script script = jumper.script(Files.readString(Path.of("scripts/welcome.jmp")));
script.run();                                           // выполняет верхний уровень

script.invoke("onJoin", player);                        // вызывает `void onJoin(dyn p)` из скрипта
```

`welcome.jmp`:

```jumper
dyn visits = table();

void onJoin(dyn p) {
    visits[p.name()] = (visits[p.name()] || 0) + 1;
    p.send("Welcome, " + p.name() + "! Visit " + visits[p.name()]);
    server.broadcast(p.name() + " joined");
}
```

| `Interpreter` | |
|---|---|
| `define(name, value)` | глобальное имя для скриптов: объект, значение, `JFunction`. Вызывайте до разбора скрипта |
| `access(Access)` | политика доступа; до первого скрипта |
| `script(source)` | разобрать скрипт в `Script` |
| `eval(source)`, `evalFile(path)` | разобрать и сразу выполнить; результат - значение `return` верхнего уровня |
| `compile(source)` | разобрать в `JFunction`, чтобы запускать много раз |
| `cancellable(true)`, `cancel()` | см. ниже |

| `Script` | |
|---|---|
| `run()` | выполнить верхний уровень один раз |
| `invoke(name, args...)` | вызвать функцию верхнего уровня |
| `has(name)`, `names()` | какие имена верхнего уровня объявляет скрипт |
| `get(name)`, `set(name, value)` | прочитать и записать переменную верхнего уровня |

Чтобы перезагрузить скрипт, создайте новый `Interpreter` и запустите скрипт заново. Старый интерпретатор вместе со сгенерированным кодом освободит сборщик мусора.

## Ошибки

| Исключение | Когда | Что в нём есть |
|---|---|---|
| `me.padej.jumper.parser.ParseError` | скрипт не разбирается или тип не подходит | `getMessage()`, `line`, `col` |
| `me.padej.jumper.runtime.JmpError` | ошибка во время выполнения | `message()`, `line()` |
| `SecurityException` | скрипт использовал то, что закрыто политикой | `Access denied: game.Player.kick (line 10)` |

```java
try {
    script.invoke("onJoin", player);
} catch (SecurityException e) {
    // политика остановила скрипт до вызова: отключить его, записать в лог...
} catch (JmpError e) {
    log(e.message() + " at line " + e.line());
}
```

## Остановка скрипта {#stopping}

Скрипт, застрявший в цикле, можно остановить из другого потока. Включите это до разбора скрипта:

```java
Interpreter jumper = new Interpreter().cancellable(true);
// ... в другом потоке, например в сторожевом таймере:
jumper.cancel();
```

Скрипт остановится на следующей итерации цикла или вызове функции с ошибкой `Cancelled`, которую сам скрипт перехватить не может. `clearCancel()` снова разрешает интерпретатору работать.

Блокирующие вызовы Java (`Thread.sleep`, ожидание блокировки) не прерываются, закрывайте их политикой доступа.

## Глубокая рекурсия

`Interpreter.runWithBigStack(() -> script.invoke("f"))` выполняет вызов в потоке с большим стеком (512 МБ), для скриптов с глубокой рекурсией.

## Конфиги

`Config.load(Path)` читает файл `.jmc` в таблицу, см. [Конфиги](/ru/java/configs).
