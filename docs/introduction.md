# What is Jumper?

Jumper is a scripting language for the JVM with the syntax of Java and the lightness of Lua. A Java application embeds it to run scripts written by other people - plugins and mods of a server, user automation, configs with logic - and decides exactly what those scripts may touch.

```jumper
void onJoin(dyn player) {
    player.send("Welcome, " + player.name() + "!");
    server.broadcast(player.name() + " joined");
}
```

## Why Jumper

- **Familiar.** Java syntax: `if`, `for`, classes, lambdas, `import`. Types are optional - `dyn` for dynamic values, `int`, `String` or a class where you want them checked.
- **Light.** Tables (`{ x: 1 }`), arrays, functions as values, closures, modules. No build step: a script is a text file.
- **Uses Java directly.** `import java.util.HashMap;`, `new`, method calls, fields - any class the host allows.
- **Safe.** Every script runs under an [access policy](/security/access-policies) (`.jma`): a whitelist of Java packages, classes and methods. Anything not listed is closed.
- **Fast.** An interpreter for code that runs once, a compiler to JVM bytecode for hot functions.
- **Tooling.** A language server and plugins for IntelliJ IDEA, VS Code and Neovim.

## Files

| File | What it is |
|---|---|
| `.jmp` | a script |
| `.jma` | an access policy: what scripts may use from Java |
| `.jmc` | a config: values and conditions, no loops and no Java |
