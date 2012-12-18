var util = require('util');
/***************************
 *    ntype properties     *
 ***************************/

/******************************************************************************
 * Type [object]
 * 
 * an enumeration of native Object Class constructors mapped to their string
 * equivalents, e.g. Object => 'object', String => 'string', etc. used
 * internally but exposed for general usefulness in specifying types
 *
 * usage example:
 *     var stringType = Type[String];
 *
 ***********************************/
var Type = exports.Type = {};
Type[Object] = 'object';
Type[String] = 'string';
Type[Array] = 'array';
Type[Date] = 'date';
Type[Number] = 'number';
Type[RegExp] = 'regexp';
Type[Function] = 'function';
Type[Boolean] = 'boolean';


/******************************************************************************
 * type [function]
 *
 * a function that returns the type of an object similarly to 'typeof' but with
 * the extended type differentiation proposed for EcmaScript 6 (Harmony). This
 * method relies on the value returned by Object.prototype.toString, converted
 * to a lower case string value matching the behavior of 'typeof', with some 
 * special cases for distinguishing different numeric and object types.
 * The special unique values undefined, null, NaN, and Infinity return their
 * value in a manner that follows as closely as possible the behavior of typeof
 * and generally following a modified version of the EcmaScript 5.1 spec:
 *  ES 5.1:
 *        > 15.2.4.2 Object.prototype.toString ( )
 *       When the toString method is called, the following steps are taken:
 *       1. If the this value is undefined, return "[object Undefined]".
 *       2. If the this value is null, return "[object Null]"
 *
 *
 * arguments:
 *      value - [any] JavaScript value to get the type of
 *      extendNumber - [boolean] whether to distinguish [integer] and [float]
 *
 * returns: [string] of one of one of the following types
 *      - undefined
 *      - null
 *      - infinity
 *      - nan
 *      - date
 *      - regexp
 *      - array
 *      - integer
 *      - float
 *      - string
 *      - function
 *      - boolean
 *      - object
 *
 * usage example:
 *     var obj = { foo: 'bar' },
 *         objType = type(obj); // 'object'
 *
 ***********************************/
function type(value, extendNumber) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (value.toString() === 'NaN') return 'nan';
    if (typeof value === 'number' && extendNumber) {
        if (value === Infinity) return 'infinity';
        if (value % 1 === 0) return 'integer';
        return 'float';
    }
    // using split and substrings is faster than regular expressions
    var oclass = Object.prototype.toString.call(value).split(' ')[1];
    return oclass.substr(0, oclass.length - 1).toLowerCase();
}
exports.type = type;


/******************************************************************************
 * hasValue [function]
 *
 * determine whether a variable contains a value other than null or undefined
 *
 * arguments:
 *  value - [any] JavaScript value
 *
 * returns: [boolean]
 *
 * usage example:
 *      if (hasValue(myVar)) // do something ...
 *
 ************************/
function hasValue(value) {
    return value !== undefined && value !== null;
}
exports.hasValue = hasValue;


/******************************************************************************
 * classify [function]
 *
 * allows classes to implement one or more interfaces (see Interface class)
 * classes defined with classify will have the special properties 'implements'
 * and 'interfaces' defined as properties the class constructor (which will
 * actually be a wrapper for the [Function] passed as the <constr> argument)
 * the first argument passed to the constructor is expected to be an object
 * and will be validated against all interfaces implemented and then propagated
 * to the instance, after which the constructor will be applied to the instance
 *
 * arguments:
 *      interface or options -
 *          the first argument can be an instance of interface- 
 *          or an options hash.  If it is an options hash, valid
 *          options are:
 *              - interface - [Interface] that the class will implement
 *              - propagate - [boolean] whether to propagate args to instance
 *              - validateInstance - [boolean] whether to validate returned
 *                               instance (default is true)
 *              - validateArgs - [boolean] whether to validate args with
 *                               interfaces (otherwise validates instance
 *                               returned by constructor with interfaces)
 *                      
 *      constructor - [Function] the constructor for the class
 * returns: [Function] a class constructor that may implement [Interface]
 *
 * usage examples:
 *      // implement an interface after defining class
 *      myClass = classify(function MyClass() { });
 *      myClass.implements(IMyInterface);
 *      // implement an interface when defining class
 *      myClass = classify(IMyInterface, function MyClass() { });
 *
 ************************/
function classify(options, constructor) {

    var interface, propagate, validateArgs,
        validateInstance = true,
        Interface = getInterface(),
        cur = 'classify: arguments: ';

    if (typeof options === 'function') {
        constructor = options;
        options = null;
        interface = null;
    }

    if (constructor) {
        if (typeof constructor !== 'function')
            throw new TypeError(cur + 'constructor must be of type [function]');
    }
    else {
        constructor = function () { },
        propagate = true;
        validateArgs = true;
        validateInstance = false;
    }
    if (options) {
        if (options instanceof Interface) {
            interface = options;
        }
        else if (typeof options === 'object') {
            if (options.validateArgs !== undefined) {
                validateArgs = options.validateArgs;
                if (validateArgs === true) {
                    validateInstance = false;

                }
            }
            if (options.validateInstance !== undefined)
                validateInstance = options.validateInstance;
            if (options.propagate !== undefined)
                propagate = options.propagate;
        }
        else throw new TypeError(cur + 'invalid type for first argument');
    }

    interface = interface || options && options.interface;

    if (interface) {
        if (type(interface) !== 'object')
            throw new TypeError(cur + 'interface must be of type [object]');
        if (!(interface instanceof Interface))
            interface = new Interface(interface);
    }

    var ClassWrapper = function (args) {
        var i, interface,
            hasInterfaces = ClassWrapper.interfaces.length > 0;
        if (validateArgs && hasInterfaces) {
            for (i = 0; interface = ClassWrapper.interfaces[i]; i++) {
                args = interface.validate(args);
            }
        }

        if (propagate) {
            for (var key in args) {
                if (args.hasOwnProperty(key)) {
                    this[key] = args[key];

                }
            }
        }
        constructor.apply(this, arguments);
        Object.defineProperty(this, 'constructor', { value: constructor });

        var instance = this;
        if (validateInstance && hasInterfaces) {
            for (i = 0; interface = ClassWrapper.interfaces[i]; i++) {
                instance = interface.validate(instance);
            }
        }
        return instance;

    };

    ClassWrapper.interfaces = [];

    if (interface) {
        ClassWrapper.interfaces.push(interface);
    }

    ClassWrapper.implements = function implements() {
        for (var i = 0, interface; interface = arguments[i]; i++) {
            this.interfaces.push(interface);
        }
        return this;
    };

    ClassWrapper.inherits = function (Parent) {
        return util.inherits(ClassWrapper, Parent);
    };

    if (options) {
        if (options.methods) {
            for (var methodName in options.methods) {
                if (options.methods.hasOwnProperty(methodName)) {
                    ClassWrapper.prototype[methodName] = options.methods[methodName];
                }
            }
        }
        if (options.inherits) {
            util.inherits(ClassWrapper, options.inherits);
        }
    }
    return ClassWrapper;

}
exports.classify = classify;

// store Interface reference on first call (allows circular ref of modules)
function getInterface() {
    if (getInterface.Interface === undefined)
        getInterface.Interface = require('../class').Interface;
    return getInterface.Interface;
}
