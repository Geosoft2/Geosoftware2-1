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

router.get('/v1/twitter', APIController.getV1twitter);
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


router.get('/v1/dwd', APIController.getV1dwd)
router.get('/v1/mapbox', APIController.getV1mapbox)

module.exports = router;