var object = require(__dirname + '/object');

function cloneArray(source, shallow) {
    if (shallow) return source.slice();
    var target = [];
    for (var i = 0, l = source.length; i < l; i++) {
        if (Array.isArray(source[i])) {
            target[i] = cloneArray(source[i]);
        }
        else if (typeof source[i] === 'object') {
            target[i] = object.clone(source[i]);
        }
        else target[i] = source[i];
    }
    return target;
}
exports.clone = cloneArray;

// extend one array with contents of another array
// only adds items from source array not already present in target array
function extendArray(target, source) {
    var a = target && target.slice() || [];
    for (var i = 0, l = source.length; i < l; i++) {
        if (a.indexOf(source[i]) === -1) {
            a.push(source[i]);
        }
    }
    return a;
}
exports.extend = extendArray;

