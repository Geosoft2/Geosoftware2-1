// jshint esversion: 6
// jshint node: true
"use strict";

//Import modules
const WFS = require('wfs'); //wfs library to request data from DWD's wfs service

//Import config files

//Import Models
const WarningModel = require('../models/warning.js'); //MongoDB Schema definition to store dwd warnings

exports.requestDWDWarnings = async (req, res) => {
    WFS.getFeature({
        url: 'https://maps.dwd.de/geoserver/dwd/ows',
        typeName: 'dwd:Warnungen_Landkreise',
        service: 'WFS',
        request: 'GetFeature',
        format_options: 'callback:getJson',
        SrsName: 'EPSG:4326'
    }, async (error, res) => {
        if (error) {
            console.log(error)
        } else {
            await WarningModel.deleteMany({});
            var warnings = res.features;
            warnings.forEach((warning) => {
                var file = {
                    type: warning.type,
                    id: warning.id,
                    geometry: warning.geometry,
                    geometry_name: warning.geometry_name,
                    properties: warning.properties,
                    bbox: warning.bbox
                };
                //Add file to MongoDB
                WarningModel.create(file)
                    .catch(error => console.log("Error: Warning could not be inserted into database. " + error));
            });
        }
    });
    res.send({});
};

exports.loadDWDWarnings = async (req, res) => {
    let result = await WarningModel.find({}).exec();

    let collection = {
        "type": "FeatureCollection",
        "features": result
    };

    res.json(collection);
};

exports.requestDWDPrecipitation = (req, res) => {
    WFS.getFeature({
        url: 'https://maps.dwd.de/geoserver/dwd/ows',
        typeName: 'dwd:Warnungen_Landkreise',
        service: 'WFS',
        request: 'GetFeature',
        format_options: 'callback:getJson',
        SrsName: 'EPSG:4326'
    }, async (error, res) => {
        if (error) {
            console.log(error)
        } else {
            await WarningModel.deleteMany({});
            var warnings = res.features;
            warnings.forEach((warning) => {
                var file = {
                    type: warning.type,
                    id: warning.id,
                    geometry: warning.geometry,
                    geometry_name: warning.geometry_name,
                    properties: warning.properties,
                    bbox: warning.bbox
                };
                //Add file to MongoDB
                WarningModel.create(file)
                    .catch(error => console.log("Error: Warning could not be inserted into database. " + error));
            });
        }
    });
    res.send();
};

exports.loadDWDPrecipitation = (req, res) => {

}