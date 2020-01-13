// jshint esversion: 6
// jshint node: true
"use strict";

//Import modules
var Twit = require('twit'); //twit library to access the Twitter API

//Import config files
var Tokens = require('../config/tokens.js'); //Access Tokens

//Import Models
var TweetModel = require('../models/tweet.js'); //MongoDB Schema definition to save tweets

//Define Variables
//Create new twit instance
var TwitClient = new Twit({
  consumer_key: Tokens.twitter_consumer_key,
  consumer_secret: Tokens.twitter_consumer_secret,
  access_token: Tokens.twitter_access_token,
  access_token_secret: Tokens.twitter_access_token_secret
});

/**
* @desc renders the documentation page
* @param {object} req request, containing information about the HTTP request
* @param {object} res response, to send back the desired HTTP response
*/
exports.getApi = (req, res) => {
  res.render('doku', {
    title: 'Documentation'
  });
};

/**
 * @desc Requests Tweets directly from Twitter's Search API
 * @param {json} req Contains all necessary parameters for the tweet search 
 * @param {json} res Contains all tweets found by the Search API
 */
exports.getTweets = (req, res) => {
  const query = req.body; //Unfiltered tweets from Twitter

  TwitClient.get('search/tweets', query, dataReceived);

  function dataReceived(error, data, res) {
    const raw = data.statuses; //Unfiltered tweets directly received from Twitter API

    if (raw.length == 0) { //If there are no tweets, do nothing
      console.log("No new tweets available.");
    } else { //Else filter the tweets
      //Filter tweets by storing only geolocated tweets (geo or place not empty)
      raw.forEach((tweet) => {
        if ((tweet.geo != null) || (tweet.place != null)) {
          //TODO: STORE DATA

          /* //Create new file for MongoDB
          var file = {
            id: tweet.id_str, //Tweet ID (String)
            geo: JSON.stringify(tweet.geo), //Geo coordinates [LAT,LON]
            place: JSON.stringify(tweet.place) //Place polygon (GeoJSON object)
          };

          //Add file to MongoDB
          TweetModel.create(file)
            .catch(error => console.log("Error: Tweet could not be inserted into database. " + error)); */
        };
      });
    };
  };

  //TODO: Send Tweets back to client
};