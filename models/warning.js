// jshint esversion: 6
// jshint node: true
"use strict";

//Import modules
const Mongoose = require('mongoose');
const GeoJSON = require('mongoose-geojson-schema');

//Create new database schema to store warnings
const warningSchema = new Mongoose.Schema({
    type: String,
    id: String,
    geometry: Mongoose.Schema.Types.Geometry,
    geometry_name: String,
    properties: Object,
    bbox: [Number, Number, Number, Number]
});

//Export the database model
module.exports = Mongoose.model("warnings", warningSchema);