var path = require('path');

var chai = require('chai');
var expect = chai.expect;
chai.should();

describe('ntools.object', function () {

    var object = require(path.join(__dirname, '..')).object;
    
    describe('extend method', function () {

        it('extends a target object with the properties of a source object', function () {
            var target = {
                attributes: {
                    classNames: ['test'],
                    data: [1, 2]
                },
                parentNode: {
                    tag: 'div',
                    childNodes: []
                }
            };
            var source = {
                tag: 'body',
                attributes: {
                    classNames: ['test2'],
                    data: [3]
                },
                parentNode: {
                    childNodes: [{
                        tag: 'li',
                        childNodes: []
                    }]
                }
            };
            var expected = {
                tag: 'body',
                attributes: {
                    classNames: ['test', 'test2'],
                    data: [1, 2, 3]
                },
                parentNode: {
                    tag: 'div',
                    childNodes: [{
                        tag: 'li',
                        childNodes: []
                    }]
                }
            };
            var result = object.extend(target, source);
            expect(result).to.deep.equal(expected);
        });

    });

    describe('clone method', function () {

        it('clones objects', function () {
            var source = {
                tag: 'div',
                childNodes: [{
                    tag: 'div',
                    childNodes: []
                }]
            };
            var result = object.clone(source);
            result.childNodes.should.not.equal(source.childNodes);
            expect(source).to.deep.equal(result);
        });

        it('clones arrays', function () {
            var source = ['test', [1, 2, { name: { first: 'jane', last: 'doe' } }], 2, 3];
            var expected = ['test', [1, 2, { name: { first: 'jane', last: 'doe' } }], 2, 3];
            var result = object.clone(source);
            expect(result).to.deep.equal(expected);
        });


    });

})