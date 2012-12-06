/***
* Test classify library methods
*/
var test = require('tap').test,
    ntype = require('..');

test("ntype module", function (test) {
    test.test("Type", function (test) {
        test.ok(ntype.Type);
        test.equal(ntype.Type[Object], 'object');
        test.equal(ntype.Type[Array], 'array');
        test.equal(ntype.Type[Date], 'date');
        test.equal(ntype.Type[Function], 'function');
        test.equal(ntype.Type[RegExp], 'regexp');
        test.equal(ntype.Type[Boolean], 'boolean');
        test.equal(ntype.Type[String], 'string');
        test.equal(ntype.Type[Number], 'number');
        test.end();
    });

    test.test("type", function (test) {
        var type = ntype.type;
        test.ok(type);
        test.equal(type(undefined), 'undefined');
        test.equal(type(null), 'null');
        test.equal(type(NaN), 'NaN');
        test.equal(type('test string'), 'string');
        test.equal(type(new Date('1-1-2011')), 'date');
        test.equal(type(function test() { }), 'function');
        test.equal(type(true), 'boolean');
        test.equal(type(false), 'boolean');
        test.equal(type(-1), 'number');
        test.equal(type(0), 'number');
        test.equal(type(1), 'number');
        test.equal(type(9999), 'number');
        test.equal(type([1, 2, 3]), 'array');
        test.equal(type(['a', 'b', 'c']), 'array');
        test.equal(type(/[a-z]/), 'regexp');
        test.equal(type({}), 'object');
        test.equal(type({ foo: 'bar' }), 'object');
        test.end();
    });

    test.test("hasValue", function (test) {
        var hasValue = ntype.hasValue;
        test.ok(hasValue);
        test.equal(hasValue(null), false);
        test.equal(hasValue(undefined), false);
        test.equal(hasValue(27), true);
        test.equal(hasValue(new Date()), true);
        test.equal(hasValue({}), true);
        test.equal(hasValue([]), true);
        test.equal(hasValue('string'), true);
        test.equal(hasValue(''), true);
        test.equal(hasValue(function () { }), true);
        test.end();
    });

    test.end();

});

