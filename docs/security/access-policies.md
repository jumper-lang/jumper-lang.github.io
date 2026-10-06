# Access policies

An access policy (`.jma` file) says which Java classes and members scripts may use. It is a whitelist: whatever it does not open is closed. Without a policy a script can use the whole JVM - give every script that comes from someone else a policy.

## Writing a policy

A policy is written in Jumper and sees only `Policy`:

```jumper
// scripts.jma
Policy.allowPackage("example.jumper.api");        // the API the host gives scripts
Policy.allowClass("example.jumper.api.ScriptPlayer")
      .denyMethod("kick");                        // ...except kicking players
Policy.denyClass("example.jumper.api.Players");   // internal bookkeeping

Policy.allowPackage("java.util");                 // collections
Policy.allowPackage("java.lang");                 // String, Math, Integer...
Policy.allowMethod("java.lang.System", "currentTimeMillis");

Policy.maxTableSize(100000);                      // no table or array grows beyond this
```

| Rule | Opens or closes |
|---|---|
| `allowPackage(p)`, `denyPackage(p)` | every class of the package and its subpackages |
| `allowClass(c)`, `denyClass(c)` | one class; returns a rule for its members: `.allowMethod(m)`, `.denyMethod(m)`, `.allowField(f)`, `.denyField(f)` |
| `allowMethod(c, m)`, `denyMethod(c, m)` | one method (all overloads) of a class |
| `allowField(c, f)`, `denyField(c, f)` | one field |
| `allowModules()` | `import "file"` of other scripts ([Modules](/language/modules)) |
| `maxTableSize(n)` | the largest table or array a script may build |

## How rules combine

- A rule for a class beats a rule for its package; of two package rules, the longer package wins.
- A rule for a method or field beats the rule for its class. It also covers the same method overridden in subclasses: `denyMethod("Entity", "setHealth")` closes `Zombie.setHealth` too.
- Opening a class opens its public members. A member of a closed class can still be opened on its own (`allowMethod("java.lang.System", "currentTimeMillis")`).

## Always closed

Some classes are ways out of any sandbox. A package rule never opens them; only an explicit `allowClass` does: `java.lang.Class`, `ClassLoader`, `Runtime`, `ProcessBuilder`, `Process`, `System`, `Thread`, `ThreadGroup`, `Module`, `StackWalker`, `java.lang.reflect`, `java.lang.invoke`, `java.lang.ref`, `sun.*`, `jdk.*`, `java.security`, `javax.script`, `java.util.ServiceLoader`, the executors of `java.util.concurrent`, `java.util.Timer`, and Jumper itself.

Never open, whatever the policy says: any member of a `ClassLoader`, methods and fields that return one, and the methods of `java.lang.Class` beyond the harmless ones (`getName`, `isInstance`, `cast`...).

## What happens on a violation

A call or a class the policy closes stops the script with `SecurityException: Access denied: ...` - before the call runs. The script cannot catch it. Most violations are found while the script is parsed, so a script that names a closed class does not start at all.

## Using a policy

From Java:

```java
Interpreter jumper = new Interpreter().access(Access.load(Path.of("scripts.jma")));
```

A host can also say in its descriptor which policy its scripts run under, so that editors check scripts against it, see [Hosts](/security/hosts).

## What a policy does not do

It limits what a script can reach, not how much it computes. Stop runaway scripts with [cancellation](/java/embedding#stopping), limit memory with the JVM's `-Xmx`. Besides `maxTableSize`, there are no limits on objects or generated code.
