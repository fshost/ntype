var path = require('path'),
    lib = require('../lib'),
    Type = lib.Type,
    type = lib.type,
    hasValue = lib.hasValue;

/*********************************
 * Descriptor Class
 *
 * For defining expected property type and/or default value for properties
 ************************/
function Descriptor(attributes) {
    if (typeof attributes !== 'object') throw new TypeError('invalid or missing attributes argument');
    var attrKeys = Object.keys(attributes);

    for (var i = 0, attrName; attrName = attrKeys[i]; i++) {
        this[attrName] = attributes[attrName];
    }
    if (Array.isArray(this.type)) {
        var type = this.type[0];
        typeStr = Type[type];
        if (typeof typeStr === 'string') {
            this.type = [typeStr];
        }
    }
    else if (Type[this.type]) {
        this.type = Type[this.type];
    }
}

Descriptor.prototype.getSetValue = function (o) {
    var value = o[this.name];
    if (value === undefined && this.default !== undefined) {
        value = this.default;
    }
    value = this._validate(value);
    if (value !== undefined) {
        o[this.name] = value;
    }
    return o;
};

Descriptor.prototype.getDescription = function () {
    return this.name + ' property';
};

Descriptor.prototype.error = function (errMsg) {
    errMsg = this.getDescription() + ': ' + errMsg;
    throw new TypeError(errMsg)
};

Descriptor.prototype._validate = function (value) {
    if (hasValue(value)) {
        if (this.validate && !this.validate(value, this)) {
            return this.error('invalid value');
        }
        return this.checkType(value);
    }
    else if (this.required) {
        return this.error('is required but is ' + value);
    }
    else {
        return value;
    }
};

Descriptor.prototype.checkType = function (value) {
    
    var checkValue,
        requiredType = this.type;
    
    if (Array.isArray(this.type)) {
        if (!Array.isArray(value)) {
            return this.error('expected value to be an array');
        }
        if (value.length) {
            checkValue = value[0];
            requiredType = this.type[0];
        }
        else return value;
    }
    else {
        checkValue = value;
        requiredType = this.type;
    }
    if (requiredType === undefined || requiredType === 'any') {
        return value;
    }
    if (typeof requiredType === 'string') {
        if (type(checkValue) === requiredType) {
            return value;
        }
        else {
            return this.error('expected value to be of type ' + requiredType);
        }
    }
    else if ((requiredType instanceof Interface && requiredType.validate(checkValue)) || 
        (typeof requiredType === 'function' && checkValue instanceof requiredType)) {
        return value;
    }
    else {
        return this.error('not an instance of type ' + (requiredType.name || 'class'));
    }

};

exports.Descriptor = Descriptor;


/*********************************
 * Interface Class
 *
 * For defining expected property types and/or default values for properties
 ************************/
function Interface(options, descriptors) {

    if (!descriptors) {
        descriptors = options;
        options = null;
    }

    function opt(name, type) {
        var value = options[name];
        if (value !== undefined) {
            if (typeof value === type) return value;
            else throw new TypeError(current + 'options : ' + name + ': "' +
                value + '" is not of type [' + type + ']');
        }
        else return false;
    }

    var current = 'Interface: arguments: ',
        defaults = { required: false };

    if (hasValue(options)) {
        if (type(options) === 'object') {
            defaults.required = opt('required', 'boolean');
            if (opt('validate', 'function')) defaults.validate = options.validate;
        }
        else throw new TypeError(current + 'options: must be of type [object]');
    }

    current += 'descriptors: ';
    if (typeof descriptors !== 'object')
        throw new TypeError(current + 'must be of type [object]');
    if (!Array.isArray(descriptors)) {
        descriptors = this.toDescriptors(descriptors, defaults);
    }
    if (options && options.extends instanceof Interface) {
        descriptors = this.extendDescriptors(descriptors, options.extends);
    }
    if (!descriptors.length)
        throw new TypeError(current + 'contains no values');
    else if (!(descriptors[0] instanceof Descriptor)) {
        throw new TypeError(current + 'must be instances of Descriptor class');
    }
    this.descriptors = descriptors;

}

// method to validate an instance against the interface
Interface.prototype.validate = function (o, passedAsTrue) {
    for (var i = 0, descriptor; descriptor = this.descriptors[i]; i++) {
        o = descriptor.getSetValue(o);
    }
    if (this.isArguments) return Array.prototype.slice(o);
    return o;
};

Interface.prototype.getContextDescription = function (o) {
    return o.constructor && o.constructor.name || 'Class';
};

// throw interface typeError
Interface.prototype._throw = function (errMsg, stackLevel) {
    errMsg = this.getContextDescription + ': ' + errMsg;
    var stack,
        error = new TypeError(errMsg);
    stackLevel = stackLevel || 3;
    stack = error.stack.split('\n');
    stack.splice(1, stackLevel);
    error.stack = stack.join('\n');
    throw error;
};

// method to extend descriptors with that of a parent interface
Interface.prototype.extendDescriptors = function (descriptors, IParent) {
    var index,
        cur = 'Interface.extends';
    if (!Array.isArray(descriptors)) {
        throw new TypeError('Interface.extendDescriptors: descriptors argument must be an array');
    }
    if (!(IParent instanceof Interface)) {
        throw new TypeError('Interface.extendDescriptors: IParent argument must be an array');
    }
    var indexedDesc = descriptors.map(function (val) { return val.name });
    for (var i = 0, descr; descr = IParent.descriptors[i]; i++) {
        var index = indexedDesc.indexOf(descr.name);
        if (index > -1) {
            for (var key in descr) {
                if (descr.hasOwnProperty(key)) {
                    if (descriptors[index][key] === undefined) {
                        descriptors[index][key] = descr[key];
                    }
                }
            }
        }
        else {
            descriptors.unshift(descr);
        }
    }
    return descriptors;
};

// convert object to array of descriptors with key as name property
Interface.prototype.toDescriptors = function (o, defaults) {

    var name,
        value,
        newValue,
        keys = Object.keys(o);
    for (var i = 0, key; key = keys[i]; i++) {
        value = o[key];
        // ensure name is first
        newValue = { name: key };
        if (type(value) !== 'object') {
            newValue.type = value;
        }
        else {
            for (var prop in value) {
                if (value.hasOwnProperty(prop)) {
                    newValue[prop] = value[prop];
                }
                else break;
            }
        }
        for (var attr in defaults) {
            if (defaults.hasOwnProperty(attr) && newValue[attr] === undefined) {
                newValue[attr] = defaults[attr];
            }
        }
        newValue.interface = this;
        keys[i] = new Descriptor(newValue);
    }
    return keys;
};

exports.Interface = Interface;


//// create interface for interface itself
//var IInterface = new Interface({
//    propNames: [String],
//    descriptors: [Object],
//    attributes: [String],
//    hasValue: Function,
//    Type: Object,
//    Types: Array,
//    validate: Function
//});

//var util = require('util'),
//    classify = require('./classify'),
//    _Interface = classify(IInterface, Interface);

//util.inherits(_Interface, Interface);

