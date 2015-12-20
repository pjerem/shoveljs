var shovel = require('./lib/shovel');

var vdmposts = null;

shovel('http://m.viedemerde.fr/', {
    parent: '.content li',
    structure: {
        'post': '.text',
        'date': { 
            selector: '.date', 
            extractor: function($elm) {
                return $elm.text().substr(0,10);
            }
        },
        'author': {
            selector: '.date',
            extractor: function($elm) {
                // Not really proud of this one, but VDM should be ashamed about 
                // their HTML structure : Author is inside .date, only separated
                // by a <br> tag. Not any logic here.
                return $elm.text().replace(/[0-9]*\/[0-9]*\/[0-9]*/g,'');
            }
        }
    },
    nextSelector: '.pagination.right a',
    number: null,
}).then(function(results) {
    vdmposts = results;
    console.log("Results: ", vdmposts);
}, function(error) {
    console.log("Error",error);
});