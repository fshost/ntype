var path = require('path');

var chai = require('chai');
var expect = chai.expect;
chai.should();

function fpath (filename) {
    return path.join(__dirname, 'fixtures', filename);
}


describe('ntools.fs', function () {

    var fs = require(path.join(__dirname, '..')).fs;
    
    it('should have the Node.js fs methods', function () {
        fs.readFile.should.be.a('function');
        fs.writeFile.should.be.a('function');
        fs.readFileSync.should.be.a('function');
        fs.writeFileSync.should.be.a('function');
    });

    it('should have the Node.js path methods', function () {
        fs.resolve.should.be.a('function');
        fs.join.should.be.a('function');
        fs.sep.should.be.a('string');
    });

    describe('text method', function () {
       
        var result;

        it('should read files asynchronously and return the contents as a string', function () {
            result = fs.text(fpath('index.html'));
            result.should.be.a('string');
            result.should.equal('<!DOCTYPE html><html><head><title></title></head><body></body></html>');
        });

        it('should automatically remove Byte Order Mark, if present', function () {
            result.indexOf('\uFEFF').should.equal(-1);
        });

    });

})