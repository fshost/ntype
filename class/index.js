var ntools = require('ntools'),
    setDefaults = ntools.setDefaults,
    clone = ntools.clone,
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

    var instance = this,

        cur = 'descriptor: attributes argument: ',

        err = function (msg) {
            throw new TypeError(cur + msg);
        },
        getType = function (value) {
            if (typeof value === 'string')
                return value;
            if (Array.isArray(value))
                return getTypeArray(value);
            if (typeof value === 'function') {
                if (Type[value]) return Type[value];
                else {
                    instance.isClassType = true;
                    instance.className = value.name && value.name !== 'ClassWrapper' ? value.name : 'required class';
                    return value;
                }
            }
            if (value instanceof Interface) {
                instance.isInterfaceType = true;
                return value;
            }
            return false;
        },

        getTypeArray = function (typeArray) {
            if (typeArray.length !== 1)
                err('type array must contain exactly one element specifying type');
            var type = typeArray[0];
            if (Array.isArray(type))
                err('nested type arrays are not supported');
            type = getType(typeArray[0]);
            if (type) {
                instance.isTypeArray = true;
                return type;
            }
            err('invalid type');
        };
    
    getType = getType.bind(this);
    getTypeArray = getTypeArray.bind(this);

    if (typeof attributes !== 'object') err('missing or invalid');

    if (attributes.name === undefined)
        return err('missing required attribute: name');
    
    // ensure name is first attribute
    instance.name = attributes.name;
    for (var attr in attributes) {
        if (attributes.hasOwnProperty(attr)) {
            instance[attr] = attributes[attr];
        }
    }
    if (instance.type) {
        instance.type = getType(instance.type);
        if (!instance.type) err('invalid type');
    }

    return instance;
}

Descriptor.prototype.getSetValue = function (o) {

    if (!hasValue(o)) {

        throw new TypeError('Descriptor: ' + this.name + ': cannot evaluate, object is ' + o);
    }

    if (o[this.name] === undefined && this.default !== undefined) {
        o[this.name] = this.default;
    }
    
    var value = o[this.name];
    if (this.isInterfaceType && !this.isTypeArray) {
        o[this.name] = this.type.validate(value);
        return o;
    }
    if (hasValue(value)) {
        if (this.validator && !this.validator(value, this)) {
            this.error(value + ' failed validation');
        }
        if (this.type !== undefined && this.type !== 'any') {
            if (this.isTypeArray) {
                for (var i = 0, l = value.length; i < l; i++) {
                    if (this.isInterfaceType) {
                        o[this.name][i] = this.type.validate(value[i]);
                    }
                    else this.checkType(value[i]);
                }
            }
            else this.checkType(value);
        }
    }
    else if (this.required) {
        this.error('is required but is ' + value);
    }
    return o;
};

Descriptor.prototype.getDescription = function () {
    return this.name + ' property';
};

Descriptor.prototype.error = function (errMsg) {
    errMsg = this.getDescription() + ': ' + errMsg;
    throw new TypeError(errMsg);
};

Descriptor.prototype.checkType = function (value) {

    if (this.isClassType) {
        if (value instanceof this.type) return true;
        this.error(value + ' is not an instance of ' + this.className);
        return false;
    }
    
    if (type(value) === this.type || type(value, true) === this.type) {
        return true;
    }
    else {
        this.error(value + 'is not of type [' + this.type + ']');
        return false;
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
            if (opt('validator', 'function')) defaults.validator = options.validator;
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
        descriptors = this.extendDescriptors(descriptors, options.extends.descriptors);
    }
    if (!descriptors.length)
        throw new TypeError(current + 'contains no values');
    else if (!(descriptors[0] instanceof Descriptor)) {
        throw new TypeError(current + 'must be instances of Descriptor class');
    }
    var instance = this;
    this.descriptors = descriptors;

}

// method to validate an instance against the interface
Interface.prototype.validate = function (o) {
    if (o === undefined || o === null) o = {};
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
Interface.prototype.extendDescriptors = function (descriptors, parentDescriptors) {
    if (!Array.isArray(descriptors)) {
        throw new TypeError('Interface.extendDescriptors: descriptors argument must be an array');
    }
    if (!Array.isArray(parentDescriptors)) {
        throw new TypeError('Interface.extendDescriptors: parentDescriptors argument must be an array');
    }
    if (parentDescriptors.length < 1) return descriptors;
    if (descriptors.length < 1)
        throw new TypeError('Interface.extendDescriptors: descriptors must have at least one element');

    var descIndex = [],
        addDescr = [];
    for (var i = 0, descriptor; descriptor = descriptors[i]; i++) {
        if (descriptor instanceof Descriptor) {
            descIndex[i] = descriptor.name;
        }
        else throw new TypeError('descriptor is not an instance of the Descriptor class');
    }
    for (var index, descrType, j = 0, parentDescr; parentDescr = parentDescriptors[j]; j++) {
        index = descIndex.indexOf(parentDescr.name);
        if (parentDescr instanceof Descriptor) {
            if (index > -1) {
                for (var key in parentDescr) {
                    if (parentDescr.hasOwnProperty(key)) {
                        if (descriptors[index][key] === undefined) {
                            descriptors[index][key] = parentDescr[key];
                        }
                        else if (typeof descriptors[index][key] === 'object' &&
                            typeof parentDescr[key] === 'object') {
                            if (!parentDescr[key] instanceof Interface && descriptors[index][key] instanceof Interface) {
                                    descriptors[index][key].descriptors = this.extendDescriptors(descriptors[index][key].descriptors, parentDescr[key].descriptors);
                            }
                        }

                    }
                }
                if (!(descriptors[index] instanceof Descriptor)) {
                    throw new TypeError('descriptor is not an instance of the Descriptor class');
                }
            }
            else addDescr.push(parentDescr);
        }
        else throw new TypeError('parent descriptor is not an instance of the Descriptor class');
    }
    if (addDescr.length > 0) descriptors = addDescr.concat(descriptors);
    
    return descriptors;
};

// convert object to array of descriptors with key as name property
Interface.prototype.toDescriptors = function (o, defaults) {

    var value,
        newValue,
        descriptor,
        descriptors = [],

        cur = 'Interface.toDescriptors: arguments: ',

        err = function (msg) {
            throw new TypeError(cur + msg);
        },
        getType = function (value) {
            if (typeof value === 'string')
                return value;
            if (Array.isArray(value))
                return getTypeArray(value);
            if (typeof value === 'function') {
                if (Type[value]) return Type[value];
                else return value;
            }
            if (value instanceof Interface) {
                return value;
            }
            return false;
        },
    
        getTypeArray = function (typeArray) {
            if (typeArray.length !== 1)
                err('type array must contain exactly one element specifying type');
            var type = typeArray[0];
            if (Array.isArray(type))
                err('nested type arrays are not supported');
            type = getType(value[0]);
            if (type) {
                return [type];
            }
            err(value + ' is invalid type for ' + typeArray + ' : ' + value[0] + ' : ' + type);
        };

    for (var key in o) {
        if (o.hasOwnProperty(key)) {
            // ensure name is first
            newValue = { name: key };
            value = o[key];
            if (getType(value)) {
                newValue.type = value;
            }
            else if (typeof value === 'object') {
                for (var prop in value) {
                    if (value.hasOwnProperty(prop)) {
                        if (prop === 'type') {
                            if (!getType(value[prop]))
                                return err('invalid type');
                        }
                        newValue[prop] = value[prop];
                    }
                }
            }
            else return err('invalid descriptor');
            if (defaults) {
                for (var attr in defaults) {
                    if (defaults.hasOwnProperty(attr) && newValue[attr] === undefined) {
                        newValue[attr] = defaults[attr];
                    }
                }
            }
            descriptor = new Descriptor(newValue);
            descriptors.push(descriptor);
        }
    }
    return descriptors;

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

