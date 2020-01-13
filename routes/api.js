// jshint esversion: 6
// jshint node: true
"use strict";

//Import modules
const express = require('express'); //Express

//Import controllers
const APIController = require('../controllers/api.js');

//Define Variables
const router = express.Router();

//Routes
router.get('/', APIController.getApi) //Default Route -> render API documentation

router.post('/v1/twitter/tweets', APIController.getTweets); //Twitter -> getTweets

router.get('/v1/instagram/posts', APIController.getApi);

router.get('/v1/dwd/events', APIController.getApi);

module.exports = router;