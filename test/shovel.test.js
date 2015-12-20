var expect = require('chai').expect;

var rewire = require("rewire");
var shovel = rewire('../lib/shovel');


/**
 * Here we get the "extract" inner function thanks to rewire
 */
var extract = shovel.__get__('extract');


/**
 * Here we define some sample data
 */
var testStructure = {
    parent: 'li',
    nextSelector: 'a',
    number: 42,
    structure: {
        'letter': 'span',
        'number': 'div'
    }
};

var testString = [
    '<html><body><ul>',
    '<li><span>titi</span><div>tata</div></li>',
    '<li><span>toto</span><div>tutu</div></li>',
    '</ul><a href="/page/teuteu">Next</a>',
    '</body></html>'
    ].join();


/**
 * And here wo go for testing !
 */
describe('shovel.js', function() {
    before(function() {
        // Mocking the request module to not make real HTTP requests while 
        // we run the tests. Thanks to Rewire.
        shovel.__set__('request', function(url, callback) {
            var pageNumber = parseInt(url.split('page/')[1], 10) || 0;
            var body = [
                '<html><body><ul>',
                '<li><span>a</span><div>' + pageNumber+ '</div></li>',
                '<li><span>b</span><div>' + pageNumber+ '</div></li>',
                '</ul><a href="/page/' + (pageNumber + 1) + '">Next</a>',
                '</body></html>'
                ].join();
            callback(null, {statusCode: 200}, body);
        });
    });
    
    
    describe('shovel()', function() {
        it('should return a promise', function() {
            expect(shovel()).to.have.property('then');
        });
        
        it('should return the correct data set', function(done) {
            shovel('http://foo.bar/', testStructure)
                .then(function(results) {
                   expect(results.length).to.equal(42);
                   expect(results[3]).to.eql({letter: 'b', number:'1'});
                   done();
                });
        });
    });
    
    describe('extract()', function() {
        it('should extract the correct data from a page', function() {
            var extr = extract(testString, testStructure);
            expect(extr.results.length).to.equal(2);
            expect(extr.results[1]).to.eql({letter: 'toto', number:'tutu'});
            expect(extr.next).to.eql('/page/teuteu');
        });
        
        it('should append the extracted data to the right array', function() {
            var existingResults = [{letter: 'foo', number:'bar'}];
            var extr = extract(testString, testStructure, existingResults);
            
            //We must get the same array reference
            expect(existingResults).to.equals(extr.results);
            expect(extr.results.length).to.equal(3);
        });
    });
    
});