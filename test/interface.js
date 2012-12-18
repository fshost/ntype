/***
* Test Interface ntype
*/
// test using node-tap
var test = require('tap').test,
    ntype = require('..'),
    Descriptor = ntype.Descriptor,
    Interface = ntype.Interface

test("Interface class", function (test) {

    test.ok(Interface);

    var ITest = new Interface({
        property1: String,
        property2: Number
    });

    test.equal(ITest.descriptors.length, 2);
    test.ok(ITest.descriptors[0] instanceof Descriptor);
    test.test("constructor should be strict in regards to types", function (test) {
        test.throws(function () {
            new Interface({ required: 'false' }, { url: String });
        });
        test.throws(function () {
            new Interface({ validator: true }, { url: String });
        });
        test.throws(function () {
            new Interface({}, {});
        });
        test.end();
    });
    test.test("required option propagates to all descriptors", function (test) {
        ITest = new Interface({ required: true }, {
            property1: String,
            property2: Number
        });
        test.strictEqual(ITest.descriptors[0].required, true);
        test.strictEqual(ITest.descriptors[1].required, true);
        test.end();
    });
    test.test("basic validation for required and property types", function (test) {
        // missing required
        test.throws(function () {
            ITest.validate({ property1: 'jane' });
        });
        test.throws(function () {
            ITest.validate({ property2: 21 });
        });
        // invalid types
        test.throws(function () {
            ITest.validate({ property1: 21, property2: 21 });
        });
        test.throws(function () {
            ITest.validate({ property1: 'jane', property2: 'doe' });
        });
        test.test("should be able to specify class constructor as a type, as well as Date and RegExp", function (test) {
            function TestClass() { };
            var testInstance = new TestClass;
            ITest = new Interface({ required: true }, {
                property1: Function,
                property2: Date,
                property3: RegExp,
                property4: TestClass
            });
            ITest.validate({ property1: function () { }, property2: new Date('1-11-2011'), property3: /_$/, property4: testInstance });
            test.throws(function () {
                ITest.validate({ property1: function () { }, property2: '1-11-2011', property3: /_$/, property4: testInstance });
            });
            test.throws(function () {
                ITest.validate({ property1: function () { }, property2: new Date('1-11-2011'), property3: '_', property4: testInstance });
            });
            test.throws(function () {
                ITest.validate({ property1: function () { }, property2: new Date('1-11-2011'), property3: '_', property4: {} });
            });
            test.end();
        });
        test.end();
    });

    test.test("validation for interface types", function (test) {
        
        var ISubTest = new Interface({
                name: { type: String, default: 'name' },
                age: { type: Number, required: true }
            }),
            ITest = new Interface({ required: true }, {
                property1: String,
                property2: ISubTest
            });
            ITest.validate({ property1: 'jane', property2: { age: 27 }})
            test.throws(function () {
                ITest.validate({ property1: 'jane', property2: 27 });
            });
            test.throws(function () {
                ITest.validate({ property1: 'jane' })
            });
            test.end();
    });

    test.test("can require properties that do not have a specified type, or 'any' type", function (test) {
        ITest = new Interface({
            property1: { required: true },
            property2: String,
            property3: 'any'
        });
        ITest.validate({ property1: 'jane', property2: 'doe' });
        ITest.validate({ property1: 27, property2: 'doe', property3: 'jane' });
        // required should require a value even if no type is specified
        test.throws(function () {
            ITest.validate({ property2: 'doe' });
        });
        test.end();
    });

    test.test("validate option can specify validator for the interface", function (test) {
        var validator = function validator(value, descriptor) {
            return descriptor.name === 'property1' || descriptor.name === 'property2';
        };
        ITest = new Interface({
            validator: validator
        }, {
            property1: String,
            property2: Number
        });
        test.test("validate option propagates to all descriptors", function (test) {
            test.strictEqual(ITest.descriptors[0].validator, validator);
            test.strictEqual(ITest.descriptors[1].validator, validator);
            test.end();
        });
        ITest.validate({ property1: 'jane' });
        // ensure the descriptors share the same validate method if passed as global option
        test.strictEqual(ITest.descriptors[0].validate, ITest.descriptors[1].validate);
        test.ok(ITest = new Interface({
            validator: validator
        }, {
            property1: String,
            property2: Number,
            property3: String
        }));
        // property3 will not be defined invalid by the validate function
        test.throws(function () {
            ITest.validate({ property1: 'jane', property2: 27, property3: 'not allowed' });
        });
        // properties not defined by the interface should not be tested by the interface
        test.ok(ITest.validate({ property1: 'jane', property2: 27, property4: 'doe' }));
        test.end();
    });
    test.test("interfaces can extend parent interfaces", function (test) {
        test.ok(ITest = new Interface({
            required: true
        }, {
            property1: String,
            property2: Number
        }));
        var ITest2 = new Interface({ extends: ITest }, {
            property2: { required: false },
            property3: Function
        });
        // should extend by name, so existing should merge
        test.equal(ITest2.descriptors.length, 3);
        test.strictEqual(ITest2.descriptors[0].required, true);
        // parent defaults should be overwritten
        test.strictEqual(ITest2.descriptors[1].required, false);
        test.ok(!ITest2.descriptors[2].required);
        test.end();
    });
    test.test("interfaces can extend other interfaces", function (test) {
        var ILink = new Interface({ required: true }, {
            url: String,
            text: String
        });
        // original interface should be as defined
        test.equal(ILink.descriptors.length, 2);
        test.equal(ILink.descriptors[0].name, 'url');
        test.equal(ILink.descriptors[1].name, 'text');
        var IPicLink = new Interface({ extends: ILink }, {
            text: { required: false },
            imgUrl: { type: String, required: true }
        });
        test.ok(IPicLink);
        // original interface should not be modified
        test.equal(ILink.descriptors.length, 2);
        test.equal(ILink.descriptors[0].name, 'url');
        test.equal(ILink.descriptors[1].name, 'text');
        test.equal(ILink.descriptors[0].type, 'string');
        test.equal(ILink.descriptors[1].type, 'string');
        test.equal(ILink.descriptors[0].required, true);
        test.equal(ILink.descriptors[1].required, true);

        // extended interface should include parent descriptors
        test.equal(IPicLink.descriptors[0].name, 'url');
        test.equal(IPicLink.descriptors[1].name, 'text');
        // and child descriptors
        test.equal(IPicLink.descriptors[2].name, 'imgUrl');
        // extended descriptors should overwrite specified attributes
        test.equal(IPicLink.descriptors[1].required, false);
        test.end();
    });
    test.end()
});
