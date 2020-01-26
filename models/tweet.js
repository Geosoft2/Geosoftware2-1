// jshint esversion: 6
// jshint node: true
"use strict";

//Import modules
const Mongoose = require('mongoose');
const GeoJSON = require('mongoose-geojson-schema');

//Create new database schema to store tweets
const tweetSchema = new Mongoose.Schema({
    id: String,
    location: Mongoose.Schema.Types.Mixed,
    text: String,
    language: String,
    date: Date
});

//Export the database model
module.exports = Mongoose.model("tweet", tweetSchema);