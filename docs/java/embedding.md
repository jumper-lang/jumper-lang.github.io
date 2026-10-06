# Embedding

Add Jumper to the project ([Getting started](/getting-started)), then run scripts through `javax.script` or through Jumper's own `Interpreter`. The `Interpreter` is the one to use for a host that loads script files and calls their functions.

## javax.script

The engine is registered as `jumper` (also `jmp`):

```java
ScriptEngine engine = new ScriptEngineManager().getEngineByName("jumper");
engine.put("name", "world");
engine.eval("println(\"Hello, \" + name);");

engine.eval("dyn twice(x) { return x * 2; }");
Object r = ((Invocable) engine).invokeFunction("twice", 21);   // 42
```

`((JmpScriptEngine) engine).access(policy)` sets an [access policy](/security/access-policies) for it. Errors come as `ScriptException` with the file, line and column; a policy violation comes as `SecurityException`.

## Interpreter

A host gives scripts its objects, runs a script file and calls the functions it declares:

```java
import me.padej.jumper.interp.Interpreter;
import me.padej.jumper.interp.Script;
import me.padej.jumper.runtime.Access;

Interpreter jumper = new Interpreter()
        .access(Access.load(Path.of("scripts.jma")))   // what the script may use
        .define("server", server);                      // a name the script sees

Script script = jumper.script(Files.readString(Path.of("scripts/welcome.jmp")));
script.run();                                           // runs the top level

script.invoke("onJoin", player);                        // calls `void onJoin(dyn p)` of the script
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
| `define(name, value)` | a global the scripts see: an object, a value, a `JFunction`. Call it before the script is parsed |
| `access(Access)` | the access policy; before the first script |
| `script(source)` | parse a script into a `Script` |
| `eval(source)`, `evalFile(path)` | parse and run at once; the value of a top-level `return` |
| `compile(source)` | parse into a `JFunction` to run many times |
| `cancellable(true)`, `cancel()` | see below |

| `Script` | |
|---|---|
| `run()` | run the top level once |
| `invoke(name, args...)` | call a top-level function |
| `has(name)`, `names()` | which top-level names the script declares |
| `get(name)`, `set(name, value)` | read and write a top-level variable |

To reload a script, create a new `Interpreter` and run it again; the old one, with the code it generated, is freed by the garbage collector.

## Errors

| Exception | When | What it has |
|---|---|---|
| `me.padej.jumper.parser.ParseError` | the script does not parse, or a type does not fit | `getMessage()`, `line`, `col` |
| `me.padej.jumper.runtime.JmpError` | an error while running | `message()`, `line()` |
| `SecurityException` | the script used what its policy closes | `Access denied: game.Player.kick (line 10)` |

```java
try {
    script.invoke("onJoin", player);
} catch (SecurityException e) {
    // the policy stopped the script before the call ran: disable it, log, ...
} catch (JmpError e) {
    log(e.message() + " at line " + e.line());
}
```

## Stopping a script {#stopping}

A script stuck in a loop can be stopped from another thread. Turn it on before the script is parsed:

```java
Interpreter jumper = new Interpreter().cancellable(true);
// ... in another thread, e.g. a watchdog:
jumper.cancel();
```

The script stops at its next loop iteration or function call with an error `Cancelled`, which the script itself cannot catch. `clearCancel()` lets the interpreter run again.

Blocking Java calls (`Thread.sleep`, waiting on a lock) are not interrupted - close them with the access policy.

## Deep recursion

`Interpreter.runWithBigStack(() -> script.invoke("f"))` runs a call on a thread with a large stack (512 MB), for scripts that recurse deeply.

## Configs

`Config.load(Path)` reads a `.jmc` file into a table, see [Configs](/java/configs).
