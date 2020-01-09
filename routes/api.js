// jshint esversion: 6
// jshint node: true
"use strict";

const router = require('express').Router();

const APIController = require('../controllers/api');

// renders the documentation page
router.get('/', APIController.getApi);
router.get('/twitter', APIController.getApi);
//router.get('/instagram', APIController.getApi);
router.get('/dwd', APIController.getApi);

module.exports = router;
