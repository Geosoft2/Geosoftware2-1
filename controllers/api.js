// jshint esversion: 6
// jshint node: true
"use strict";


/**
* @desc Geosoftware 2;
* application for the API routes
*/
var token = require('../config/token');


/**
* @desc
* @param {object} req request, containing information about the HTTP request
* @param {object} res response, to send back the desired HTTP response
*/
exports.getApi = (req, res) => {

};

exports.getV1 = (req, res) => {

};
exports.getV1twitter = (req, res) => {

};
//exports.getV1instagram (req, res) => {
//
//};
exports.getV1dwd = (req, res) => {

};
exports.getV1mapbox = (req, res) => {
    var mapbox_access_token = token.mapbox_access_token;

    const https = require('https')
    const options = {
      hostname: 'https://api.mapbox.com',
      access_token: mapbox_access_token,
      path: '/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}',
      method: 'GET'
    }
    const req_map = https.request(options, res_map => {
      console.log(`statusCode: ${res_map.statusCode}`)

      res_map.on('data', d => {
        process.stdout.write(d)
      })
    })

    req_map.on('error', error => {
      console.error(error)
    })
    req_map.end()
};