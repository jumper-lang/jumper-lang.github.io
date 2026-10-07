# Отличия от Java

Jumper читается как Java, но позволяет то, чего Java не позволяет: переменные без фиксированного типа, таблицы вместо классов, функции как значения. На этой странице - список этих отличий и то, во что каждое из них превращается на JVM: Java-код, который вы написали бы для того же самого, и байткод, который Jumper генерирует на самом деле.

::: info
Ниже - байткод, который генерирует Jumper 0.11 с `-Djmp.tier1=force`, местами сокращённый. Это деталь реализации, она меняется от версии к версии; поведение, описанное в остальной документации, - нет.
:::

## Коротко

Что Jumper позволяет, а Java нет:

| Jumper | Java | На JVM |
|---|---|---|
| `dyn x = 1; x = "one";` | `Object x` и приведения | локальная `Object`; примитивная локальная, если в неё кладут только один числовой тип ([ниже](#dyn)) |
| `{ x: 1, name: "a" }` | `Map` или класс, написанный под данные | таблица с формой; литерал - экземпляр сгенерированного класса с настоящими полями ([ниже](#таблицы)) |
| `dyn pair(a, b)` - параметры без типов | `Object a, Object b` | параметры `Object` |
| `pair(1)` - меньше или больше аргументов | ошибка компиляции | недостающий аргумент - `null`, лишние отбрасываются |
| замыкание меняет внешнюю переменную (`n++`) | захваченные переменные должны быть effectively final | захваченные переменные живут во фрейме в куче ([ниже](#замыкания)) |
| `if (list)`, `name \|\| "guest"` | в условии только `boolean` | ложны только `null` и `false`; `\|\|` возвращает операнд |
| `"a" == s` сравнивает текст | `==` сравнивает ссылки | строки и массивы - по содержимому, таблицы и объекты - по ссылке |
| `s[0]`, `s.length`, `date.time` | `s.charAt(0)`, `s.length()`, `date.getTime()` | определяется при связывании места вызова |
| `xs.add(4)`, `xs[xs.length] = 5` для `[1, 2, 3]` | `ArrayList` | массив скрипта - это `java.util.List` |
| инструкции на верхнем уровне, вызов функции выше её объявления | `class Main`, `main` | верхний уровень - отдельная функция |
| `throw { code: 404 }`, `catch (e)` | только `Throwable`, `catch` с типом | бросить можно любое значение |

Что есть в Java и нет в Jumper: перегрузка функций скрипта, generics, приведения (`(int) x` - используйте `int(x)`), неявное сужение, `char`, метки, проваливание в `switch`, модификаторы доступа, вложенные классы, больше одного конструктора, класс скрипта, наследующий Java-класс (интерфейс Java реализуется передачей функции), checked-исключения, статические импорты.

## Как выполняется скрипт

Скрипт начинает работу в **Tier 0** - интерпретаторе по синтаксическому дереву. Функция компилируется в байткод JVM (**Tier 1**) при первом вызове, если в ней есть цикл, иначе при третьем. Каждая функция становится отдельным классом `Fn<N>_<имя>`, код лежит в методе `body` с объявленными типами параметров и результата. Дальше JIT виртуальной машины компилирует этот байткод в машинный код, как любой Java-метод.

Сгенерированные классы живут в отдельном загрузчике, одном на `Interpreter`, и выгружаются вместе с ним (кроме классов литералов таблиц - они общие на процесс).

## Типизированный код - это Java

Когда всё типизировано, байткод такой же, какой выдаёт `javac`:

::: code-group

```jumper [Jumper]
int sum(int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += i;
    return s;
}
```

```java [Эквивалент на Java]
static int sum(int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += i;
    return s;
}
```

```text [Байткод]
public static int body(int);
   0: iconst_0          // локальные инициализируются заранее
   ...
   8: iload_2           // i
   9: iload_0           // n
  10: if_icmpge 23
  13: iload_1
  14: iload_2
  15: iadd              // s += i
  16: istore_1
  17: iinc 2, 1         // i++
  20: goto 8
  23: iload_1
  24: ireturn
```

:::

Вызов такой функции из другой скомпилированной - обычный `invokestatic`, который JVM может встроить. Типы стоит писать там, где код горячий; больше ничего менять не нужно.

## dyn

Переменная `dyn` хранит любое значение и может менять тип. Но Jumper не делает каждую `dyn` объектом `Object`: он смотрит, что в неё кладут.

### Всегда один тип - примитив

Если во всех записях в локальную `dyn` попадает `int` (или во всех - `double`...), она живёт в примитивной локальной JVM, и код получается тот же, что для `int`:

::: code-group

```jumper [Jumper]
dyn sum(int n) {
    dyn s = 0;
    for (dyn i = 0; i < n; i++) s += i;
    return s;
}
```

```java [Эквивалент на Java]
static Object sum(int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += i;
    return s;               // упаковка один раз, при возврате
}
```

```text [Байткод]
public static java.lang.Object body(int);
  ...
  20: iload_2           // i
  21: iload_0           // n
  22: if_icmplt 29
  ...
  33: iload_1
  34: iload_2
  35: iadd              // s += i, без упаковки
  36: istore_1
  37: iinc 2, 1
  40: goto 20
  43: iload_1
  44: invokestatic Ops.box:(I)Ljava/lang/Object;
  47: areturn
```

:::

Тип результата - `dyn`, поэтому результат упаковывается один раз в конце. Внутри цикла нет ни одной аллокации.

### Тип меняется - две половины и флаг

Локальная `dyn`, в которой почти всегда число, но не всегда, получает две локальные JVM - половину `Object` и примитивную половину - и флаг, какая из них сейчас живая. Арифметика остаётся в примитивной половине, пока это возможно:

::: code-group

```jumper [Jumper]
dyn mixed(flag) {
    dyn x = 1;
    if (flag) x = "one";
    return x + 1;
}
```

```java [Эквивалент на Java]
static Object mixed(Object flag) {
    Object xObj = null;
    int xInt = 1;
    boolean isInt = true;
    if (Ops.truthy(flag)) {
        xObj = "one";
        isInt = false;
    }
    return Ops.add(isInt ? Integer.valueOf(xInt) : xObj, 1);
}
```

```text [Байткод]
public static java.lang.Object body(java.lang.Object);
   0: aconst_null
   1: astore_1          // x, половина Object
   ...
   7: istore_2          // x, половина int = 1
   9: istore_3          // флаг: живая половина int
  10: aload_0
  11: invokestatic Ops.truthy:(Ljava/lang/Object;)Z
  14: ifeq 41
  17: ldc "one"
  20: instanceof java/lang/Integer   // Integer остался бы в половине int
  23: ifeq 38
  ...
  38: astore_1          // строка - в половину Object
  39: iconst_0
  40: istore_3
  41: iload_3
  42: ifeq 52
  45: iload_2
  46: invokestatic Ops.box:(I)Ljava/lang/Object;
  ...
  57: invokestatic Ops.add:(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
  60: areturn
```

:::

### Тип неизвестен - решает рантайм

Там, где тип нельзя узнать до запуска - параметр `dyn`, значение из таблицы, - операция становится вызовом рантайма (`Ops.add`, `Ops.lt`, `Ops.truthy`...). Он смотрит на значения и делает то, что говорит язык: `int + int` - это `int`, `int + double` - `double`, что угодно `+` строка - строка, неподходящее сочетание - ошибка со строкой скрипта.

```jumper
dyn sum(n) {                 // у n нет типа
    dyn s = 0;
    for (dyn i = 0; i < n; i++) s += i;
    return s;
}
```

Здесь `s` и `i` по-прежнему примитивные (`iadd`, `iinc`), но `i < n` компилируется в `Ops.lt(box(i), n)`, потому что `n` может быть чем угодно. Если указать тип параметра (`int n`), сравнение станет `if_icmplt`.

## Таблицы

Таблица сопоставляет ключам значения, как `Map`, и ключи можно добавлять и удалять когда угодно. Но хранится она не как `HashMap`.

### Формы

У каждой таблицы есть **форма**: список её ключей по порядку, общий для всех таблиц, получивших те же ключи в том же порядке. Добавление ключа переводит таблицу в следующую форму (`[x]` → `[x, vx]` → `[x, vx, name]`); переходы кэшируются, поэтому десять тысяч таблиц, созданных одним литералом, делят одну форму. Код, который читает `p.x`, запоминает «в этой форме `x` - слот 0» и дальше читает слот напрямую. Так же работают JavaScript-движки браузеров, там это называется *hidden classes*.

Таблица, у которой больше 64 ключей или из которой удалили ключ (`t.k = null`), переходит в обычную хеш-таблицу и уходит с этого быстрого пути.

### Литерал - это класс

Для литерала Jumper генерирует класс с полем на каждый ключ, типизированным по значению, которое туда положили первым:

::: code-group

```jumper [Jumper]
dyn make() {
    return { x: 0.0, vx: 1.5, name: "ball" };
}
```

```java [Эквивалент на Java]
final class Ball {          // генерируется как Lay0
    double x;
    double vx;
    Object name;
}

static Object make() {
    Ball b = new Ball();
    b.x = 0.0; b.vx = 1.5; b.name = "ball";
    return b;
}
```

```text [Сгенерированный класс]
public final class Lay0 extends JTable$Lean {
  public double p0;         // x
  public double p1;         // vx
  public java.lang.Object o2;   // name
  public static double get0(java.lang.Object);
  public static void set0(java.lang.Object, double);
  ...
}
```

:::

Литерал - одна аллокация, поля `double` не упакованы. Тип слота - догадка, а не обещание: если позже записать в `x` строку, слот снова станет `Object`, и таблица продолжит работать.

### Чтение и запись полей

Чтение поля вне циклов - место вызова `invokedynamic`, которое само привязывается к «это та форма? читаем `p0`»:

```text
public static java.lang.Object body(java.lang.Object);   // dyn name(p) { return p.name; }
  0: aload_0
  1: invokedynamic get:(Ljava/lang/Object;)Ljava/lang/Object;
  6: areturn
```

Там, где инструкции только считают над полями, Jumper проверяет форму каждой таблицы один раз на всю группу инструкций и дальше работает с полями напрямую. Вторая ветка - общая, для таблицы другой формы:

::: code-group

```jumper [Jumper]
dyn move(p, int steps) {
    for (int i = 0; i < steps; i++) {
        p.x += p.vx;
    }
    return p.x;
}
```

```java [Эквивалент на Java]
// Ops.get / Ops.set - общий путь (поиск ключа с кэшем)
static Object move(Object p, int steps) {
    for (int i = 0; i < steps; i++) {
        if (p instanceof Ball b) {      // проверка формы
            b.x += b.vx;                // обычные поля double
        } else {
            Ops.set(p, "x", Ops.add(Ops.get(p, "x"), Ops.get(p, "vx")));
        }
    }
    return Ops.get(p, "x");
}
```

```text [Байткод]
public static java.lang.Object body(java.lang.Object, int);
  ...
  20: invokedynamic guard:(Ljava/lang/Object;)Z    // p - это Lay0 с формой [x, vx, name]?
  25: ifeq 50
  28: aload_3
  29: aload_3
  30: invokedynamic get:(Ljava/lang/Object;)D      // p.x, double
  35: aload_3
  36: invokedynamic get:(Ljava/lang/Object;)D      // p.vx
  41: dadd
  42: invokedynamic set:(Ljava/lang/Object;D)V     // p.x = ...
  47: goto 98
  50: ...                                          // любая другая таблица
  63: invokestatic Ops.memberGet:(Ljava/lang/Object;Lme/padej/jumper/runtime/FieldCache;)Ljava/lang/Object;
  ...
  78: invokestatic Ops.add:(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
  ...
  95: invokestatic Ops.memberSet:(Ljava/lang/Object;Lme/padej/jumper/runtime/FieldCache;Ljava/lang/Object;)V
```

:::

После привязки места `invokedynamic` становятся прямыми обращениями к полям, и JVM их встраивает: быстрая ветка в итоге - два чтения, сложение и запись.

## Классы

Класс скрипта компилируется в класс JVM с настоящими типизированными полями. Методы - статические методы, которые получают объект первым параметром:

::: code-group

```jumper [Jumper]
class Point {
    int x;
    int y;
    Point(int x, int y) { this.x = x; this.y = y; }
    int sum() { return x + y; }
}
```

```java [Эквивалент на Java]
class Point {
    int x;
    int y;
    Point(int x, int y) { this.x = x; this.y = y; }
    int sum() { return x + y; }
}
```

```text [Байткод]
public class Inst0_Point extends JTable {
  public int f0;            // x
  public int f1;            // y
}

// int sum()
public static int body(java.lang.Object);
   4: aload_1
   5: instanceof Inst0_Point
   8: ifeq 21
  11: aload_1
  12: checkcast Inst0_Point
  15: getfield Inst0_Point.f0:I       // x
  ...
  46: getfield Inst0_Point.f1:I       // y
  64: iadd
  65: ireturn
```

:::

`new Point(i, 1)`, когда класс известен, создаёт `Inst0_Point` на месте и вызывает `body` конструктора напрямую. Ветка с `instanceof` нужна для объектов, хранящихся общим способом (с `-Djmp.genclass=0` или у класса, чей родитель объявлен в другом файле); для `Inst0_Point` это одна проверка типа.

## Замыкания

Лямбда в Java может только читать локальные переменные, которые не меняются. Функция Jumper может их менять, поэтому захваченная переменная переезжает со стека JVM во фрейм в куче:

::: code-group

```jumper [Jumper]
dyn counter() {
    int n = 0;
    return () -> { n++; return n; };
}
```

```java [Эквивалент на Java]
static Supplier<Object> counter() {
    int[] n = { 0 };                  // фрейм
    return () -> { n[0]++; return n[0]; };
}
```

```text [Байткод]
// counter
   2: new Frame                        // фрейм для захваченной n
  ...
  17: getfield Frame.p:[J               // n живёт в примитивных слотах фрейма
  23: lastore
  24: new FunctionNode$ScriptFunction  // лямбда: код + этот фрейм
  ...
  40: areturn

// лямбда
   3: getfield CompiledFunction.closure:Lme/padej/jumper/interp/Frame;
   6: getfield Frame.p:[J
  10: laload                           // прочитать n
  ...
  25: lastore                          // n = n + 1
```

:::

Во фрейм уходят только захваченные переменные, остальные остаются локальными JVM. Функции как значения - объекты `ScriptFunction`; если передать такую функцию в Java-метод, который ждёт функциональный интерфейс (`Runnable`, `Comparator`...), она оборачивается в его реализацию.

## Вызовы Java

Вызов Java-метода - место вызова `invokedynamic`. При первом вызове оно находит метод по классу получателя и типам аргументов - и проверяет [политику доступа](/ru/security/access-policies), - затем привязывается к нему с проверкой класса получателя:

::: code-group

```jumper [Jumper]
dyn collect(dyn list, int n) {
    for (int i = 0; i < n; i++) list.add(i);
    return list.size();
}
```

```java [Эквивалент на Java]
static Object collect(Object list, int n) {
    for (int i = 0; i < n; i++) ((List) list).add(i);
    return ((List) list).size();
}
```

```text [Байткод]
public static java.lang.Object body(java.lang.Object, int);
  ...
   9: aload_0
  10: iload_2
  11: invokedynamic add:(Ljava/lang/Object;I)Ljava/lang/Object;   // i передаётся как int
  ...
  24: invokedynamic size:(Ljava/lang/Object;)Ljava/lang/Object;
  29: areturn
```

:::

То же самое происходит, когда у получателя Java-тип (`ArrayList list`): политика проверяется один раз, при привязке места, а не при каждом вызове. Место, к которому пришёл получатель нового класса, привязывается заново (и снова проверяет политику).

## Как посмотреть самому

```
JMP_DUMP=out java -Djmp.tier1=force -jar jmp.jar script.jmp    # сгенерированные классы в out/
javap -c -p out/Fn1_sum.class                                   # байткод
JMP_DEBUG=1 java -jar jmp.jar script.jmp                        # что скомпилировано, привязано, защищено
java -jar jmp.jar --opts                                        # оптимизации, которые можно выключить
```

В Windows переменную сначала задают отдельно: `set JMP_DUMP=out`.

Любую оптимизацию можно выключить (`-Djmp.unbox=0`, `-Djmp.layout=0`...), результаты будут те же, только медленнее.
