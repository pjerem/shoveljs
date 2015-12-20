# shoveljs
Extracts data from web pages using CSS selectors.

## Usage
    npm install shoveljs

Using Shovel is pretty simple : 
You just have to define a starting URL to extract the data from, set the main
element you want to extract, define the structure of objects you want to get,
and, optionally, set the 'nextSelector', which will allow Shovel to extract more
data by using the pagination system provided by the target website.

## Example
``` JavaScript
var shovel = require('shoveljs);

var vdmposts = null;

shovel('http://m.viedemerde.fr/', {
    parent: '.content li', // Main elements we want to extract
    structure: {
        'post': '.text', // First .text in parent element will be saved into
                         // 'post' key.
                         
        // If it is not possible to extract data using a simple CSS selector
        // You can define an extractor : a function which accepts main
        // element jQuery (cheerio) instance from which you can extract the
        // data you want.
        'date': { 
            selector: '.date', 
            extractor: function($elm) {
                return $elm.text().substr(0,10);
            }
        },
        'author': {
            selector: '.date',
            extractor: function($elm) {
                // Author is inside .date, only separated
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
```
## Running tests
    git clone https://github.com/pjerem/shoveljs.git
    cd shoveljs
    npm test