// jshint esversion: 6
// jshint node: true
"use strict";

//Import modules
const express = require('express'); //Express

//Import controllers
const APIController = require('../controllers/api.js');
//const instagramController = require('../controllers/instagram.js');
const FlickrController = require('../controllers/flickr.js');
const TwitterController = require('../controllers/twitter.js');
const DWDController = require('../controllers/dwd.js');

//Define Variables
const router = express.Router();

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

router.get('/v1/flickr', FlickrController.loadPhotos)

router.post('/v1/twitter/init', TwitterController.requestTweets);

router.get('/v1/twitter/tweets', TwitterController.loadTweets);

router.post('/v1/dwd/events/init', DWDController.requestDWDWarnings);

router.get('/v1/dwd/events/warnings', DWDController.loadDWDWarnings);

router.post('/v1/dwd/radar/init', DWDController.requestDWDPrecipitation);

router.get('/v1/dwd/radar/precipitation', DWDController.loadDWDPrecipitation);

module.exports = router;