// jshint esversion: 6
// jshint node: true
"use strict";


const express = require('express');
const router = express.Router();

const testpageController = require('../controllers/testpage');

// renders the main page
router.get('/', testpageController.getTestpage);



module.exports = router;
