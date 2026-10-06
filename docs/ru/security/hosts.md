# Хосты

Хост - это Java-приложение или плагин, который встраивает Jumper и запускает скрипты. Во время работы он всё решает сам: какие файлы загружать, какую политику применять, какие объекты давать скриптам ([Встраивание](/ru/java/embedding)). Редакторы и `jmp --check` хост не запускают, поэтому им нужно сообщить то же самое. Хост делает это дескриптором внутри своего jar.

## Дескриптор

`META-INF/jumper/host.jmc` в jar хоста (в проекте Gradle или Maven: `src/main/resources/META-INF/jumper/host.jmc`). Это [конфиг](/ru/java/configs), поэтому его чтение никогда ничего не выполняет:

```jumper
// META-INF/jumper/host.jmc
String name = "MyPlugin";                   // для сообщений; по умолчанию имя файла jar
String root = "..";                         // папка, от которой считаются пути ниже, относительно папки jar
dyn scripts = ["scripts/**/*.jmp"];         // его скрипты: глобы (* ** ?), строка или массив
String access = "scripts.jma";              // политика доступа, под которой работают эти скрипты
dyn configs = ["config.jmc"];               // его конфиги
dyn globals = { server: "example.api.ScriptServer", log: "function" };   // имена, которые он определяет для скриптов
String hooks = "example.api.ScriptEvents";  // функции, которые скрипты могут объявить, а хост будет вызывать
```

| Ключ | По умолчанию | Значение |
|---|---|---|
| `name` | имя файла jar | как хост называется в сообщениях |
| `root` | `".."` | корневая папка относительно папки jar. У jar в `server/plugins/` с `".."` корнем будет `server/` |
| `scripts` | нет | глобы его скриптов относительно корня. `*` и `?` не выходят за пределы папки, `**` проходит через папки |
| `access` | нет | файл `.jma`, под которым работают его скрипты, относительно корня |
| `configs` | нет | глобы его конфигов |
| `globals` | нет | `{ name: "type" }`: что `define` даёт скриптам. Тип - имя Java-класса или `"function"` |
| `hooks` | нет | интерфейс Java (или массив интерфейсов), методы которого - функции, которые скрипт может объявить, или таблица `{ onJoin: "a.Class#method" }`, где они перечислены по одной |

Дескриптор описывает, что делает хост, но не заставляет хост это делать. Хост по-прежнему сам вызывает `access(...)`, `define(...)` и `invoke(...)`.

## Пример

Плагин `MyPlugin.jar` с таким API:

```java
package example.api;

public interface ScriptServer { List<ScriptPlayer> players(); void broadcast(String msg); }
public interface ScriptPlayer { String name(); void heal(int hp); void kick(String reason); }
public interface ScriptEvents { void onEnable(); void onJoin(ScriptPlayer player); }
```

и дескриптором выше, на сервере с такой структурой:

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

Редактор, открывший `welcome.jmp`, теперь знает, что `server` - это `ScriptServer`, что `onJoin` реализует `ScriptEvents.onJoin` и поэтому `player` - это `ScriptPlayer` (на нём работают автодополнение и переход к определению), и что `player.kick(...)` закрыт политикой. `jmp --check` сообщает то же самое:

```
scripts/events/bad.jmp:2:12: warning: Access denied: example.api.ScriptPlayer.kick (closed by the access policy)
scripts/events/bad.jmp:3:12: warning: No method 'fly' in ScriptPlayer
```

Хук, объявленный с неправильным числом параметров, тоже попадает в отчёт:

```
warning: onJoin takes 2 parameter(s), but MyPlugin calls it with 1 - it implements ScriptEvents.onJoin(ScriptPlayer player)
```

Сторона хоста в этом же соглашении:

```java
Interpreter jumper = new Interpreter()
        .access(Access.load(root.resolve("scripts.jma")))
        .define("server", scriptServer);

Script script = jumper.script(Files.readString(root.resolve("scripts/events/welcome.jmp")));
script.run();
if (script.has("onJoin")) script.invoke("onJoin", player);
```

## Как файл находит свой хост

Для скрипта, конфига или политики инструменты ищут хосты так:

1. От папки файла вверх, не больше 8 уровней и никогда выше домашней папки пользователя, каждый jar в папке и в её непосредственных подпапках (`server/plugins/*.jar`) проверяется на наличие дескриптора.
2. Файл принадлежит хосту, глобы которого ему подходят. Если подходят два хоста, побеждает более точный глоб (с более длинным путём до первого `*` или `?`), и об этом выводится заметка.
3. Если ни один дескриптор не претендует на скрипт, его политика находится по соглашению: ближайший `*.jma` вверх от скрипта. Если в той папке их несколько, берётся тот, что назван как папка на пути (`scripts/<name>/a.jmp` использует `<name>.jma`). Корнем тогда становится папка политики. Если политика не найдена, скрипт проверяется без неё.

Classpath скрипта - это все jar под корнем (кроме `*-sources.jar`) за вычетом jar других хостов: скрипты одного плагина не видят классы другого и во время работы. `name-sources.jar` рядом с `name.jar` используется для перехода к определению.

Политики видят только `Policy`, а конфиги вообще не видят Java, поэтому classpath им не нужен.

## Как проверить, что найдено {#context}

`jmp --context <file>` печатает, что инструменты нашли для файла:

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

Проблемы в дескрипторе (неизвестный ключ, неверный тип, несуществующий файл политики) выводятся там же в виде заметок. Начинайте с этой команды, если редактор не видит ожидаемых классов или глобальных имён.
