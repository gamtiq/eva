# eva

Functions to create and call functions and evaluate expressions.

[![NPM version](https://badge.fury.io/js/eva.png)](http://badge.fury.io/js/eva)
[![Build Status](https://travis-ci.org/gamtiq/eva.png)](https://travis-ci.org/gamtiq/eva)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

## Installation

### Node

    npm install eva

### [Component](https://github.com/component/component)

    component install gamtiq/eva

### [Jam](http://jamjs.org)

    jam install eva

### [Bower](http://bower.io)

    bower install eva

### [SPM](http://spmjs.io)

    spm install eva

### AMD, &lt;script&gt;

Use `dist/eva.js` or `dist/eva.min.js` (minified version).

## Usage

### Node, Component, SPM

```js
var eva = require("eva");
```

### Jam

```js
require(["eva"], function(eva) {
    ...
});
```

### AMD

```js
define(["path/to/dist/eva.js"], function(eva) {
    ...
});
```

### Bower, &lt;script&gt;

```html

<!-- Use bower_components/eva/dist/eva.js if the library was installed by Bower -->

<script type="text/javascript" src="path/to/dist/eva.js"></script>
<script type="text/javascript">
    // eva is available via eva field of window object
    ...
</script>
```

### Examples

```js
var func = eva.createFunction("(a || 0) + (b || 0) + (c || 0)", {paramNames: "a, b, c", expression: true});
console.log(func("abc"));   // abc00
console.log(func(10, 1, 5, 8));   // 16

func = eva.createFunction("if (obj.b) {return a + b;} else {return 'a=' + a;}", {scope: true, paramNames: "obj"});
console.log( func({a: "a", b: "bc"}) );   // abc

console.log( eva.evalWith("this.a + this.b", {a: 1, b: 9}) );   // 10
console.log( eva.evalWith("fn(this.expr)", {expr: "Math.sin(0)"}, {fn: eva.evalWith}) );   // 0

var obj = {};
eva.createDelegateMethod(eva, "evalWith", {destination: obj, destinationMethod: "expr"});
console.log( obj.expr("Math.cos(0)") );   // 1

func = eva.closure(eva.evalWith, ["this.a * this.b"]);
console.log( func({a: 4, b: 7}) );   // 28
console.log( func({a: -3, b: 5}) );   // -15

func = eva.closure(eva.evalWith, [{a: 3, b: -9}], null, {prependArgs: true});
console.log( func("this.a + this.b") );   // -6
console.log( func("this.a - this.b") );   // 12

var funcList = [
    eva.closure(eva.evalWith, ["this.a + this.b"]),
    eva.closure(eva.evalWith, ["this.a * this.b"]),
    eva.closure(eva.evalWith, ["Math.max(this.a, this.b)"])
];
console.log( eva.map(funcList, [{a: 2, b: -7}]) );   // [-5, -14, 2]
```

## API

### createFunction(code: String, [settings: Object]): Function

Create function to further use.

### evalWith(expression: String, [context: Object], [scope: Object])

Calculate/evaluate value of specified expression using given context and scope.

### createDelegateMethod(delegate: Object, method: String, [settings: Object]): Function

Create function that executes specified method of the given object.

### closure(action: Function, [paramList: Array], [context: Object], [settings: Object]): Function

Create function that executes specified function with given parameters and context and returns result of call.

### map(funcList: Array, [paramList: Array | Function], [context: Object | Function], [settings: Object]): Array

Call each function from specified list and return array containing results of calls.

See `doc` folder for details.

## Related projects

* [adam](https://github.com/gamtiq/adam)
* [teo](https://github.com/gamtiq/teo)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Copyright (c) 2014 Denis Sikuler  
Licensed under the MIT license.
