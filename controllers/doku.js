// jshint esversion: 6
// jshint node: true
"use strict";


/**
* @desc Geosoftware 2;
* application to render the documentation page
*/



/**
* @desc renders the documentation page
* @param {object} req request, containing information about the HTTP request
* @param {object} res response, to send back the desired HTTP response
*/
exports.getDoku = (req, res) => {
  res.render('doku', {
    title: 'Documentation'
    });
};
