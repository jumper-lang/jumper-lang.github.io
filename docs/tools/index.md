# Tools

Everything below is in one file, `jmp.jar`, from [Releases](https://github.com/jumper-lang/jumper/releases). It needs Java 21 or newer.

## Command line

```
java -jar jmp.jar <script.jmp> [args...]   run a script; the arguments are the `args` array
java -jar jmp.jar <config.jmc>             print the value of a config
java -jar jmp.jar -e "<code>"              run code from the command line
java -jar jmp.jar                          REPL
java -jar jmp.jar --check <file>...        report all errors of the files, run nothing
java -jar jmp.jar --context <file>         the host, policy, globals and classpath found for a file
java -jar jmp.jar --lsp                    language server for editors
java -jar jmp.jar --opts                   the optimizations that can be switched off
java -jar jmp.jar --help                   this list
```

A script run from the command line has access to the whole JVM. To run it under a policy, pass one with `-Djmp.access=scripts.jma` (or the `JMP_ACCESS` environment variable):

```
java -Djmp.access=scripts.jma -jar jmp.jar welcome.jmp
```

Exit codes: `0` - done, `1` - a syntax or runtime error, `2` - the policy could not be read.

### REPL

```
java -jar jmp.jar
Jumper 0.11 (OpenJDK 64-Bit Server VM 21.0.10)
Type expressions or statements; :quit to exit, :vars to list variables.
jmp> int a = 2;
jmp> a * 3
6
```

### --check

Checks scripts, configs and policies without running them, each in its own context: a script under its host's policy, with the host's globals and classes ([Hosts](/security/hosts)). One line per problem:

```
java -jar jmp.jar --check scripts/events/*.jmp
scripts/events/err.jmp:1:9: error: Unexpected token ';'
scripts/events/err.jmp:2:1: error: Undefined variable 'foo'
scripts/events/bad.jmp:2:12: warning: Access denied: example.api.ScriptPlayer.kick (closed by the access policy)
scripts/events/bad.jmp:3:12: warning: No method 'fly' in ScriptPlayer
2 errors
```

How the context was found, when it is not certain, comes as a `file: note: ...` line.

Exit codes: `0` - no errors (warnings are allowed), `1` - errors, `2` - a file could not be read. That makes it a check for CI or a git hook.

`--check --stdin <file>` reads the text from standard input; `<file>` only says where it lives (for its context and for the report) and does not have to exist.

### --context

Prints what tools found for a file, see [Hosts](/security/hosts#context).

## Editors

All editors run the same language server, so they see the same errors as `--check` and use the same [host descriptors](/security/hosts).

| Editor | Install | Needs |
|---|---|---|
| IntelliJ IDEA | Marketplace: **Jumper Language**, or the zip from [jumper-intellij Releases](https://github.com/jumper-lang/jumper-intellij/releases) | IDEA 2025.1+ |
| VS Code | Marketplace: **Jumper Language** (`code --install-extension Padej.jumper-lang`), or the `.vsix` from [jumper-vscode Releases](https://github.com/jumper-lang/jumper-vscode/releases) | Java 21+ |
| Neovim | [jumper.nvim](https://github.com/jumper-lang/jumper.nvim): `{ "jumper-lang/jumper.nvim", lazy = false, opts = {} }` for lazy.nvim | Neovim 0.9+, Java 21+, `curl` |

Each plugin's README lists its settings (which `java`, your own `jmp.jar`, extra JVM arguments).

## Language server

For any other editor that speaks LSP:

```
java -Xss16m -cp jmp.jar me.padej.jumper.Main --lsp
```

LSP 3.17 over standard input and output. It handles `.jmp`, `.jmc` and `.jma` files and provides diagnostics as you type, hover, completion, signature help, go to definition (into Java classes too), find references, document highlight, rename, document symbols, folding, formatting, inlay hints, semantic tokens and quick fixes.

`-Xss16m` gives the parser room for deeply nested code. Whatever checked code prints goes to standard error, never into the protocol.

### Java sources

Go to definition on a Java class opens its source: the JDK's from its `src.zip`, a library's from a `name-sources.jar` next to `name.jar`; when there is none, it is decompiled with [CFR](https://www.benf.org/other/cfr/). CFR is downloaded the first time it is needed (a pinned version, checked by SHA-256) into Jumper's data folder:

| OS | Folder |
|---|---|
| Windows | `%LOCALAPPDATA%\jumper\cfr` |
| Linux, macOS | `$XDG_CACHE_HOME/jumper/cfr`, or `~/.cache/jumper/cfr` |

`-Djmp.cfr=<path to cfr.jar>` (or `JMP_CFR`) uses a CFR jar you already have, `-Djmp.cfr=off` turns decompiling off: classes without sources then open as outlines (signatures only).

The class index of jars and the opened sources live next to it (`jumper/index`, `jumper/sources`). Nothing is written into your project folders.
