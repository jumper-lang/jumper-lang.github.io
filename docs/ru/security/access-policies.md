# Политики доступа

Политика доступа (файл `.jma`) определяет, какие классы и члены Java могут использовать скрипты. Это белый список: всё, что он не открывает, закрыто. Без политики скрипту доступна вся JVM, поэтому каждому скрипту, который пишете не вы, давайте политику.

## Как написать политику

Политика пишется на Jumper и видит только `Policy`:

```jumper
// scripts.jma
Policy.allowPackage("example.jumper.api");        // API, которое хост даёт скриптам
Policy.allowClass("example.jumper.api.ScriptPlayer")
      .denyMethod("kick");                        // ...кроме кика игроков
Policy.denyClass("example.jumper.api.Players");   // внутренний учёт

Policy.allowPackage("java.util");                 // коллекции
Policy.allowPackage("java.lang");                 // String, Math, Integer...
Policy.allowMethod("java.lang.System", "currentTimeMillis");

Policy.maxTableSize(100000);                      // ни одна таблица или массив не вырастет больше
```

| Правило | Что открывает или закрывает |
|---|---|
| `allowPackage(p)`, `denyPackage(p)` | все классы пакета и его подпакетов |
| `allowClass(c)`, `denyClass(c)` | один класс; возвращает правило для его членов: `.allowMethod(m)`, `.denyMethod(m)`, `.allowField(f)`, `.denyField(f)` |
| `allowMethod(c, m)`, `denyMethod(c, m)` | один метод класса (все перегрузки) |
| `allowField(c, f)`, `denyField(c, f)` | одно поле |
| `allowModules()` | `import "file"` других скриптов ([Модули](/ru/language/modules)) |
| `maxTableSize(n)` | наибольший размер таблицы или массива, который может создать скрипт |

## Как правила сочетаются

- Правило для класса сильнее правила для его пакета; из двух правил для пакетов побеждает более длинный пакет.
- Правило для метода или поля сильнее правила для его класса. Оно действует и на тот же метод, переопределённый в подклассах: `denyMethod("Entity", "setHealth")` закрывает и `Zombie.setHealth`.
- Открытый класс открывает свои публичные члены. Член закрытого класса можно открыть отдельно (`allowMethod("java.lang.System", "currentTimeMillis")`).

## Всегда закрыто

Некоторые классы - это выход из любой песочницы. Правило для пакета их никогда не открывает, только явный `allowClass`: `java.lang.Class`, `ClassLoader`, `Runtime`, `ProcessBuilder`, `Process`, `System`, `Thread`, `ThreadGroup`, `Module`, `StackWalker`, `java.lang.reflect`, `java.lang.invoke`, `java.lang.ref`, `sun.*`, `jdk.*`, `java.security`, `javax.script`, `java.util.ServiceLoader`, исполнители из `java.util.concurrent`, `java.util.Timer` и сам Jumper.

Никогда не открываются, что бы ни говорила политика: любые члены `ClassLoader`, методы и поля, которые его возвращают, и методы `java.lang.Class`, кроме безобидных (`getName`, `isInstance`, `cast`...).

## Что происходит при нарушении

Вызов или класс, закрытый политикой, останавливает скрипт с `SecurityException: Access denied: ...` ещё до выполнения вызова. Скрипт не может это перехватить. Большинство нарушений находится уже при разборе скрипта, так что скрипт, который упоминает закрытый класс, вообще не запустится.

## Как использовать политику

Из Java:

```java
Interpreter jumper = new Interpreter().access(Access.load(Path.of("scripts.jma")));
```

Хост также может указать в своём дескрипторе, под какой политикой работают его скрипты, чтобы редакторы проверяли скрипты по ней, см. [Хосты](/ru/security/hosts).

## Чего политика не делает

Она ограничивает то, до чего скрипт может дотянуться, но не то, сколько он вычисляет. Зациклившиеся скрипты останавливайте [отменой](/ru/java/embedding#stopping), память ограничивайте через `-Xmx` JVM. Кроме `maxTableSize`, ограничений на объекты и сгенерированный код нет.
