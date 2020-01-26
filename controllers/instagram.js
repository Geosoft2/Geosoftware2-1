// jshint esversion: 6
// jshint node: true
"use strict";

//Import modules
var cache = require('../middlewares/cache.js'); //cache middleware
const mongoose = require('mongoose');

//Import config files
var Tokens = require('../config/tokens.js'); //Access Tokens
//Import Models
var InstaModel = require('../models/instagram.js'); //MongoDB Schema definition to save instagram posts

//use the request package
const request = require('request');

/**
 * @desc function to get all instagram post from known users
 * @param {json} req 
 * @param {json} res Contains all instagram posts found by the Search API
 */
exports.getV1instagram = (req, res) => {
  
  var allTokens = InstaModel.find({}).toArray(function(err, result) {
  if (err) throw err;
  console.log(result);
  db.close();
});
var allInstaTokens = [];

  //TODO: alle user könnne sich mit ihrer Instagram account anmelden dieser wird dann in der datenbank gespeichert wenn das alles so safe ist
  for (i=0; i < allInstaTokens.length; i++){
    request('https://api.instagram.com/v1/users/self/media/recent/?access_token='+ allInstaTokens[i.accesstoken], (err, res1, body)=>{
      console.log(body);
    });
  }
};
