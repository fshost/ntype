var path = require('path');

var chai = require('chai');
var expect = chai.expect;
chai.should();

describe('ntools.array', function () {

    var array = require(path.join(__dirname, '..')).array;

    describe('extend method', function () {

        it('extends a target array with items of a source array', function () {
            var target = [1, 2, 3];
            var source = [1, 4, 5, 6, 7];
            
            var expected = [1, 2, 3, 4, 5, 6, 7];

            var result = array.extend(target, source);
            expect(result).to.deep.equal(expected);
        });

    });

    describe('clone method', function () {

        var person = { name: { first: 'jane', last: 'doe' } };
        var list = [1, 2, person];
        var source = [person, list, 2, 3];
        var expected = [{ name: { first: 'jane', last: 'doe' } }, [1, 2, { name: { first: 'jane', last: 'doe' } }], 2, 3];
        var result = array.clone(source);

        it('clones an array', function () {
            expect(result).to.deep.equal(expected);
        });

        it('deep clones arrays and objects in the array by default', function () {
            result[0].should.not.equal(person);
            result[1].should.not.equal(list);
            result[1][2].should.not.equal(person);
        });

        it('can shallow clone arrays and objects in the array if passed true as second argument', function () {
            var result = array.clone(source, true);
            expect(result).to.deep.equal(expected);
            result[0].should.equal(person);
            result[1].should.equal(list);
            result[1][2].should.equal(person);
        });

    });


})