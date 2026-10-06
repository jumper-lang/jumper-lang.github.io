# Modules

A script can use the top-level names of another script file.

`utils.jmp`:

```jumper
dyn greet(name) { return "Hello, " + name; }
dyn VERSION = "1.0";
class Counter { int n; void inc() { n++; } }
```

`main.jmp`, in the same folder:

```jumper
import "utils";          // or "utils.jmp"; the path is relative to this file's folder

println(greet("modules"), VERSION);   // Hello, modules 1.0
dyn c = new Counter();
c.inc();
println(c.n);                          // 1
```

- Every top-level function, class and variable of the module becomes a name in the importing block, visible in the whole block.
- A module runs once per interpreter, however many files import it. Imports in a circle are an error.
- Imported names are constants: they cannot be assigned. Variables keep the value they had when the module ran; tables and objects are shared.
- Under an [access policy](/security/access-policies) modules are off unless the policy has `Policy.allowModules();`.

Java classes are imported differently, by name: `import java.util.HashMap;` - see [Java interop](/language/java-interop).
