var path = require('path');

var chai = require('chai');
var expect = chai.expect;
chai.should();

describe('ntools.class', function () {

    var nclass = require(path.join(__dirname, '..')).class;
   
    var obj = { greet: function () { console.log('hello'); }, number: 1 };

    describe('mixin method', function () {
        function TestClass() { }
        nclass.mixin(TestClass, obj);
        TestClass.prototype.number = 7;
        var instance = new TestClass();

        it('should extend a constructor prototype with source properties', function () {
            TestClass.prototype.greet.should.equal(obj.greet);
            instance.number.should.equal(7);
            instance.greet.should.equal(obj.greet);
        });

        it('should not set the constructor prototype to be the mixin source', function () {
            TestClass.prototype.should.not.equal(obj);
            obj.number.should.equal(1);
        });
    });

    describe('classify method', function () {
        

        it('should accept a constructor argument and return a constructor function', function () {
            function TestClass() { }
            var ClassifiedTestClass = nclass.classify(TestClass);
            ClassifiedTestClass.should.be.a('function');
        });

        it('should return a constructor function that is chainable with the mixin method', function () {
            function TestClass() { }
            var ClassifiedTestClass = nclass.classify(TestClass).mixin(obj);
            ClassifiedTestClass.should.be.a('function');
            ClassifiedTestClass.prototype.number = 7;
            var instance = new ClassifiedTestClass();
            ClassifiedTestClass.prototype.greet.should.equal(obj.greet);
            instance.number.should.equal(7);
            instance.greet.should.equal(obj.greet);
            ClassifiedTestClass.prototype.should.not.equal(obj);
            obj.number.should.equal(1);
        });

        it('the mixin method should be chainable multiple times', function () {
            function TestClass() { }
            var obj2 = { age: 22 };
            var ClassifiedTestClass = nclass.classify(TestClass).mixin(obj).mixin(obj2);
            ClassifiedTestClass.should.be.a('function');
            ClassifiedTestClass.prototype.number = 7;
            var instance = new ClassifiedTestClass();
            ClassifiedTestClass.prototype.greet.should.equal(obj.greet);
            ClassifiedTestClass.prototype.age.should.equal(obj2.age);
            instance.number.should.equal(7);
            instance.greet.should.equal(obj.greet);
            instance.age.should.equal(22);
            ClassifiedTestClass.prototype.should.not.equal(obj);
            obj.number.should.equal(1);
        });

    });

})