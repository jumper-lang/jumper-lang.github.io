# Configs

A config (`.jmc` file) is Jumper cut down to data: values, variables, expressions and conditions. It is a replacement for YAML or JSON that can compute a value from another one, and it never runs anything dangerous: loops and Java are not part of the language.

## Writing a config

The top-level variables are the config:

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

Its value is the table `{port: 25565, dev: false, maxPlayers: 100, motd: [...], db: {...}}`, in declaration order. Variables that end up `null` are left out.

A config may instead end with `return <value>;`, and then that value is the config:

```jumper
dyn ports = [25565, 25566];
return { main: ports[0], fallback: ports[1] };
```

## What a config may contain

| Allowed | Not allowed |
|---|---|
| variable declarations (typed or `dyn`) and assignments | loops |
| literals: numbers, strings, `true`, `false`, `null`, tables, arrays | functions and lambdas |
| operators, `?:`, `+` on strings | classes |
| `if` / `else`, `switch` | `import` |
| `return` | `try` / `throw` |
| comments | Java classes, built-in functions |

Types are checked as in scripts: `int a = "s";` is an error. Anything not allowed is a syntax error with a line and a column:

```
Syntax error: A loop is not allowed in a config (.jmc) (line 1, col 1)
```

## Printing a config

The command line runs a `.jmc` file by printing its value:

```
java -jar jmp.jar server.jmc
{port: 25565, dev: false, maxPlayers: 100, motd: [Welcome, to the server], db: {url: jdbc:mysql://localhost/mc, pool: {min: 2, max: 10}}}
```

## Reading a config from Java

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
| `Config.load(Path)` | read and evaluate a file |
| `Config.parse(String)` | evaluate config text |

The value is a `JTable` for a config of variables (or whatever `return` gives). Numbers come as `Integer`, `Long`, `Double`; strings as `String`; arrays as a `List`; tables as `JTable` (`get`, `has`, `keys`, `size`, `asMap`).

A config that breaks the rules throws `ParseError` (`me.padej.jumper.parser`); an error while computing a value throws `JmpError`. Both carry the line.

A config runs with no access to Java at all, whatever policy the host uses for scripts, so loading a config written by someone else is safe.
