# Инструменты

Всё, что описано ниже, находится в одном файле `jmp.jar` из [релизов](https://github.com/jumper-lang/jumper/releases). Нужна Java 21 или новее.

## Командная строка

```
java -jar jmp.jar <script.jmp> [args...]   запустить скрипт; аргументы доступны как массив `args`
java -jar jmp.jar <config.jmc>             напечатать значение конфига
java -jar jmp.jar -e "<code>"              выполнить код из командной строки
java -jar jmp.jar                          REPL
java -jar jmp.jar --check <file>...        показать все ошибки файлов, ничего не запуская
java -jar jmp.jar --context <file>         хост, политика, глобальные имена и classpath файла
java -jar jmp.jar --lsp                    языковой сервер для редакторов
java -jar jmp.jar --opts                   оптимизации, которые можно выключить
java -jar jmp.jar --help                   этот список
```

Скрипт, запущенный из командной строки, имеет доступ ко всей JVM. Чтобы запустить его под политикой, передайте её через `-Djmp.access=scripts.jma` (или переменную окружения `JMP_ACCESS`):

```
java -Djmp.access=scripts.jma -jar jmp.jar welcome.jmp
```

Коды выхода: `0` - готово, `1` - синтаксическая ошибка или ошибка выполнения, `2` - не удалось прочитать политику.

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

Проверяет скрипты, конфиги и политики без запуска, каждый файл в своём контексте: скрипт под политикой своего хоста, с глобальными именами и классами хоста ([Хосты](/ru/security/hosts)). Одна строка на каждую проблему:

```
java -jar jmp.jar --check scripts/events/*.jmp
scripts/events/err.jmp:1:9: error: Unexpected token ';'
scripts/events/err.jmp:2:1: error: Undefined variable 'foo'
scripts/events/bad.jmp:2:12: warning: Access denied: example.api.ScriptPlayer.kick (closed by the access policy)
scripts/events/bad.jmp:3:12: warning: No method 'fly' in ScriptPlayer
2 errors
```

Если контекст найден не наверняка, об этом сообщает строка `file: note: ...`.

Коды выхода: `0` - ошибок нет (предупреждения допускаются), `1` - есть ошибки, `2` - файл не удалось прочитать. Поэтому команду удобно использовать как проверку в CI или в git-хуке.

`--check --stdin <file>` читает текст со стандартного ввода. `<file>` только указывает, где файл находится (для контекста и отчёта), и может не существовать.

### --context

Показывает, что инструменты нашли для файла, см. [Хосты](/ru/security/hosts#context).

## Редакторы

Все редакторы используют один и тот же языковой сервер, поэтому видят те же ошибки, что и `--check`, и те же [дескрипторы хостов](/ru/security/hosts).

| Редактор | Установка | Требования |
|---|---|---|
| IntelliJ IDEA | Marketplace: **Jumper Language** или zip из [релизов jumper-intellij](https://github.com/jumper-lang/jumper-intellij/releases) | IDEA 2025.1+ |
| VS Code | Marketplace: **Jumper Language** (`code --install-extension Padej.jumper-lang`) или `.vsix` из [релизов jumper-vscode](https://github.com/jumper-lang/jumper-vscode/releases) | Java 21+ |
| Neovim | [jumper.nvim](https://github.com/jumper-lang/jumper.nvim): `{ "jumper-lang/jumper.nvim", lazy = false, opts = {} }` для lazy.nvim | Neovim 0.9+, Java 21+, `curl` |

Настройки каждого плагина (какую `java` использовать, свой `jmp.jar`, дополнительные аргументы JVM) описаны в его README.

## Языковой сервер

Для любого другого редактора с поддержкой LSP:

```
java -Xss16m -cp jmp.jar me.padej.jumper.Main --lsp
```

LSP 3.17 через стандартный ввод и вывод. Сервер работает с файлами `.jmp`, `.jmc` и `.jma` и умеет: диагностику по мере ввода, подсказки при наведении, автодополнение, подсказки сигнатур, переход к определению (в том числе в классы Java), поиск использований, подсветку вхождений, переименование, структуру документа, сворачивание, форматирование, inlay-подсказки, семантическую подсветку и быстрые исправления.

`-Xss16m` даёт парсеру место для глубоко вложенного кода. Всё, что печатает проверяемый код, уходит в стандартный поток ошибок и никогда не попадает в протокол.

### Исходники Java

Переход к определению Java-класса открывает его исходник: для JDK из `src.zip`, для библиотеки из `name-sources.jar` рядом с `name.jar`. Если исходников нет, класс декомпилируется через [CFR](https://www.benf.org/other/cfr/). CFR скачивается при первой необходимости (фиксированная версия, проверяется по SHA-256) в папку данных Jumper:

| ОС | Папка |
|---|---|
| Windows | `%LOCALAPPDATA%\jumper\cfr` |
| Linux, macOS | `$XDG_CACHE_HOME/jumper/cfr` или `~/.cache/jumper/cfr` |

`-Djmp.cfr=<путь к cfr.jar>` (или `JMP_CFR`) использует уже имеющийся CFR, `-Djmp.cfr=off` выключает декомпиляцию: классы без исходников тогда открываются как набросок (только сигнатуры).

Индекс классов из jar и открытые исходники лежат рядом (`jumper/index`, `jumper/sources`). В папки проекта ничего не записывается.
