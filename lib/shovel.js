'use strict';

var URL = require('url');
var cheerio = require('cheerio');
var request = require('request');
var Promise = require('promise');
var _ = require('lodash');

module.exports = shovel;


/**
 * Extracts data from a web page using CSS selectors
 * @param {String}      url  The URL to start the crawler from
 * @param {Object}      options.structure   Structure to extract
 * @param {string}      options.parent      Parent selector to extract the data from
 * @param {string}      [options.next]      Selector for "Next button"
 * @param {number}      [options.number]    Number of objects to extract
 * @param {Object[]}    [existingResults]   Add results to this array
 *                                          (useful for recursion)
 */
function shovel(url, options, existingResults) {
    return new Promise(function(resolve, reject) {
        download(url).then(function(body) {
            var extracted = extract(body, options, existingResults);
            if(!extracted.next) {
                resolve(extracted.results);   
            } else {
                var nextUrl = URL.resolve(url, extracted.next);
                shovel(nextUrl, options, extracted.results)
                    .then(function(results) {
                        resolve(results); 
                    }, function(error) {
                        reject(error);
                    });
            }
        } , reject);        
    });
};


/**
 * Downloads an URL
 * @param {string} url
 */
function download(url) {
    return new Promise(function(resolve, reject){
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("Downloaded " + url);
                resolve(body, response);
            }
            else {
                reject(error, response);
            }
        });
    });
}


/**
 * Extracts data in a HTML text using options
 * @param {Object} options.structure    Structure to extract
 * @param {string} options.parent       Parent selector to extract the data from
 * @param {string} options.next         Selector for "Next button"
 * @param {number} options.number       Number of objects to extract 
 * @param {Array}  [existingResults]    <Existing results
 */
function extract(text, options, existingResults) {
    var parent = options.parent;
    var structure = options.structure;
    var number = options.number || 100;
    var nextSelector = options.nextSelector;
    
    var next = null;
    var results = existingResults || [];
    
    var $ = cheerio.load(text);
    $(parent).each(function(index) {
        if(results.length < number) {
            var currentObject = {};
            for(var key in structure) {
                var selector  = null;
                var extractor = null;
                if(typeof structure[key] === 'string'){
                    selector = structure[key];
                } else {
                    selector  = structure[key].selector;
                    extractor = structure[key].extractor;
                }
                var value =  $(this).find(selector);
                currentObject[key] = extractor ? extractor(value) : value.text() ;
            }
            results.push(currentObject);
        }
    });
    
    console.log("Found " + results.length + " elements ...");
    
    if(results.length < number) {
        next = $(nextSelector).attr('href');
        console.log("Next data set is at : " + next);
    }
    
    return {
        results: results,
        next: next
    };
}