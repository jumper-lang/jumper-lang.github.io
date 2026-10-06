---
layout: home

hero:
  name: Jumper
  text: Scripts for your Java application
  tagline: The syntax of Java, the lightness of Lua, and a sandbox you control.
  image:
    src: /logo.png
    alt: Jumper
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: What is Jumper?
      link: /introduction
    - theme: alt
      text: GitHub
      link: https://github.com/jumper-lang/jumper

features:
  - icon: ☕
    title: Familiar
    details: Java syntax with optional types. dyn where you want freedom, int or a class where you want checks.
    link: /language/basics
  - icon: 🪶
    title: Light
    details: Tables, arrays, closures and modules. No build step - a script is a text file.
    link: /language/tables-and-arrays
  - icon: 🔌
    title: Java at hand
    details: import, new, methods and fields of any class the host allows. Lambdas become Java interfaces.
    link: /language/java-interop
  - icon: 🛡️
    title: Safe
    details: Every script runs under an access policy - a whitelist of packages, classes and methods.
    link: /security/access-policies
  - icon: ⚡
    title: Fast
    details: An interpreter for code that runs once, a compiler to JVM bytecode for hot functions.
    link: /java/embedding
  - icon: 🧰
    title: Tooling
    details: A language server and plugins for IntelliJ IDEA, VS Code and Neovim.
    link: /tools/
---

## A taste

```jumper
// welcome.jmp - the host calls onJoin when a player joins
dyn visits = table();

void onJoin(dyn player) {
    visits[player.name()] = (visits[player.name()] || 0) + 1;
    player.send("Welcome, " + player.name() + "! Visit " + visits[player.name()]);
    server.broadcast(player.name() + " joined");
}
```

```jumper
// scripts.jma - what scripts may touch
Policy.allowPackage("example.api");
Policy.allowClass("example.api.Player").denyMethod("kick");
Policy.allowPackage("java.util");
```

```java
// the host
Interpreter jumper = new Interpreter()
        .access(Access.load(Path.of("scripts.jma")))
        .define("server", server);

Script script = jumper.script(Files.readString(Path.of("welcome.jmp")));
script.run();
script.invoke("onJoin", player);
```
