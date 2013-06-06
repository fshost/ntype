var path = require('path');

var chai = require('chai');
var expect = chai.expect;
chai.should();


describe('ntools.string', function () {

    var string = require(path.resolve(path.join(__dirname, '..'))).string;
    
    it('has method unescapeHtml', function () {
        string.unescapeHtml('baseline').should.equal('baseline');
        string.unescapeHtml('&lt;div&gt;').should.equal('<div>');
    });

    it('has method escapeHtml', function () {
        string.escapeHtml('baseline').should.equal('baseline');
        string.escapeHtml('<div>').should.equal('&lt;div&gt;');
    });

    it('has method removeBOM', function () {
        string.removeBOM('baseline').should.equal('baseline');
        string.removeBOM('\uFEFFtest').should.equal('test');
    });

    it('has method removeLineBreaks', function () {
        string.removeLineBreaks('baseline').should.equal('baseline');
		string.removeLineBreaks('\ntest\n\r').should.equal('test');
    });

    it('has method camelize', function () {
        string.camelize('baseline').should.equal('baseline');
        string.camelize('test-id').should.equal('testId');
        string.camelize('test.id', '.').should.equal('testId');
	});

})