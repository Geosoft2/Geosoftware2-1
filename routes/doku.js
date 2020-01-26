// jshint esversion: 6
// jshint node: true
"use strict";


const express = require('express');
const router = express.Router();

// renders the documentation page
router.get('/', (req, res) => {
    res.render('doku', {
      title: 'Documentation'
      });
  });

module.exports = router;
