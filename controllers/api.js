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
* @desc
* @param {object} req request, containing information about the HTTP request
* @param {object} res response, to send back the desired HTTP response
*/
exports.getApi = (req, res) => {

};

exports.getV1 = (req, res) => {

};

/**
 * @desc Requests Tweets directly from Twitter's Search API
 * @param {json} req Contains all necessary parameters for the tweet search
 * @param {json} res Contains all tweets found by the Search API
 */
exports.getV1twitter = (req, res) => {
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

//exports.getV1instagram (req, res) => {
//
//};

exports.getV1dwd = (req, res) => {
//TODO: die cache lebenszeit für dwd daten auf 5 minuten stellen da laut doc die daten nicht enger aktuallisiert werden
};
exports.getV1mapbox = (req, res) => {
  const https = require('https')
  const options = {
    hostname: 'https://api.mapbox.com',
    access_token: Tokens.mapbox_accessToken,
    path: '/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}',
    method: 'GET'
  }
  const req_map = https.request(options, res_map => {
    console.log(`statusCode: ${res_map.statusCode}`)

    res_map.on('data', d => {
      process.stdout.write(d)
    })
  })

  req_map.on('error', error => {
    console.error(error)
  })
  req_map.end()
  res.render('doku', {
    title: 'Documentation'
  });
};