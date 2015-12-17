'use strict';

var cheerio = require('cheerio');
var request = require('request');
var Promise = require('promise');
var _ = require('lodash');

/**
 * Extracts data from a web page using a
 */
 
var shovel = module.exports = function shovel(url, options) {
    return new Promise(function(resolve, reject) {
            download(url).then(extract(options) ,function(error) {
                console.log('Error: ', error);
            });        
    });
};

/**
 * Downloads an URL
 * @param {string} url
 */
var download = function(url) {
    return new Promise(function(resolve, reject){
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body, response);
            }
            else {
                reject(error, response);
            }
        });
    });
}

/**
 * Extracts data in a text using options
 * @param {Object} options.structure    Structure to extract
 * @param {string} options.parent       Parent selector to extract the data from
 * @param {string} options.next         Selector for "Next button"
 * @param {number} options.number       Number of objects to extract 
 */
var extract = _.curryRight(function(text, options) {
    var parent = options.parent;
    var structure = options.structure;
    var number = options.number;
    var nextSelector = options.nextSelector;
    
    var results = [];
    
    var $ = cheerio.load(text);
    $(parent).each(function(index) {
        var currentObject = {};
        for(var key in structure) {
            var selector = structure[key];
            currentObject[key] = $(this).find(selector).text();
        }
        results.push(currentObject);
    });
    
    console.log(results);
    return results;
});

var test = shovel('http://monip.org', {
    parent: 'font',
    structure: {
        'myI': 'i'
    },
    next: null,
    max: null,
});

console.log(test);