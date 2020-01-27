// jshint esversion: 6
// jshint node: true
"use strict";

/**
 * This module provides URLs to connect to MongoDB.
 */

module.exports = {
    dblocalhost: 'mongodb://localhost:27017/salus', //if app is running locally
    dbdocker: 'mongodb://mongo/salus' //if app is running within a docker container
};