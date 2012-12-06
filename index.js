// ntype - class structure definitions and auto-type checking for javascript in Node.js

var classes = require('./class');

var lib = require('./lib');

exports.classify = lib.classify;
exports.type = lib.type;
exports.Type = lib.Type;
exports.hasValue = lib.hasValue;
exports.Descriptor = classes.Descriptor;
exports.Interface = classes.Interface;