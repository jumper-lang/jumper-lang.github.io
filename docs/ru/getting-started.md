# Быстрый старт

Для Jumper нужна **Java 21** или новее.

## Попробовать из командной строки

Скачайте `jmp.jar` из [релизов](https://github.com/jumper-lang/jumper/releases) и напишите `hello.jmp`:

```jumper
dyn name = "world";
println("Hello, " + name + "!");
```

Запустите:

```
java -jar jmp.jar hello.jmp
```

Другие способы запустить код:

```
java -jar jmp.jar                      REPL: ввод кода строка за строкой
java -jar jmp.jar -e "println(6 * 7);"  одна строка кода
java -jar jmp.jar --check hello.jmp    показать ошибки, ничего не запуская
```

## Подключить к Java-проекту

Jumper публикуется через [JitPack](https://jitpack.io/#jumper-lang/jumper). `Tag` - это тег [релиза](https://github.com/jumper-lang/jumper/releases), например `v0.11.1`.

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

Запустить скрипт из Java:

```java
ScriptEngine jumper = new ScriptEngineManager().getEngineByName("jumper");
jumper.put("name", "world");
jumper.eval("println(\"Hello, \" + name);");
```

Как передать скриптам свои объекты, вызывать объявленные в них функции и ограничить их возможности, описано в разделах [Встраивание](/ru/java/embedding) и [Политики доступа](/ru/security/access-policies).

## Редакторы

- IntelliJ IDEA - плагин **Jumper Language** ([jumper-intellij](https://github.com/jumper-lang/jumper-intellij))
- VS Code - расширение **Jumper Language** ([jumper-vscode](https://github.com/jumper-lang/jumper-vscode))
- Neovim - [jumper.nvim](https://github.com/jumper-lang/jumper.nvim)

Подробнее в разделе [Инструменты](/ru/tools/).
