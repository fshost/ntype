var fs = require('fs'),
    path = require('path'),
    nclass = require(__dirname + '/class'),
    string = require(__dirname + '/string'),
    classify = nclass.classify;

function FS() { }
// get the contents of a file as a string ala readFileSync
FS.prototype.text = function (filepath) {
    return string.removeBOM(fs.readFileSync(filepath).toString());
}.bind(FS.prototype);

var NFS = classify(FS).mixin(fs).mixin(path);

var nfs = new NFS();
module.exports = nfs;