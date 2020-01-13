// jshint esversion: 6
// jshint node: true
"use strict";

const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
    id: String,
    geo: String,
    place: String
});

const tweetModel = mongoose.model("TweetModel", tweetSchema);

module.exports = tweetModel;