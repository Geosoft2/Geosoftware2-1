// jshint esversion: 6
// jshint node: true
"use strict";


/**
* @desc Geosoftware 2;
* application to render the test page
*/

/**
* @desc renders the test page
* @param {object} req request, containing information about the HTTP request
* @param {object} res response, to send back the desired HTTP response
*/
exports.getTestpage = (req, res) => {
    res.render('testpage', {
        title: 'testpage'
    });
};