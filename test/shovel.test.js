var chai = require('chai');

var rewire = require("rewire");
var shovel = rewire('../lib/shovel');

chai.should();


describe('shovel.js', function() {
    describe('shovel()', function() {
        it('should return a promise', function() {
            shovel().should.have.property('then');
        });
        
    });
    
    describe('download()', function() {
        it('should return a promise', function() {
            shovel.__get__('download')().should.have.property('then');
        });
        
    });
    
});