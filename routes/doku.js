// jshint esversion: 6
// jshint node: true
"use strict";


const express = require('express');
const router = express.Router();

const DokuController = require('../controllers/doku');


// renders the documentation page
router.get('/', DokuController.getDoku);

module.exports = router;
