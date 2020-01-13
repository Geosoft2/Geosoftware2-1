// jshint esversion: 6
// jshint node: true
"use strict";

const router = require('express').Router();

const APIController = require('../controllers/api');

router.get('/', APIController.getApi);

// API routes for Version 1.0
router.get('/v1', APIController.getV1);
router.get('/v1/twitter', APIController.getV1twitter);
//router.get('/v1/instagram', APIController.getV1instagram);
router.get('/v1/dwd', APIController.getV1dwd);
router.get('/v1/mapbox', APIController.getV1mapbox);

module.exports = router;
