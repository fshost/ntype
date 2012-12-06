
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
    if (value === 'undefined') return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'number' && extendNumber) {
        if (value.toString() === 'NaN') return 'nan';
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
 *
 * arguments:
 *      interface   - (optional) [Interface] that the class will implement
 *      constructor - [Function] the constructor for the class
 *
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
function classify(interface, constructor) {
    if (arguments.length === 1) {
        constructor = interface;
        interface = null;
    }
    var cur = 'classify: arguments: ';

    if (interface) {
        if (type(interface) !== 'object')
            throw new TypeError(cur + 'interface must be of type [object]');
        constructor = constructor || function ClassifyGeneric(arg) {
            for (var key in arg) {
                if (arg.hasOwnProperty(key)) {
                    this[key] = arg[key];
                }
            }
        };
    }
    if (typeof constructor !== 'function')
        throw new TypeError(cur + 'constructor must be of type [function]');

    function ClassWrapper() {
        constructor.apply(this, arguments);
        var instance = this;
        instance.constructor = constructor;
        if (ClassWrapper.interfaces.length > 0) {
            for (var i = 0, interface; interface = ClassWrapper.interfaces[i]; i++) {
                instance = interface.validate(instance);
            }
        }
        return instance;
    }
    ClassWrapper = ClassWrapper || ClassWrapper;
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
    return ClassWrapper;
}
exports.classify = classify;