# eva

Functions to create functions and evaluate expressions.

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

### AMD, &lt;script&gt;

Use `dist/eva.js` or `dist/eva.min.js` (minified version).

## Usage

### Node, Component

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
```

## API

### createFunction(code: String, [settings: Object]): Function

Create function to further use.

### evalWith(expression: String, [context: Object], [scope: Object])

Calculate/evaluate value of specified expression using given context and scope.

### createDelegateMethod(delegate: Object, method: String, [settings: Object]): Function

Create function that executes specified method of the given object.

See `doc` folder for details.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Copyright (c) 2014 Denis Sikuler  
Licensed under the MIT license.
