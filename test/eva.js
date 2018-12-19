"use strict";
/*global after, afterEach, before, chai, describe, it, window*/

// Tests for eva
describe("eva", function() {
    var evalRef = (1, eval),
        global = evalRef("this"),
        expect, eva, undef;
    
    // node
    if (typeof chai === "undefined") {
        eva = require("../src/eva.js");
        expect = require("./lib/chai").expect;
    }
    // browser
    else {
        eva = window.eva;
        expect = chai.expect;
    }
    
    function emptyFunction() {
    }
    
    
    describe(".createFunction", function() {
        var createFunction = eva.createFunction;
        
        describe("createFunction(sCode)", function() {
            it("should return function that executes given code", function() {
                var func;
                
                func = createFunction();
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(undef);
                
                func = createFunction("");
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(undef);
                
                func = createFunction("return 1;");
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(1);
                
                func = createFunction("return [].push;");
                expect( func )
                    .a("function");
                expect( func() )
                    .eql(Array.prototype.push);
                
                func = createFunction("return (arguments[0] || 0) + (arguments[1] || 0);");
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(0);
                expect( func(123) )
                    .equal(123);
                expect( func(1, 2) )
                    .equal(3);
                expect( func(10, 1, 5, 8) )
                    .equal(11);
            });
            
            it("should return function that throws an exception", function() {
                var func;
                
                func = createFunction("a");
                expect( func )
                    .Throw(Error);
                
                func = createFunction("[].________________();");
                expect( func )
                    .Throw(Error);
                
                func = createFunction("return argument[0];");
                expect( func )
                    .Throw(Error);
            });
            
            it("should throw a SyntaxError exception", function() {
                expect( createFunction.bind(null, "return -;") )
                    .Throw(SyntaxError);
                
                expect( createFunction.bind(null, "return ()") )
                    .Throw(SyntaxError);
            
                expect( createFunction.bind(null, "{a:'}") )
                    .Throw(SyntaxError);
                
                expect( createFunction.bind(null, "function(,a) {}") )
                    .Throw(SyntaxError);
                
                expect( createFunction.bind(null, "{:}") )
                    .Throw(SyntaxError);
                
                expect( createFunction.bind(null, "[-]") )
                    .Throw(SyntaxError);
                
                expect( createFunction.bind(null, "*[]*") )
                    .Throw(SyntaxError);
            });
        });
        
        describe("createFunction(sCode, {expression: true})", function() {
            it("should prefix function code with 'return' statement", function() {
                var func;
                
                func = createFunction("Math", {expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(Math);
                
                func = createFunction("new Date", {expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .instanceOf(Date);
                
                func = createFunction("null", {expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(null);
                
                func = createFunction("{}", {expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .eql({});
                
                func = createFunction("{a: 1, b: 2}", {expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .eql({a: 1, b: 2});
                
                func = createFunction("[]", {expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .eql([]);
                
                func = createFunction("['a', 8]", {expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .eql(["a", 8]);
            });
        });
        
        describe("createFunction(sCode, {paramNames: 'a, b, c'})", function() {
            it("should create function that accepts parameters with specified names", function() {
                var func;
                
                func = createFunction("return p;", {paramNames: "p"});
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(undef);
                expect( func(1) )
                    .equal(1);
                expect( func(Object) )
                    .equal(Object);
                expect( func(eva) )
                    .equal(eva);
                expect( func("p") )
                    .equal("p");
                
                func = createFunction("if (typeof abc === 'function') {return 'f';} else {return abc;}", {paramNames: "abc"});
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(undef);
                expect( func(1) )
                    .equal(1);
                expect( func(createFunction) )
                    .equal("f");
                expect( func("value") )
                    .equal("value");
                expect( func(null) )
                    .equal(null);
                
                func = createFunction("(a || 0) + (b || 0) + (c || 0)", {paramNames: "a, b, c", expression: true});
                expect( func )
                    .a("function");
                expect( func() )
                    .equal(0);
                expect( func(1) )
                    .equal(1);
                expect( func(1, 2) )
                    .equal(3);
                expect( func(1, 2, 3) )
                    .equal(6);
            });
        });
        
        describe("createFunction(sCode, {scope: true})", function() {
            it("should wrap function code using 'with' statement", function() {
                var func;
                
                func = createFunction("return field;", {scope: true});
                expect( func )
                    .a("function");
                expect( func({field: "value"}) )
                    .equal("value");
                
                func = createFunction("return a + (sc.b || 0);", {scope: true});
                expect( func )
                    .a("function");
                expect( func({a: 1}) )
                    .equal(1);
                expect( func({a: 1, b: 100}) )
                    .equal(101);
                
                func = createFunction("return push;", {scope: true});
                expect( func )
                    .a("function");
                expect( func([]) )
                    .equal([].push);
                
                func = createFunction("return b.c;", {scope: true});
                expect( func )
                    .a("function");
                expect( func({b: {c: "a"}}) )
                    .equal("a");
                
                func = createFunction("if (obj.b) {return a + b;} else {return 'a=' + a;}", {scope: true, paramNames: "obj"});
                expect( func )
                    .a("function");
                expect( func({a: "beta"}) )
                    .equal("a=beta");
                expect( func({a: 3, b: null}) )
                    .equal("a=3");
                expect( func({a: 3, b: 1}) )
                    .equal(4);
                expect( func({a: "a", b: "bc"}) )
                    .equal("abc");
                
                func = createFunction("if (value && value in space) {return space[value];} else {return def;}", {scope: true, paramNames: "space, value"});
                expect( func )
                    .a("function");
                expect( func({a: "beta", def: "default"}) )
                    .equal("default");
                expect( func({a: 3}, "a") )
                    .equal(3);
                expect( func({a: 3, b: 1}, "b") )
                    .equal(1);
                expect( func({def: "unknown", a: "a", b: "b"}, "c") )
                    .equal("unknown");
                
                func = createFunction("a + (p1 || 0) + (p2 || 0)", {scope: true, paramNames: "obj, p1, p2", expression: true});
                expect( func )
                    .a("function");
                expect( func({a: 0}) )
                    .equal(0);
                expect( func({a: 1}, 1) )
                    .equal(2);
                expect( func({a: "a"}, 1) )
                    .equal("a10");
                expect( func({a: 1}, 2, 3) )
                    .equal(6);
                expect( func({a: 10}, 20, 3, 40) )
                    .equal(33);
                expect( func({a: "a"}, "b", "c", 5) )
                    .equal("abc");
                expect( func({a: "a ", p1: "object property "}, "b ", "c ") )
                    .equal("a object property c ");
                expect( func({a: "a ", p1: "- b ", p2: "- c"}, "b ", "c ") )
                    .equal("a - b - c");
            });
            
            it("should return function that throws an ReferenceError exception", function() {
                var func;
                
                func = createFunction("a", {scope: true});
                expect( func.bind(null, {}) )
                    .Throw(ReferenceError);
                
                func = createFunction("return value;", {scope: true, paramNames: "obj"});
                expect( func.bind(null, {a: 1, v: 2}) )
                    .Throw(ReferenceError);
                
                func = createFunction("param > a ? a : b", {scope: true, paramNames: "space, a, b", expression: true});
                expect( func.bind(null, {a: 1, prm: 5}) )
                    .Throw(ReferenceError);
            });
        });
        
        describe("createFunction(sCode, {debug: true})", function() {
            var consoleLog, logData;
            
            function saveLog() {
                logData = Array.prototype.slice.call(arguments);
                consoleLog.apply(console, arguments);
            }
            
            before(function() {
                consoleLog = console.log;
                console.log = saveLog;
            });
            
            after(function() {
                console.log = consoleLog;
            });
            
            function check(sCode, sMessage) {
                /*jshint expr:true, sub:true*/
                var settings = {debug: true};
                if (sMessage) {
                    settings.debugMessage = sMessage;
                }
                expect( createFunction(sCode, settings)() )
                    .be["undefined"];
                expect(logData)
                    .an("array");
                expect(logData)
                    .length(2);
                expect(logData[0])
                    .equal(sMessage || "Error in created function:");
                expect(logData[1])
                    .instanceOf(Error);
                logData = null;
            }
            
            it("should log data about error into console", function() {
                check("abc.def");
            });
            
            describe("createFunction(sCode, {debug: true, debugMessage: 'Some message'})", function() {
                it("should log data about error into console using specified message at the beginning", function() {
                    /*jshint quotmark:false*/
                    check("writeSomewhere(-something.really.good);", 'Something "awful" is happened - ');
                });
            });
        });
        
        describe("createFunction(sCode, {debug: true, debugFunc: 'expression'})", function() {
            var errorData;
            
            function saveErrorData() {
                errorData = Array.prototype.slice.call(arguments);
            }
            
            before(function() {
                global.simpleErrorHandler = {
                    process: saveErrorData
                };
            });
            
            after(function() {
                delete global.simpleErrorHandler;
            });
            
            function check(sCode, sDebugFunc) {
                /*jshint expr:true, sub:true*/
                var settings = {debug: true, debugFunc: sDebugFunc || "simpleErrorHandler.process"};
                expect( createFunction(sCode, settings)() )
                    .be["undefined"];
                expect(errorData)
                    .an("array");
                expect(errorData)
                    .length(2);
                expect(errorData[0])
                    .equal("Error in created function:");
                expect(errorData[1])
                    .instanceOf(Error);
                errorData = null;
            }
            
            it("should pass data about error into specified function", function() {
                check("x.y.z()");
            });
        });
    });
    
    
    describe(".evalWith", function() {
        var evalWith = eva.evalWith;
        
        describe("evalWith(sExpression)", function() {
            it("should return result of expression evaluation", function() {
                expect( evalWith("5") )
                    .equal(5);
                expect( evalWith("null") )
                    .equal(null);
                expect( evalWith("void 0") )
                    .equal(undef);
                expect( evalWith("''") )
                    .equal("");
                expect( evalWith("'abc'") )
                    .equal("abc");
                expect( evalWith("Function") )
                    .equal(Function);
                expect( evalWith("[].concat") )
                    .equal(Array.prototype.concat);
                expect( evalWith("[]") )
                    .eql([]);
                expect( evalWith("{}") )
                    .eql({});
                
                expect( evalWith("[1, 2].concat([3, 4])") )
                    .eql([1, 2, 3, 4]);
                expect( evalWith("3 + 2") )
                    .equal(5);
                expect( evalWith("null + ''") )
                    .equal("null");
                expect( evalWith("typeof null") )
                    .equal("object");
            });
            
            it("should throw ReferenceError or TypeError exception", function() {
                expect( evalWith.bind(null, "abcdefgh") )
                    .Throw(ReferenceError);
                expect( evalWith.bind(null, "undef + non_undef") )
                    .Throw(ReferenceError);
                expect( evalWith.bind(null, "[].push(abracadabra)") )
                    .Throw(ReferenceError);
                expect( evalWith.bind(null, "fun()") )
                    .Throw(ReferenceError);
                
                expect( evalWith.bind(null, "[].length()") )
                    .Throw(TypeError);
                expect( evalWith.bind(null, "(1)()") )
                    .Throw(TypeError);
                expect( evalWith.bind(null, "[] instanceof null") )
                    .Throw(TypeError);
                expect( evalWith.bind(null, "1 in 1") )
                    .Throw(TypeError);
            });
        });
        
        describe("evalWith(sExpression, context)", function() {
            it("should return result of expression evaluation using given context as 'this'", function() {
                var obj;
                
                expect( evalWith("10", {}) )
                    .equal(10);
                expect( evalWith("null", {a: 1}) )
                    .equal(null);
                
                expect( evalWith("this.a", 4) )
                    .equal(undef);
                expect( evalWith("this.a", "abc") )
                    .equal(undef);
                
                obj = {a: 1};
                expect( evalWith("this.a++", obj) )
                    .equal(1);
                expect( obj.a )
                    .equal(2);
                
                expect( evalWith("this.length", [1, 2, 3]) )
                    .equal(3);
                expect( evalWith("this.a + this.b", {a: 1, b: 9}) )
                    .equal(10);
                expect( evalWith("this.length", emptyFunction) )
                    .equal(0);
                expect( evalWith("this.length", new Array(3)) )
                    .eql(3);
            });
        });
        
        describe("evalWith(sExpression, context | null, scope)", function() {
            it("should return result of expression evaluation using given context as 'this' and given scope by 'with' statement", function() {
                expect( evalWith("a", null, {a: evalWith}) )
                    .equal(evalWith);
                expect( evalWith("a + b", undef, {a: 1, b: 9}) )
                    .equal(10);
                expect( evalWith("length", null, emptyFunction) )
                    .equal(0);
                expect( evalWith("length", undef, new Array(1000)) )
                    .eql(1000);
                
                expect( evalWith("a + b + this.value", {value: "%"}, {a: 1, b: 9}) )
                    .equal("10%");
                expect( evalWith("this.value > c ? a : b", {value: 7}, {a: 1, b: 9, c: 4}) )
                    .equal(1);
                expect( evalWith("f(this.expr)", {expr: "Math.sin(0)"}, {a: null, f: evalWith}) )
                    .equal(0);
            });
            
            it("should throw ReferenceError or TypeError exception", function() {
                expect( evalWith.bind(null, "_________________________", null, {}) )
                    .Throw(ReferenceError);
                expect( evalWith.bind(null, "a + b", null, {}) )
                    .Throw(ReferenceError);
                expect( evalWith.bind(null, "f()", null, {f: 1}) )
                    .Throw(TypeError);
                expect( evalWith.bind(null, "f(a)", null, {f: emptyFunction}) )
                    .Throw(ReferenceError);
            });
        });
    });
    
    
    describe(".createDelegateMethod", function() {
        var createDelegateMethod = eva.createDelegateMethod,
            source = {
                value: 0,
                inc: function(add) {
                    if (arguments.length > 0) {
                        this.value += add;
                    }
                    else {
                        this.value++;
                    }
                    return this.value;
                }
            },
            target;
        
        afterEach(function() {
            source.value = 0;
            target = {
                value: 100
            };
        });
        
        describe("createDelegateMethod(source, sMethod)", function() {
            it("should return function that executes the specified method of the given object", function() {
                var method = createDelegateMethod(source, "inc");
                
                expect( method )
                    .a("function");
                expect( method() )
                    .equal(1);
                expect( source.value )
                    .equal(1);
                
                expect( method(7) )
                    .equal(8);
                expect( source.value )
                    .equal(8);
            });
        });
        
        describe("createDelegateMethod(source, sMethod, {destination: target})", function() {
            it("should add method in target object that executes the specified method of the given object", function() {
                var method = createDelegateMethod(source, "inc", {destination: target});
                
                expect( method )
                    .a("function");
                expect( target.inc )
                    .equal(method);
                
                expect( method() )
                    .equal(1);
                expect( source.value )
                    .equal(1);
                expect( target.value )
                    .equal(100);
                
                expect( method(-100) )
                    .equal(-99);
                expect( source.value )
                    .equal(-99);
                expect( target.value )
                    .equal(100);
                
                expect( target.inc() )
                    .equal(-98);
                expect( source.value )
                    .equal(-98);
                expect( target.value )
                    .equal(100);
                
                expect( target.inc(101) )
                    .equal(3);
                expect( source.value )
                    .equal(3);
                expect( target.value )
                    .equal(100);
            });
        });
        
        describe("createDelegateMethod(source, sMethod, {destination: target, destinationMethod: sTargetMethod})", function() {
            it("should add method with given name in target object that executes the specified method of the given object", function() {
                var method = createDelegateMethod(source, "inc", {destination: target, destinationMethod: "change"});
                
                expect( method )
                    .a("function");
                expect( target.change )
                    .equal(method);
                
                expect( method() )
                    .equal(1);
                expect( source.value )
                    .equal(1);
                expect( target.value )
                    .equal(100);
                
                expect( method(76) )
                    .equal(77);
                expect( source.value )
                    .equal(77);
                expect( target.value )
                    .equal(100);
                
                expect( target.change() )
                    .equal(78);
                expect( source.value )
                    .equal(78);
                expect( target.value )
                    .equal(100);
                
                expect( target.change(2) )
                    .equal(80);
                expect( source.value )
                    .equal(80);
                expect( target.value )
                    .equal(100);
            });
        });
    });
    
    
    describe(".closure", function() {
        /*jshint latedef:false */
        function sum() {
            /*jshint eqeqeq:false, eqnull:true, validthis:true*/
            var result = this === global || this == null || typeof this.initValue !== "number" ? 0 : this.initValue,
                nL = arguments.length,
                nI, value;
            if (nL) {
                nI = 0;
                value = arguments[0];
                // Dirty check of array
                if (typeof value.length === "number" && typeof value.splice === "function") {
                    result += sum.apply(this, value);
                    nI = 1;
                }
                while (nI < nL) {
                    value = arguments[nI++];
                    if (typeof value === "number") {
                        result += value;
                    }
                }
            }
            return result;
        }
        
        function check(result, action, paramList, context, settings, funcArgs) {
            var argList = [action],
                func;
            if (paramList) {
                argList.push(paramList);
            }
            if (context) {
                argList.push(context);
            }
            if (settings) {
                argList.push(settings);
            }
            func = closure.apply(null, argList);
            expect(func)
                .a("function");
            expect(func.apply(null, funcArgs || []))
                .eql(result);
        }
        
        function getArguments() {
            return arguments;
        }
        
        var closure = eva.closure;
        
        describe("closure(func)", function() {
            it("should create function that call the specified function", function() {
                check(0, sum);
                check(expect(), expect);
            });
        });
        
        describe("closure(func, paramList)", function() {
            it("should create function that call the specified function with given parameters", function() {
                check(9, sum, [1, 8]);
                check(1111, sum, [1, 10, 100, 1000]);
                check(28, eva.evalWith, ["this.a * this.b", {a: 4, b: 7}]);
                check(expect("abc"), expect, ["abc"]);
                check(expect(eva), expect, [eva]);
                
                check(0, sum, getArguments());
                check(-1, sum, getArguments(3, -5, 1));
            });
        });
        
        describe("closure(func, paramList, context)", function() {
            it("should create function that call the specified function with given parameters and context", function() {
                check(20, sum, [1, 8, [-1, -7]], {initValue: 11});
                check(100, sum, [2, 31, 40, 17], {initValue: 10});
            });
        });
        
        describe("closure(func, paramList, context, {ignoreArgs: true})", function() {
            it("should create function that call the specified function with given parameters and context and ignore specified arguments", function() {
                var settings = {ignoreArgs: true};
                check(5, sum, [2, 3], {}, settings, [100, 200, 300]);
                check(85, sum, [1, 11, 53, 10], {initValue: 10}, settings, [-100, -5]);
                
                check(101, sum, getArguments(1, 7, 50, 43), {}, settings, [10, 2, 7, 2, -99]);
                check(-50, sum, getArguments(5, -10, -15), {initValue: -30}, settings, [1, 10, 100]);
            });
        });
        
        describe("closure(func, paramList, context, {prependArgs: true})", function() {
            it("should create function that call the specified function with given parameters and context and pass arguments before parameters", function() {
                var settings = {prependArgs: true};
                check(1500, sum, [-100, 1], {}, settings, [[1000, 99, 500]]);
                check(22, sum, [5, 100], {initValue: 22}, settings, [-100, -5]);
            });
        });
    });
    
    
    describe(".map", function() {
        /*jshint latedef:false */
        function getValue(value) {
            return function() {
                return value;
            };
        }
        
        function getParamList() {
            var paramList = arguments;
            return function() {
                return paramList;
            };
        }
        
        function getExtParamList() {
            var paramList = Array.prototype.slice.call(arguments, 0);
            return function(func, index, funcList) {
                return paramList.concat(index, funcList.length);
            };
        }
        
        function sum() {
            /*jshint eqeqeq:false, eqnull:true, validthis:true*/
            var nR = this === global || this == null || typeof this.initValue !== "number" ? 0 : this.initValue;
            for (var nI = 0, nL = arguments.length; nI < nL; nI++) {
                nR += arguments[nI];
            }
            return nR;
        }
        
        function mult() {
            /*jshint eqeqeq:false, eqnull:true, validthis:true*/
            var nR = this === global || this == null || typeof this.initValue !== "number" ? 1 : this.initValue;
            for (var nI = 0, nL = arguments.length; nI < nL; nI++) {
                nR *= arguments[nI];
            }
            return nR;
        }
        
        function max() {
            return Math.max.apply(null, arguments);
        }
        
        function min() {
            return Math.min.apply(null, arguments);
        }
        
        function check(result, funcList, paramList, context, settings) {
            var argList = [funcList];
            if (paramList) {
                argList.push(paramList);
            }
            if (context) {
                argList.push(context);
            }
            if (settings) {
                argList.push(settings);
            }
            expect(map.apply(null, argList))
                .eql(result);
        }
        
        var map = eva.map;
        
        describe("map(funcList)", function() {
            it("should return results of calling of each function", function() {
                check([1, "abc", eva], [getValue(1), getValue("abc"), getValue(eva)]);
                check([getValue, expect, null, check], [getValue(getValue), getValue(expect), getValue(null), getValue(check)]);
            });
        });
        
        describe("map(funcList, paramList)", function() {
            it("should return results of calling of each function with specified parameters", function() {
                check([7, 10], [sum, mult], [2, 5]);
                check([5, 3360, 7, -8], [sum, mult, max, min], [-3, 7, 4, -8, 5]);
                
                check([-7, 14], [min, max], getParamList(3, -7, 9, 14, -5, 8));
                check([12, 32], [sum, mult], getExtParamList(2, 8));
            });
        });
        
        describe("map(funcList, paramList, context)", function() {
            it("should return results of calling of each function with specified parameters and context", function() {
                function getContext(func, index, funcList) {
                    return {initValue: index + funcList.length};
                }
                
                check([20, 210], [sum, mult], [3, 7], {initValue: 10});
                check([7, -240], [sum, mult], [1, 2, 3, 4, -5], {initValue: 2});
                
                check([12, -540], [sum, mult], getParamList(3, -3, 5, 4), getValue({initValue: 3}));
                check([7, -18], [sum, mult], getExtParamList(-1, 1, 3), getContext);
            });
        });
        
        describe("map(funcList, paramList, funcContext, {funcContext: true})", function() {
            it("should return results of calling of each function with specified parameters and context", function() {
                function context() {
                }
                context.initValue = 2;
                
                var settings = {funcContext: true};
                
                check([3, -0], [sum, mult], getParamList(1, -1, 1, 0), context, settings);
                check([5, 240], [sum, mult], getParamList(1, -2, 3, -4, 5), context, settings);
            });
        });
    });
});
