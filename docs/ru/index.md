---
layout: home

hero:
  name: Jumper
  text: Скрипты для вашего Java-приложения
  tagline: Синтаксис Java, лёгкость Lua и песочница под вашим контролем.
  image:
    src: /logo.svg
    alt: Jumper
  actions:
    - theme: brand
      text: Быстрый старт
      link: /ru/getting-started
    - theme: alt
      text: Что такое Jumper?
      link: /ru/introduction
    - theme: alt
      text: GitHub
      link: https://github.com/jumper-lang/jumper

features:
  - icon: ☕
    title: Знакомый
    details: Синтаксис Java с необязательными типами. dyn там, где нужна свобода, int или класс там, где нужна проверка.
    link: /ru/language/basics
  - icon: 🪶
    title: Лёгкий
    details: Таблицы, массивы, замыкания и модули. Без сборки - скрипт это текстовый файл.
    link: /ru/language/tables-and-arrays
  - icon: 🔌
    title: Java под рукой
    details: import, new, методы и поля любого класса, который разрешил хост. Лямбды становятся интерфейсами Java.
    link: /ru/language/java-interop
  - icon: 🛡️
    title: Безопасный
    details: Каждый скрипт работает под политикой доступа - белым списком пакетов, классов и методов.
    link: /ru/security/access-policies
  - icon: ⚡
    title: Быстрый
    details: Интерпретатор для кода, который выполняется один раз, и компилятор в байткод JVM для горячих функций.
    link: /ru/java/embedding
  - icon: 🧰
    title: С инструментами
    details: Языковой сервер и плагины для IntelliJ IDEA, VS Code и Neovim.
    link: /ru/tools/
---

## Как это выглядит

```jumper
// welcome.jmp - хост вызывает onJoin, когда игрок заходит
dyn visits = table();

void onJoin(dyn player) {
    visits[player.name()] = (visits[player.name()] || 0) + 1;
    player.send("Welcome, " + player.name() + "! Visit " + visits[player.name()]);
    server.broadcast(player.name() + " joined");
}
```

```jumper
// scripts.jma - что скриптам можно трогать
Policy.allowPackage("example.api");
Policy.allowClass("example.api.Player").denyMethod("kick");
Policy.allowPackage("java.util");
```

```java
// хост
Interpreter jumper = new Interpreter()
        .access(Access.load(Path.of("scripts.jma")))
        .define("server", server);

Script script = jumper.script(Files.readString(Path.of("welcome.jmp")));
script.run();
script.invoke("onJoin", player);
```
