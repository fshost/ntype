/***
* Test Descriptor ntype
*/
// test using node-tap
var test = require('tap').test,
    ntype = require('..');

test("Descriptor class", function (test) {

    var Descriptor = ntype.Descriptor;
    test.ok(Descriptor);

    var descriptor = new Descriptor({ name: 'property1', type: String });

    test.ok(descriptor instanceof Descriptor);
    test.equal(descriptor.getDescription(), 'property1 property');
    test.throws(function () { descriptor.error('invalid type'); });

    // test on object with descriptor property
    obj = { property1: 'jane' };
    test.deepEqual(descriptor.getSetValue(obj), obj);
    test.strictEqual(descriptor.getSetValue(obj), obj);

    // test on empty object
    var obj = {};
    test.deepEqual(descriptor.getSetValue(obj), obj);
    test.strictEqual(descriptor.getSetValue(obj), obj);

    // test on object without descriptor property
    obj = { otherProp: true };
    test.deepEqual(descriptor.getSetValue(obj), obj);
    test.strictEqual(descriptor.getSetValue(obj), obj);

    // test on obj with additional props
    obj = { property1: 'jane', otherProp: true };
    test.deepEqual(descriptor.getSetValue(obj), obj);
    test.strictEqual(descriptor.getSetValue(obj), obj);

    // test setting default
    obj = {};
    descriptor = new Descriptor({ name: 'property1', type: String, default: 'Jane' });
    test.equal(descriptor.getSetValue(obj).property1, 'Jane');

    // test missing required
    test.throws(function () {
        obj = {};
        descriptor = new Descriptor({ name: 'property1', type: String, required: true });
        descriptor.getSetValue(obj);
    });

    test.test("getSetValue method should return on object that has the descriptor applied", function (test) {

        function tDesc(Type, value, invalid, next) {
            var eObj,
                obj = { property1: value },
                descriptor = new Descriptor({ name: 'property1', type: Type });
            eObj = descriptor.getSetValue(obj);
            test.deepEqual(descriptor.getSetValue(obj), eObj);
            test.strictEqual(descriptor.getSetValue(obj), obj);

            if (!next) return tDesc([Type], [value], [invalid], true);
            else return true;
        }

        test.test("should distinguish all types properly", function (test) {
            function TestClass() { }
            var typeVal,
                invalid,
                testInst = new TestClass(),
                typeVals = {
                    bool: { Type: Boolean, value: true },
                    num: { Type: Number, value: -1 },
                    array: { Type: Array, value: [1, 2, 3] },
                    date: { Type: Date, value: new Date('1-11-2011') },
                    string: { Type: String, value: 'test string' },
                    object: { Type: Object, value: {} },
                    fn: { Type: Function, value: function test() { } },
                    regex: { Type: RegExp, value: /[a-z]/ },
                    customClass: { Type: TestClass, value: testInst }
                };
            
            function testTypes(typeVals) {
                // check every native type against every other native type
                // due to numeric relations to coerced true and false, and array indexes
                // we will try -1, 0, and 1 for numbers
                // similarly, we will check both true and false for booleans
                for (var type in typeVals) {
                    if (typeVals.hasOwnProperty(type)) {
                        for (var invalidType in typeVals) {
                            if (typeVals.hasOwnProperty(invalidType) && invalidType !== type) {
                                typeVal = typeVals[type];
                                invalid = typeVals[invalidType].value;

                                test.ok(tDesc(typeVal.Type, typeVal.value, invalid));

                                if (invalidType === 'num') {
                                    test.ok(tDesc(typeVal.Type, typeVal.value, 0));
                                    test.ok(tDesc(typeVal.Type, typeVal.value, 1));
                                }
                                else if (invalidType === 'bool') {
                                    test.ok(tDesc(typeVal.Type, typeVal.value, false));
                                }
                                if (type === 'num') {
                                    test.ok(tDesc(typeVal.Type, 0, invalid));
                                    test.ok(tDesc(typeVal.Type, 1, invalid));
                                }
                                else if (type === 'bool') {
                                    test.ok(tDesc(typeVal.Type, false, invalid));
                                }
                            }
                        }
                    }
                }
            }
            testTypes(typeVals);
            test.test("including extended numeric types", function (test) {
                typeVals = {
                    int: { Type: 'integer', value: 99 },
                    float: { Type: 'float', value: 7.62 },
                    bool: { Type: Boolean, value: true },
                    array: { Type: Array, value: [1, 2, 3] },
                    date: { Type: Date, value: new Date('1-11-2011') },
                    string: { Type: String, value: 'test string' },
                    object: { Type: Object, value: {} },
                    fn: { Type: Function, value: function test() { } },
                    regex: { Type: RegExp, value: /[a-z]/ },
                    customClass: { Type: TestClass, value: testInst }
                };
                testTypes(typeVals);
                test.end();
            });

            test.end();
        });

        test.end();

    });

    test.end();
});
