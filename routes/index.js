// jshint esversion: 6
// jshint node: true
"use strict";


const express = require('express');
const router = express.Router();

const IndexController = require('../controllers/index');

// renders the main page
router.get('/', IndexController.getIndex);

router.get('/test', IndexController.getTest);

module.exports = router;
