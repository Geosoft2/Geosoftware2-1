// jshint esversion: 6
// jshint node: true
"use strict";


/**
* @desc Geosoftware 2;
* application to render the index page
*/

/**
* @desc renders the index page
* @param {object} req request, containing information about the HTTP request
* @param {object} res response, to send back the desired HTTP response
*/
exports.getIndex = (req, res) => {
  res.render('index', {
    title: 'Index'
    });
};