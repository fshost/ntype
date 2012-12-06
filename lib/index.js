
// Type - maps Object Classes to strings
var Type = exports.Type = {};
Type[Object] = 'object';
Type[String] = 'string';
Type[Array] = 'array';
Type[Date] = 'date';
Type[Number] = 'number';
Type[RegExp] = 'regexp';
Type[Function] = 'function';
Type[Boolean] = 'boolean';


// type - get the object class of an object, differentiating between
// Object, Date, RegExp, and Array, as well as standard native types
// available through typeof such as String, Boolean, Number, and Function
function type(o) {
    // return undefined, null, and NaN for those unique value types
    if (o === undefined) return 'undefined';
    if (o === null) return 'null';
    if (o.toString() === 'NaN') return 'NaN';
    // using split and substrings is faster than regular expressions
    var oclass = Object.prototype.toString.call(o).split(' ')[1];
    return oclass.substr(0, oclass.length - 1).toLowerCase();
}
exports.type = type;


// determine if value is not null or undefined
function hasValue(value) {
    return value !== undefined && value !== null;
}
exports.hasValue = hasValue;

/*********************************
 * Classify Method
 *
 ************************/
function classify(Interface, Class) {
    // if called with no arguments, classify returns an empty fn, allowing for
    // easy creation of a class that can later be defined further by using
    // the 'implements' method to add one or more interfaces to the class
    if (arguments.length === 1) {
        Class = Interface;
        Interface = null;
    }
    if (!Class) Class = function () { };
    function Wrapper() {
        Class.apply(this, arguments);
        var instance = this;
        instance.constructor = Class;
        if (Wrapper.interfaces.length > 0) {
            for (var i = 0, interface; interface = Wrapper.interfaces[i]; i++) {
                instance = interface.validate(instance);
            }
        }
        return instance;
    }

    Wrapper = Wrapper || Wrapper;
    Wrapper.interfaces = [];
    if (Interface) {
        Wrapper.interfaces.push(Interface);
    }
    // implements may be called with any number of Interface arguments
    Wrapper.implements = function implements() {
        for (var i = 0, Interface; Interface = arguments[i]; i++) {
            this.interfaces.push(Interface);
        }
        return this;
    };
    return Wrapper;
}

exports.classify = classify;