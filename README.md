<!--#region:intro-->
# ECMAScript class static initialization blocks

Class `static` blocks provide a mechanism to perform additional static initialization during class 
definition evaluation.

This is not intended as a replacement for public fields, as they provide useful information for 
static analysis tools and are a valid target for decorators. Rather, this is intended to augment
existing use cases and make enable new use cases not currently handled by that proposal.

* [Stage 0 Presentation](https://docs.google.com/presentation/d/1TLFrhKMW2UHlHIcjKN02cEJsSq4HL7odS6TE6M-OGYg/edit?usp=sharing)

<!--#endregion:intro-->

<!--#region:status-->
## Status

**Stage:** 1  
**Champion:** Ron Buckton (@rbuckton)  

_For detailed status of this proposal see [TODO](#todo), below._  
<!--#endregion:status-->

<!--#region:authors-->
## Authors

* Ron Buckton (@rbuckton)  
<!--#endregion:authors-->

<!--#region:motivations-->
# Motivations

The current proposals for static fields and static private fields provide a mechanism to perform
per-field initialization of the static-side of a class during ClassDefinitionEvaluation, however 
there are some cases that cannot be covered easily. For example, if you need to evaluate statements
during initialization (such as `try..catch`), you have to perform that logic outside of the class
definition. 

```js
// without static blocks:
class C {
  static x = ...;
  static y;
}

try {
  C.y = doSomethingWith(C.x);
}
catch {
  C.y = ...;
}

// with static blocks:
class C {
  static x = ...;
  static y;
  static {
    try {
      this.y = doSomethingWith(this.x);
    }
    catch {
      this.y = ...;
    }
  }
}
```

In addition, there are cases where information sharing needs to occur between a class with an 
instance private field and another class or function declared in the same scope.

Static blocks provide an opportunity to evaluate statements in the context of the current class 
declaration, with privileged access to private state (be they instance-private or static-private):

```js
let getX;

export class C {
  #x
  constructor(x) {
    this.#x = { data: x };
  }

  static {
    // getX has privileged access to #x
    getX = (obj) => obj.#x;
  }
}

export function readXData(obj) {
  return getX(obj).data;
}
```

<!--#endregion:motivations-->

<!--#region:prior-art-->
# Prior Art 

- C#: [Static Constructors](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/static-constructors)  
- Java: [Static Initializers](https://docs.oracle.com/javase/specs/jls/se10/html/jls-8.html#jls-8.7)
<!--#endregion:prior-art-->

<!--#region:syntax-->
# Syntax

```js
class C {
  static {
    // statements
  }
}
```
<!--#endregion:syntax-->

<!--#region:semantics-->
# Semantics

- A `static {}` block creates a new lexical scope (e.g. `var`, `function`, and block-scoped 
  declarations are local to the `static {}` block. This lexical scope is nested within the lexical 
  scope of the class body (granting privileged access to instance private state for the class). 
- A class may have at most one `static {}` block in its class body. 
- A `static {}` block is evaluated immediately after all public static field initializers have been 
  evaluated as part of class declaration evaluation, regardless of its order within the class body 
  (this aligns with `constructor() {}`).
- A `static {}` block may not have decorators (instead you would decorate the class itself). 
  Decorators can always add a class finisher to add their own static initialization.
- When evaluated, a `static {}` block's `this` receiver is the constructor object of the class 
  (as with static field initializers).

<!--#endregion:semantics-->

<!--#region:examples-->
# Examples

```js
// "friend" access (same module)
let A, B;
{
  let friendA;

  A = class A {
    #x;

    static {
        friendA = {
          getX(obj) { return obj.#x },
          setX(obj, value) { obj.#x = value }
        };
    }
  };

  B = class B {
    constructor(a) {
      const x = friendA.getX(a); // ok
      friendA.setX(a, value); // ok
    }
  };
}
```
<!--#endregion:examples-->

<!--#region:api-->
<!--
# API

> TODO: Provide description of High-level API.
-->
<!--#endregion:api-->

<!--#region:grammar-->
<!-- 
# Grammar

> TODO: Provide the grammar for the proposal. Please use [grammarkdown][Grammarkdown] syntax in 
> fenced code blocks as grammarkdown is the grammar format used by ecmarkup.

```grammarkdown
``` 
-->
<!--#endregion:grammar-->

<!--#region:references-->
<!-- 
# References

> TODO: Provide links to other specifications, etc.

* [Title](url)   
-->
<!--#endregion:references-->

<!--#region:prior-discussion-->
<!-- 
# Prior Discussion

> TODO: Provide links to prior discussion topics on https://esdiscuss.org.

* [Subject](https://esdiscuss.org)   
-->
<!--#endregion:prior-discussion-->

<!--#region:todo-->
# TODO

The following is a high-level list of tasks to progress through each stage of the [TC39 proposal process](https://tc39.github.io/process-document/):

### Stage 1 Entrance Criteria

* [x] Identified a "[champion][Champion]" who will advance the addition.  
* [x] [Prose][Prose] outlining the problem or need and the general shape of a solution.  
* [x] Illustrative [examples][Examples] of usage.  
* [x] High-level [API][API].  

### Stage 2 Entrance Criteria

* [x] [Initial specification text][Specification].  
* [ ] [Transpiler support][Transpiler] (_Optional_).  

### Stage 3 Entrance Criteria

* [ ] [Complete specification text][Specification].  
* [ ] Designated reviewers have [signed off][Stage3ReviewerSignOff] on the current spec text.  
* [ ] The ECMAScript editor has [signed off][Stage3EditorSignOff] on the current spec text.  

### Stage 4 Entrance Criteria

* [ ] [Test262](https://github.com/tc39/test262) acceptance tests have been written for mainline usage scenarios and [merged][Test262PullRequest].  
* [ ] Two compatible implementations which pass the acceptance tests: [\[1\]][Implementation1], [\[2\]][Implementation2].  
* [ ] A [pull request][Ecma262PullRequest] has been sent to tc39/ecma262 with the integrated spec text.  
* [ ] The ECMAScript editor has signed off on the [pull request][Ecma262PullRequest].  
<!--#endregion:todo-->

<!--#region:links-->
<!-- The following links are used throughout the README: -->
[Process]: https://tc39.github.io/process-document/
[Proposals]: https://github.com/tc39/proposals/
[Grammarkdown]: http://github.com/rbuckton/grammarkdown#readme
[Champion]: #status
[Prose]: #motivations
[Examples]: #examples
[API]: #api
[Specification]: https://rbuckton.github.io/proposal-class-static-block

<!-- The following links should be supplied as the proposal advances: -->
[Transpiler]: #todo
[Stage3ReviewerSignOff]: #todo
[Stage3EditorSignOff]: #todo
[Test262PullRequest]: #todo
[Implementation1]: #todo
[Implementation2]: #todo
[Ecma262PullRequest]: #todo
<!--#endregion:links-->
