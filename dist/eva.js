
(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory(require, exports, module);
    }
    else if(typeof define === 'function' && define.amd) {
        define(['require', 'exports', 'module'], factory);
    }
    else {
        var req = function(id) {return root[id];},
            exp = root,
            mod = {exports: exp};
        root['eva'] = factory(req, exp, mod);
    }
}(this, function(require, exports, module) {
    /*
     * eva
     * https://github.com/gamtiq/eva
     *
     * Copyright (c) 2014 Denis Sikuler
     * Licensed under the MIT license.
     */


    /**
     * Functions to create and call functions and evaluate expressions.
     * 
     * @module eva
     */


    "use strict";


    /**
     * Create function to further use.
     * 
     * @param {String} sCode
     *      Function's code.
     * @param {Object} [settings]
     *     Operation settings. Keys are settings names, values are corresponding settings values.
     *     The following settings are supported (setting's default value is specified in parentheses):
     *     
     *   * `expression`: `Boolean` (`false`) - specifies whether function's code is an expression;
     *      when `true` value is specified, `return` statement is added at the beginning of function's code
     *   * `paramNames`: `String` (`''`) - specifies names of function parameters
     *   * `scope`: `Boolean` (`false`) - specifies whether function's code should be wrapped in `with` statement;
     *      the value of function's first parameter is used as expression for `with` statement
     * @return {Function}
     *      Created function.
     * @alias module:eva.createFunction
     */
    function createFunction(sCode, settings) {
        /*jshint evil:true*/
        var nI, params, sName;
        if (! settings) {
            settings = {};
        }
        params = settings.paramNames;
        if (settings.expression) {
            sCode = "return (" + sCode + ");";
        }
        if (settings.scope) {
            if (params) {
                nI = params.indexOf(",");
                if (nI > -1) {
                    sName = params.substring(0, nI);
                }
                else {
                    sName = params;
                }
            }
            else {
                params = sName = "sc";
            }
            sCode = "with(" + sName + ") {" + sCode + "}";
        }
        return params ? new Function(params, sCode) : new Function(sCode);
    }

    /**
     * Calculate/evaluate value of specified expression using given context and scope.
     * 
     * @param {String} sExpression
     *      Expression whose value should be calculated.
     * @param {Object} [context]
     *      Object that should be used as context (`this`) when expression is evaluated.
     * @param {Object} [scope]
     *      Object that should be used as scope when expression is evaluated.
     * @return {Any}
     *      Result of expression evaluation.
     * @see {@link module:eva.createFunction createFunction}
     * @alias module:eva.evalWith
     */
    function evalWith(sExpression, context, scope) {
        var f = createFunction(sExpression, {expression: true, scope: Boolean(scope)});
        return f.apply(context || null, scope ? [scope] : []);
    }

    /**
     * Create function that executes specified method of the given object.
     * 
     * @param {Object} delegate
     *      Object whose method will be executed when created function is called.
     * @param {String} sMethod
     *      Name of method that will be executed.
     * @param {Object} [settings]
     *     Operation settings. Keys are settings names, values are corresponding settings values.
     *     The following settings are supported:
     *     
     *   * `destination`: `Object` - target object into which the method will be added that should be used 
     *      to access the created function
     *   * `destinationMethod`: `String` - name of method of the target object that will be used to access 
     *      the created function; the value of `sMethod` parameter by default
     * @return {Function}
     *      Created function.
     * @alias module:eva.createDelegateMethod
     */
    function createDelegateMethod(delegate, sMethod, settings) {
        var result = function() {
            return delegate[sMethod].apply(delegate, arguments);
        };
        if (settings && settings.destination) {
            settings.destination[settings.destinationMethod || sMethod] = result;
        }
        return result;
    }

    /**
     * Create function that executes specified function with given parameters and context and returns result of call.
     * 
     * @param {Function} action
     *      Target function that will be executed when created function is called.
     * @param {Array} [paramList]
     *      Array-like object representing parameters that should be passed into the target function specified in `action` argument.
     * @param {Object} [context]
     *     Object that will be used as `this` value when calling the target function specified in `action` argument.
     *     Default value is `null`.
     * @param {Object} [settings]
     *     Operation settings. Keys are settings names, values are corresponding settings values.
     *     The following settings are supported:
     *     
     *   * `ignoreArgs`: `Boolean` - Whether arguments passed into the created function should be ignored.
     *     Default value is `false` and means that arguments will be included in parameters list for the target function
     *     depending of the value of `prependArgs` setting.
     *   * `prependArgs`: `Boolean` - Whether arguments passed into the created function should be passed into the target function
     *     before parameters specified in `paramList` argument. Default value is `false` and means that parameters list
     *     for the target function will contain values from `paramList` argument followed by arguments passed into the created function
     *     (this is similar to `Function.prototype.bind` behavior).
     * @return {Function}
     *      Created function.
     * @alias module:eva.closure
     */
    function closure(action, paramList, context, settings) {
        if (! settings) {
            settings = {};
        }
        var bUseArgs = ! settings.ignoreArgs,
            bAppendArgs = ! settings.prependArgs;
        
        return function() {
            var params;
            if (bUseArgs) {
                params = paramList ? Array.prototype.slice.call(paramList, 0) : [];
                if (bAppendArgs) {
                    params.push.apply(params, arguments);
                }
                else {
                    params = Array.prototype.slice.call(arguments, 0).concat(params);
                }
            }
            else {
                params = paramList || [];
            }
            return action.apply(context || null, params);
        };
    }

    /**
     * Call each function from specified list and return array containing results of calls.
     * 
     * @param {Array} funcList
     *      Target functions that should be called.
     * @param {Array} [paramList]
     *      Parameters that should be passed into each target function.
     * @param {Object} [context]
     *     Object that will be used as `this` value when calling each target function.
     *     Default value is `null`.
     * @return {Array}
     *      Results of functions calling.
     * @alias module:eva.map
     */
    function map(funcList, paramList, context) {
        var result = [],
            nL = funcList.length,
            nI;
        if (! paramList) {
            paramList = [];
        }
        if (! context) {
            context = null;
        }
        for (nI = 0; nI < nL; nI++) {
            result[nI] = funcList[nI].apply(context, paramList);
        }
        return result;
    }


    // Exports

    module.exports = {
        createFunction: createFunction,
        evalWith: evalWith,
        createDelegateMethod: createDelegateMethod,
        closure: closure,
        map: map
    };

    return module.exports;
}));
