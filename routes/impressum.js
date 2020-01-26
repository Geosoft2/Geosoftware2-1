// jshint esversion: 6
// jshint node: true
"use strict";

const express = require('express');
const router = express.Router();

//@description function to render the imprint (Impressum of the application)
router.get('/', (req, res) => {
    res.render('impressum', {
      title: 'Impressum'
      });
  });

module.exports = router;
