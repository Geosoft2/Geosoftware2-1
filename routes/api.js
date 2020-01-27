// jshint esversion: 6
// jshint node: true
"use strict";

//Import modules
const express = require('express'); //Express

//Import controllers
const APIController = require('../controllers/api.js');
//const instagramController = require('../controllers/instagram.js');
const flickrController = require('../controllers/flickr.js');
//Define Variables
const router = express.Router();

//Routes
router.get('/', APIController.getApi) //Default Route -> render API documentation

// API routes for Version 1.0
router.get('/v1', APIController.getV1);

/*
router.get('/v1/instagram/alluser', instagramController.getV1instagram);
*/
/*
router.get('/v1/instagram', (req, res) => {
});
*/
/*
router.delete("/v1/instagram/:user", (req, res) => {
});
*/

router.get('/v1/flickr/public', flickrController.getPublic);
router.get('/v1/flickr', flickrController.loadPhotos)

router.post('/v1/twitter/init', APIController.postV1TwitterInit);

router.get('/v1/twitter/tweets', APIController.getV1TwitterTweets);

router.post('/v1/dwd/events/init', APIController.postV1DWDEventsInit);

router.get('/v1/dwd/events/warnings', APIController.getV1DWDEventsWarnings);

router.post('/v1/dwd/radar/init', APIController.postV1DWDRadarInit);

router.get('/v1/dwd/radar/precipitation', APIController.getV1DWDRadarPrecipitation);

//router.get('/v1/mapbox/:style/:tilesize/:scale', APIController.getV1mapbox);

module.exports = router;