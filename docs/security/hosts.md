# Hosts

A host is the Java application or plugin that embeds Jumper and runs scripts. At run time it decides everything itself: which files it loads, which policy it applies, which objects it gives scripts ([Embedding](/java/embedding)). Editors and `jmp --check` do not run the host, so they need to be told the same things. The host tells them with a descriptor inside its jar.

## The descriptor

`META-INF/jumper/host.jmc` in the host's jar (in a Gradle or Maven project: `src/main/resources/META-INF/jumper/host.jmc`). It is a [config](/java/configs), so reading it never runs anything:

```jumper
// META-INF/jumper/host.jmc
String name = "MyPlugin";                   // for messages; default: the jar's file name
String root = "..";                         // the folder the paths below are relative to, from the jar's folder
dyn scripts = ["scripts/**/*.jmp"];         // its scripts: globs (* ** ?), one string or an array
String access = "scripts.jma";              // the access policy those scripts run under
dyn configs = ["config.jmc"];               // its configs
dyn globals = { server: "example.api.ScriptServer", log: "function" };   // the names it defines for scripts
String hooks = "example.api.ScriptEvents";  // the functions scripts may declare for the host to call
```

| Key | Default | Meaning |
|---|---|---|
| `name` | the jar's file name | how messages call the host |
| `root` | `".."` | the root folder, relative to the jar's folder. A jar in `server/plugins/` with `".."` has the root `server/` |
| `scripts` | none | globs of its scripts, relative to the root. `*` and `?` stay within a folder, `**` crosses folders |
| `access` | none | the `.jma` file its scripts run under, relative to the root |
| `configs` | none | globs of its configs |
| `globals` | none | `{ name: "type" }`: what `define` gives scripts. The type is a Java class name or `"function"` |
| `hooks` | none | a Java interface (or an array of them) whose methods are functions a script may declare, or a table `{ onJoin: "a.Class#method" }` naming them one by one |

The descriptor describes what the host does; it does not make the host do it. The host still calls `access(...)`, `define(...)` and `invoke(...)` itself.

## Example

A plugin `MyPlugin.jar` with this API:

```java
package example.api;

public interface ScriptServer { List<ScriptPlayer> players(); void broadcast(String msg); }
public interface ScriptPlayer { String name(); void heal(int hp); void kick(String reason); }
public interface ScriptEvents { void onEnable(); void onJoin(ScriptPlayer player); }
```

and the descriptor above, on a server laid out like this:

```
server/
  plugins/
    MyPlugin.jar          <- META-INF/jumper/host.jmc
  scripts/
    events/
      welcome.jmp
  scripts.jma
  config.jmc
```

`scripts.jma`:

```jumper
Policy.allowPackage("example.api");
Policy.allowClass("example.api.ScriptPlayer").denyMethod("kick");
Policy.allowPackage("java.util");
```

`scripts/events/welcome.jmp`:

```jumper
void onJoin(dyn player) {
    player.heal(5);
    server.broadcast("Welcome, " + player.name());
}
```

An editor opening `welcome.jmp` now knows that `server` is a `ScriptServer`, that `onJoin` implements `ScriptEvents.onJoin`, so `player` is a `ScriptPlayer` (completion and go to definition work on it), and that `player.kick(...)` is closed by the policy. `jmp --check` reports the same:

```
scripts/events/bad.jmp:2:12: warning: Access denied: example.api.ScriptPlayer.kick (closed by the access policy)
scripts/events/bad.jmp:3:12: warning: No method 'fly' in ScriptPlayer
```

A hook declared with the wrong number of parameters is reported too:

```
warning: onJoin takes 2 parameter(s), but MyPlugin calls it with 1 - it implements ScriptEvents.onJoin(ScriptPlayer player)
```

The host's side of the same contract:

```java
Interpreter jumper = new Interpreter()
        .access(Access.load(root.resolve("scripts.jma")))
        .define("server", scriptServer);

Script script = jumper.script(Files.readString(root.resolve("scripts/events/welcome.jmp")));
script.run();
if (script.has("onJoin")) script.invoke("onJoin", player);
```

## How a file finds its host

For a script, config or policy, tools look for hosts like this:

1. From the file's folder up, at most 8 levels and never above the user's home folder, every jar in a folder and in its direct subfolders (`server/plugins/*.jar`) is checked for a descriptor.
2. The host whose globs match the file owns it. If two hosts match, the more specific glob wins (the one with the longer path before its first `*` or `?`), and a note says so.
3. If no descriptor claims a script, its policy is found by convention: the nearest `*.jma` up from the script. If that folder has several, the one named like a folder on the way (`scripts/<name>/a.jmp` uses `<name>.jma`). The root is then the policy's folder. With no policy found, the script is checked without one.

The classpath for a script is every jar under the root (`*-sources.jar` excluded) minus the jars of other hosts: one plugin's scripts do not see another plugin's classes at run time either. A `name-sources.jar` next to `name.jar` is used for go to definition.

Policies see only `Policy` and configs see no Java at all, so neither needs a classpath.

## Checking what was found {#context}

`jmp --context <file>` prints what tools found for a file:

```
java -jar jmp.jar --context scripts/events/welcome.jmp
scripts/events/welcome.jmp
  kind:      script
  root:      /srv/server
  host:      MyPlugin (/srv/server/plugins/MyPlugin.jar)
  access:    /srv/server/scripts.jma
  globals:   {server=example.api.ScriptServer, log=function}
  hooks:     example.api.ScriptEvents
  classpath: 1 jar
             /srv/server/plugins/MyPlugin.jar
```

Problems in a descriptor (an unknown key, a wrong type, a policy file that does not exist) are listed there as notes. Use it first when an editor does not see the classes or globals you expect.
