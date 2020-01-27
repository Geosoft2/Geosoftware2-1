// jshint esversion: 6
// jshint node: true
"use strict";

//Import modules
const Mongoose = require('mongoose');

//Create new database schema to store tweets
const precipitationSchema = new Mongoose.Schema({
});

//Export the database model
module.exports = Mongoose.model("precipitation", precipitationSchema);