# Getting started

Jumper needs **Java 21** or newer.

## Try it from the command line

Download `jmp.jar` from [Releases](https://github.com/jumper-lang/jumper/releases) and write `hello.jmp`:

```jumper
dyn name = "world";
println("Hello, " + name + "!");
```

Run it:

```
java -jar jmp.jar hello.jmp
```

Other ways to run code:

```
java -jar jmp.jar                      REPL: type code line by line
java -jar jmp.jar -e "println(6 * 7);"  one line of code
java -jar jmp.jar --check hello.jmp    report errors without running
```

## Add it to a Java project

Jumper is published through [JitPack](https://jitpack.io/#jumper-lang/jumper). `Tag` is a [release](https://github.com/jumper-lang/jumper/releases) tag, e.g. `v0.11.1`.

::: code-group

```kotlin [Gradle (Kotlin)]
repositories {
    mavenCentral()
    maven("https://jitpack.io")
}

dependencies {
    implementation("com.github.jumper-lang:jumper:Tag")
}
```

```groovy [Gradle (Groovy)]
repositories {
    mavenCentral()
    maven { url 'https://jitpack.io' }
}

dependencies {
    implementation 'com.github.jumper-lang:jumper:Tag'
}
```

```xml [Maven]
<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>

<dependency>
    <groupId>com.github.jumper-lang</groupId>
    <artifactId>jumper</artifactId>
    <version>Tag</version>
</dependency>
```

:::

Run a script from Java:

```java
ScriptEngine jumper = new ScriptEngineManager().getEngineByName("jumper");
jumper.put("name", "world");
jumper.eval("println(\"Hello, \" + name);");
```

To pass your objects to scripts, call the functions they declare and restrict what they may do, see [Embedding](/java/embedding) and [Access policies](/security/access-policies).

## Editors

- IntelliJ IDEA - plugin **Jumper Language** ([jumper-intellij](https://github.com/jumper-lang/jumper-intellij))
- VS Code - extension **Jumper Language** ([jumper-vscode](https://github.com/jumper-lang/jumper-vscode))
- Neovim - [jumper.nvim](https://github.com/jumper-lang/jumper.nvim)

More in [Tools](/tools/).
