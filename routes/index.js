// jshint esversion: 6
// jshint node: true
"use strict";


const express = require('express');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
const router = express.Router();

const IndexController = require('../controllers/index');

// renders the main page
router.get('/', IndexController.getIndex);

router.get('/test', IndexController.getTest);

module.exports = router;
